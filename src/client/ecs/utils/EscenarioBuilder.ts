import { ECSManager } from "../core/ECSManager";
import { ColoresRed } from "../../data/colores";
import { APPS } from "../../data/apps";
import {
  TransformComponent,
  DispositivoComponent,
  EspacioComponent,
  OficinaComponent,
  ZonaComponent,
  EscenarioComponent,
  AtaqueComponent,
  FaseComponent,
  WorkstationComponent,
  RouterComponent,
  ActivoComponent,
  EventoComponent,
  VPNGatewayComponent,
  ClienteVPNComponent,
  PersonaComponent,
} from "../components";
import type { ComponenteContainer, Entidad } from "../core/Componente";
import { type Activo, type Dispositivo, type Escenario, type ObjetivoFase, type SoftwareApp } from "../../shared/types/EscenarioTypes";
import { SistemaJerarquiaEscenario } from "../systems/SistemaJerarquiaEscenario";
import {
  TipoAtaque,
  TipoDispositivo,
  EstadoAtaqueDispositivo,
  TipoEvento,
  NivelConcienciaSeguridad,
} from "../../shared/types/DeviceEnums";
import { RedComponent } from "../components/RedComponent";
import { FirewallBuilder } from "./FirewallBuilder";
import { SistemaRelaciones } from "../systems";
// import { TipoProtocolo } from "../../types/TrafficEnums";
import { AccionFirewall, DireccionTrafico } from "../../shared/types/FirewallTypes";
import { FirewallConfigService } from "../systems/red";

/**
 * Builder para crear escenarios de forma declarativa y simple
 * Facilita la construcción inicial y modificaciones posteriores
 *
 * Usa el SistemaJerarquiaEscenario centralizado del ECSManager para
 * mantener las relaciones jerárquicas de forma consistente.
 */
export class EscenarioBuilder {
  private ecsManager: ECSManager;
  private sistemaJerarquia: SistemaJerarquiaEscenario;
  private entidadRedInternet: Entidad = -1;

  constructor(ecsManager: ECSManager) {
    this.ecsManager = ecsManager;

    // Obtener el sistema de jerarquía centralizado registrado por EscenarioController
    const sistema = this.ecsManager.getSistema(SistemaJerarquiaEscenario);
    if (!sistema) {
      throw new Error("SistemaJerarquiaEscenario debe estar registrado antes de crear el builder.");
    }
    this.sistemaJerarquia = sistema;
  }

  /**
   * Construye el escenario a partir de un objeto de configuración
   * Recorre las zonas, oficinas, espacios y dispositivos del objeto y crea las entidades correspondientes
   */
  construirDesdeArchivo(escenario: Escenario): this {
    const escenarioPadre = this.crearEscenario(escenario);

    escenario.ataques.forEach((ataque: unknown) => {
      this.crearAtaque(ataque);
    });

    escenario.eventos.forEach((evento: unknown) => {
      this.crearEvento(evento);
    });

    escenario.fases.forEach((fase: unknown) => {
      this.crearFase(escenarioPadre, fase);
    });

    APPS.forEach((app) => {
      this.crearApp(escenarioPadre, app);
    });

    // Crear la red Internet UNA SOLA VEZ como red global
    this.entidadRedInternet = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      this.entidadRedInternet,
      new RedComponent("Internet", ColoresRed.ROJO)
    );

    // Crear sistema de relaciones Zona-Red UNA SOLA VEZ
    const relacionZonaRed = new SistemaRelaciones(
      ZonaComponent,
      RedComponent,
      "redes"
    );
    this.ecsManager.agregarSistema(relacionZonaRed);

    escenario.zonas.forEach((zona: unknown) => {
      const zonaEntidad = this.crearZona(zona, escenarioPadre);
      const z = zona as {
        oficinas?: unknown[];
        redes?: unknown[];
        personas?: unknown[];
        nombre?: string;
      };

      // Verificar si la zona tiene routers
      const tieneRouters = this.zonaTieneRouters(z);

      const redesConEntidades = new Map<
        Entidad,
        { nombre: string; color: string }
      >();

      // Procesar redes de la zona
      (z.redes ?? []).forEach((red) => {
        const r = red as { nombre: string; color: string };

        // Si la red es "Internet", verificar que la zona tenga routers
        if (r.nombre === "Internet") {
          if (!tieneRouters) {
            return; // Saltar esta red
          }
          redesConEntidades.set(this.entidadRedInternet, r);
          // Agregar relación entre esta zona e Internet usando el sistema ya creado
          relacionZonaRed.agregar(zonaEntidad, this.entidadRedInternet);
        } else {
          // Para otras redes, crear una nueva entidad
          const entidadRed = this.ecsManager.agregarEntidad();
          redesConEntidades.set(entidadRed, r);
          this.crearRed(zonaEntidad, entidadRed, red, relacionZonaRed);
        }
      });

      // Procesar personas por zona
      (z.personas ?? []).forEach((persona) => {
        const entidadPersona = this.ecsManager.agregarEntidad();
        this.crearPersona(zonaEntidad, entidadPersona, persona);
      });

      (z.oficinas ?? []).forEach((oficina: unknown) => {
        const oficinaEntidad = this.crearOficina(oficina, zonaEntidad);
        const ofi = oficina as { espacios?: unknown[] };
        (ofi.espacios ?? []).forEach((espacio: unknown) => {
          const espacioEntidad = this.crearEspacio(espacio, oficinaEntidad);
          const esp = espacio as { dispositivos?: Dispositivo[] };
          (esp.dispositivos ?? []).forEach((dispositivo: Dispositivo) => {
            const dispositivoEntidad = this.crearDispositivo(
              dispositivo,
              espacioEntidad,
              redesConEntidades
            );
            this.crearActivos(dispositivoEntidad, dispositivo.activos);
          });
        });
      });
    });

    return this;
  }

  private crearEscenario(escenario: Escenario): Entidad {
    const entidadEscenario = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadEscenario,
      new EscenarioComponent(
        escenario.id,
        escenario.titulo,
        escenario.descripcion,
        escenario.presupuestoInicial
      )
    );
    this.ecsManager.getComponentes(entidadEscenario)!
                   .get(EscenarioComponent)!.accionesEsperadas = escenario.accionesEsperadas;
    return entidadEscenario;
  }

  private crearAtaque(ataque: unknown) {
    const a = ataque as {
      nombreAtaque: string;
      tiempoNotificacion: number;
      tipoAtaque: unknown;
      dispositivoAAtacar: string;
      descripcion: string;
      fase: number;
      condicionMitigacion: {
        accion: string;
        objeto: string;
        tiempo?: number;
        val?: unknown;
      };
      tiempoEnOcurrir?: number;
    };
    const entidadAtaque = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadAtaque,
      new AtaqueComponent(
        a.nombreAtaque,
        a.tiempoNotificacion,
        a.tipoAtaque as unknown as TipoAtaque,
        a.dispositivoAAtacar,
        a.descripcion,
        a.fase,
        a.condicionMitigacion,
        a.tiempoEnOcurrir ?? undefined
      )
    );
  }

  private crearEvento(evento: unknown) {
    const a = evento as {
      nombreEvento: string;
      tipoEvento: TipoEvento;
      tiempoNotificacion: number;
      descripcion: string;
      fase: number;
      infoAdicional?: unknown;
      ejecutarAlInstante?: boolean;
      tiempoEnOcurrir?: number;
    };
    const entidadEvento = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadEvento,
      new EventoComponent(
        a.nombreEvento,
        a.tipoEvento,
        a.tiempoNotificacion,
        a.descripcion,
        a.fase,
        a.infoAdicional,
        a.ejecutarAlInstante,
        a.tiempoEnOcurrir ?? undefined
      )
    );
  }

  private crearFase(entidadEscenario: Entidad, fase: unknown) {
    const f = fase as {
      id: number;
      nombre: string;
      descripcion?: string;
      faseActual: boolean;
      completada: boolean;
      objetivos: ObjetivoFase[];
    };
    const escenarioContainer = this.ecsManager.getEntidades().get(entidadEscenario);
    const faseAAgregar = new FaseComponent(
        f.id,
        f.nombre,
        f.descripcion ?? "",
        f.faseActual ?? false,
        f.completada,
        f.objetivos ?? []
      );
    escenarioContainer?.get(EscenarioComponent)?.fases.push(faseAAgregar);
  }

  private crearApp(entidadEscenario: Entidad, app: SoftwareApp) {
    const escenarioContainer = this.ecsManager.getEntidades().get(entidadEscenario);

    escenarioContainer?.get(EscenarioComponent)?.apps.push(app);
  }

  private crearZona(zona: unknown, escenarioEntidad?: Entidad): Entidad {
    const entidadZona = this.ecsManager.agregarEntidad();
    const z = zona as { id: number; nombre: string; dominio: string; esInteractiva: boolean; };
    this.ecsManager.agregarComponente(
      entidadZona,
      new ZonaComponent(z.id, z.nombre, z.dominio, z.esInteractiva)
    );
    const escEntidad = escenarioEntidad;
    if (escEntidad != null) {
      this.sistemaJerarquia.agregarZonaAEscenario(escEntidad, entidadZona);
    }
    return entidadZona;
  }

  private crearRed(
    entidadZona: Entidad,
    entidadRed: Entidad,
    red: unknown,
    relacionZonaRed: SistemaRelaciones
  ) {
    const r = red as {
      nombre: string;
      color: string;
    };
    const redComponente = new RedComponent(r.nombre, r.color);

    this.ecsManager.agregarComponente(entidadRed, redComponente);

    // Usar el sistema de relaciones que se pasó como parámetro
    relacionZonaRed.agregar(entidadZona, entidadRed);
  }

  private crearPersona(
    entidadZona: Entidad,
    entidadPersona: Entidad,
    persona: unknown,
  ) {
    const p = persona as {
      nombre: string;
      correo: string;
      nivelConcienciaSeguridad: NivelConcienciaSeguridad;
    };

    const personaComponente = new PersonaComponent(
      p.nombre, p.correo, p.nivelConcienciaSeguridad
    );

    this.ecsManager.agregarComponente(entidadPersona, personaComponente);

    this.sistemaJerarquia.agregarPersonaAZona(entidadZona, entidadPersona);
  }

  private crearOficina(oficina: unknown, zonaId: number): Entidad {
    const entidadOficina = this.ecsManager.agregarEntidad();
    const ofi = oficina as { id: number; nombre?: string };
    this.ecsManager.agregarComponente(
      entidadOficina,
      new OficinaComponent(ofi.id, ofi.nombre ?? "")
    );

    const ofiEntidad = entidadOficina;
    if (ofiEntidad != null) {
      this.sistemaJerarquia.agregarOficinaAZona(zonaId, ofiEntidad);
    }
    return entidadOficina;
  }

  private crearEspacio(espacio: unknown, oficinaId: number): Entidad {
    const entidadEspacio = this.ecsManager.agregarEntidad();
    const esp = espacio as {
      id: number;
      mueble: unknown;
      posicion?: { x: number; y: number; z: number; rotacionY?: number };
    };
    this.ecsManager.agregarComponente(
      entidadEspacio,
      new EspacioComponent(esp.id, String(esp.mueble ?? "libre"))
    );
    this.ecsManager.agregarComponente(
      entidadEspacio,
      new TransformComponent(
        esp.posicion?.x ?? 0,
        esp.posicion?.y ?? 0,
        esp.posicion?.z ?? 0,
        esp.posicion?.rotacionY ?? 0
      )
    );
    const espEntidad = entidadEspacio;
    if (espEntidad != null) {
      this.sistemaJerarquia.agregarEspacioAOficina(oficinaId, espEntidad);
    }
    return entidadEspacio;
  }

  private crearDispositivo(
    dispositivo: unknown,
    espacioId: number,
    reds: Map<Entidad, { nombre: string; color: string }>
  ): Entidad {
    const entidadDispositivo = this.ecsManager.agregarEntidad();
    const d = dispositivo as {
      nombre?: string;
      sistemaOperativo?: string;
      hardware?: string;
      tipo?: unknown;
      estadoAtaque?: unknown;
      posicion?: { x: number; y: number; z: number; rotacionY?: number };
      redes?: string[];
      personaEncargada?: string;
      apps?: SoftwareApp[];
      nombreEquipo?: string;
      usuario?: string;
      contrasenia?: string;
      decorativo?: boolean;
    };

    // Extraer entidades de redes
    const entidadesRedesDispActual = [];
    for (const [entidadRed, redMap] of reds.entries()) {
      for (const red of d.redes!) {
        if (red == redMap.nombre) entidadesRedesDispActual.push(entidadRed);
      }
    }

    // Agregar componente de dispositivo
    this.ecsManager.agregarComponente(
      entidadDispositivo,
      new DispositivoComponent(
        d.nombre ?? "",
        d.sistemaOperativo ?? "",
        d.hardware ?? "",
        d.tipo as unknown as TipoDispositivo,
        d.estadoAtaque as EstadoAtaqueDispositivo,
        d.nombreEquipo ?? "",
        d.usuario ?? "",
        d.contrasenia ?? "",
        entidadesRedesDispActual,
        d.personaEncargada,
        d.apps,
        d.decorativo ?? false
      )
    );

    // Agregar Transform (posición 3D)
    this.ecsManager.agregarComponente(
      entidadDispositivo,
      new TransformComponent(
        d.posicion?.x ?? 0,
        d.posicion?.y ?? 0,
        d.posicion?.z ?? 0,
        d.posicion?.rotacionY ?? 0
      )
    );

    // Agregar componentes específicos según tipo
    switch (d.tipo) {
      case TipoDispositivo.WORKSTATION: {
        this.ecsManager.agregarComponente(
          entidadDispositivo,
          new WorkstationComponent()
        );
        this.ecsManager.agregarComponente(
          entidadDispositivo,
          new ClienteVPNComponent()
        );
        break;
      }
      case TipoDispositivo.ROUTER: {
        // Agregar RouterComponent con firewall y referencias a redes
        const firewallConfig = new FirewallBuilder().build();
        this.ecsManager.agregarComponente(
          entidadDispositivo,
          new RouterComponent(firewallConfig, [])
        );

        // Se agregan las reglas para cada red, protocolo, y dirección. Por defecto, todas las reglas están Permitidas para todas las redes y en las 2 direcciones
        const firewallConfigService = new FirewallConfigService(this.ecsManager);
        for (const entidadRed of entidadesRedesDispActual) {
          // const accion = entidadRed == this.entidadRedInternet ? AccionFirewall.DENEGAR : AccionFirewall.PERMITIR; // Esto era porque tiene más sentido que no se permita ningún protocolo desde afuera (desde Internet), pero por cómo se comporta el frontend con los botones de las reglas, se lo deja todo en Permitir igualmente
          for (const protocolo of FirewallConfigService.obtenerTodosLosProtocolos()){
            firewallConfigService.agregarReglaFirewall(
                                    entidadDispositivo,
                                    entidadRed,
                                    protocolo,
                                    AccionFirewall.PERMITIR,
                                    DireccionTrafico.DESDE
                                 ); 
          }
        }
        for (const entidadRed of entidadesRedesDispActual) {
          for (const protocolo of FirewallConfigService.obtenerTodosLosProtocolos()){
            firewallConfigService.agregarReglaFirewall(
                                    entidadDispositivo,
                                    entidadRed,
                                    protocolo,
                                    AccionFirewall.PERMITIR,
                                    DireccionTrafico.HACIA
                                 ); 
          }
        }
        break;
      }
      case TipoDispositivo.VPN: {
        this.ecsManager.agregarComponente(
          entidadDispositivo,
          new VPNGatewayComponent()
        );
        break;
      }
    }

    // Agregar relación con espacio
    this.sistemaJerarquia.agregarDispositivoAEspacio(
      espacioId,
      entidadDispositivo
    );
    return entidadDispositivo;
  }

  private crearActivos(entidadDispositivo: number, activos: Activo[]) {
    const tipoDispositivo = this.ecsManager
                            .getComponentes(entidadDispositivo)
                            ?.get(DispositivoComponent)?.tipo; 
    if (tipoDispositivo === TipoDispositivo.WORKSTATION ||
        tipoDispositivo === TipoDispositivo.SERVER) {
      const activoComponente = new ActivoComponent();
      activoComponente.activos = activos;
      this.ecsManager.agregarComponente(entidadDispositivo, activoComponente);
    }
  }

  public getEntidades(): Map<Entidad, ComponenteContainer> {
    return this.ecsManager.getEntidades();
  }

  /**
   * Obtiene el sistema de jerarquía para acceso directo desde controllers
   */
  public getSistemaJerarquia(): SistemaJerarquiaEscenario {
    return this.sistemaJerarquia;
  }

  /**
   * Obtiene todas las zonas del escenario con su id, nombre y dominio
   */
  public obtenerZonas(): Array<{ id: number; nombre: string; dominio: string; esInteractiva: boolean; }> {
    const zonas: Array<{ id: number; nombre: string; dominio: string; esInteractiva: boolean; }> = [];

    // Recorrer todas las entidades y buscar las que tienen ZonaComponent
    for (const [, container] of this.ecsManager.getEntidades()) {
      const zonaComponent = container.get(ZonaComponent);
      if (zonaComponent) {
        zonas.push({
          id: zonaComponent.id,
          nombre: zonaComponent.nombre,
          dominio: zonaComponent.dominio,
          esInteractiva: zonaComponent.esInteractiva,
        });
      }
    }

    return zonas.sort((a, b) => a.id - b.id);
  }

  /**
   * Obtiene la entidad de zona por su id
   */
  public obtenerEntidadZonaPorId(zonaId: number): Entidad | undefined {
    for (const [entidadId, container] of this.ecsManager.getEntidades()) {
      const zonaComponent = container.get(ZonaComponent);
      if (zonaComponent && zonaComponent.id === zonaId) {
        return entidadId;
      }
    }
    return undefined;
  }

  /**
   * Verifica si una zona tiene al menos un router
   */
  private zonaTieneRouters(zona: unknown): boolean {
    const z = zona as { oficinas?: unknown[] };

    for (const oficina of z.oficinas ?? []) {
      const ofi = oficina as { espacios?: unknown[] };
      for (const espacio of ofi.espacios ?? []) {
        const esp = espacio as { dispositivos?: Array<{ tipo?: unknown }> };
        for (const dispositivo of esp.dispositivos ?? []) {
          if (
            dispositivo.tipo === TipoDispositivo.ROUTER ||
            dispositivo.tipo === TipoDispositivo.VPN
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Obtiene todas las entidades visibles de una zona específica
   * Incluye oficinas, espacios y dispositivos de esa zona
   */
  public obtenerEntidadesDeZona(
    zonaId: number
  ): Map<Entidad, ComponenteContainer> {
    const entidadesVisibles = new Map<Entidad, ComponenteContainer>();

    // Buscar la entidad de zona
    const entidadZona = this.obtenerEntidadZonaPorId(zonaId);
    if (!entidadZona) return entidadesVisibles;

    // Obtener todas las oficinas de esta zona
    const oficinas = this.sistemaJerarquia.obtenerOficinasDeZona(entidadZona);

    for (const oficinaId of oficinas) {
      // Obtener todos los espacios de cada oficina
      const espacios =
        this.sistemaJerarquia.obtenerEspaciosDeOficina(oficinaId);

      for (const espacioId of espacios) {
        // Agregar el espacio
        const espacioContainer = this.ecsManager.getComponentes(espacioId);
        if (espacioContainer) {
          entidadesVisibles.set(espacioId, espacioContainer);
        }

        // Obtener todos los dispositivos de cada espacio
        const dispositivos =
          this.sistemaJerarquia.obtenerDispositivosDeEspacio(espacioId);

        for (const dispositivoId of dispositivos) {
          const dispositivoContainer =
            this.ecsManager.getComponentes(dispositivoId);
          if (dispositivoContainer) {
            entidadesVisibles.set(dispositivoId, dispositivoContainer);
          }
        }
      }
    }

    return entidadesVisibles;
  }
}
