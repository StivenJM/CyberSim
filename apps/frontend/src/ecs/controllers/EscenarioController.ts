import {
  ActivoComponent,
  AtaqueComponent,
  DispositivoComponent,
  EscenarioComponent,
  EventoComponent,
  FaseComponent,
  // PresupuestoComponent,
  TiempoComponent,
  WorkstationComponent,
  PersonaComponent,
} from "../components";
import { ECSManager, type Entidad } from "../core";
import {
  SistemaActivo,
  SistemaComandos,
  SistemaEvento,
  SistemaFase,
  SistemaJerarquiaEscenario,
  SistemaPresupuesto,
  SistemaTiempo,
} from "../systems";
import { EscenarioBuilder } from "../utils/EscenarioBuilder";
import type { Activo, Escenario, LogGeneral, SoftwareApp, RegistroVeredictoFirma, InfoPersonaEncontrada, PlantillaCorreoPhishing, RespuestaComando } from "../../shared/types/EscenarioTypes";
import {
  EventosInternos,
  EventosPublicos,
  MensajesGenerales,
  TipoLogGeneral,
} from "../../shared/types/EventosEnums";
import { ProgresoController } from "./ProgresoController";
import { AccionesRealizables, ObjetosManejables } from "../../shared/types/AccionesEnums";
import { PlantillasCorreoPhishing } from "../../data/plantillas/Plantillas";

export class EscenarioController {
  public escenario: Escenario;
  public ecsManager: ECSManager;
  public builder!: EscenarioBuilder;

  private entidadTiempo?: Entidad;
  private entidadTiempoTotal?: Entidad;
  private sistemaTiempo?: SistemaTiempo;
  private sistemaPresupuesto?: SistemaPresupuesto;
  private sistemaJerarquiaEscenario?: SistemaJerarquiaEscenario;
  // private entidadPresupuesto?: Entidad;
  private sistemaEvento?: SistemaEvento;
  private sistemaFase?: SistemaFase;
  private sistemaActivo?: SistemaActivo;
  private sistemaComandos?: SistemaComandos;
  private progresoController?: ProgresoController;
  private escenarioIniciado: boolean = false; // FLAG PARA EVITAR MÚLTIPLES INICIALIZACIONES

  private static instance: EscenarioController | null = null;

  private constructor(escenario: Escenario, em?: ECSManager) {
    this.escenario = escenario;
    if (em) this.ecsManager = em;
    else this.ecsManager = new ECSManager();

    this.sistemaJerarquiaEscenario = new SistemaJerarquiaEscenario();
    this.ecsManager.agregarSistema(this.sistemaJerarquiaEscenario);
  }

  // SINGLETON
  public static getInstance(escenario?: Escenario, em?: ECSManager): EscenarioController {
    if (!EscenarioController.instance) {
      if (!escenario) {
        throw new Error(
          "Debe proporcionar un escenario para inicializar el controlador la primera vez."
        );
      }
      if (!em) EscenarioController.instance = new EscenarioController(escenario);
      else EscenarioController.instance = new EscenarioController(escenario, em);
    } else if (escenario && escenario.id !== EscenarioController.instance.escenario.id) {
      // Si es un escenario diferente, resetear completamente la instancia
      if (!em) EscenarioController.instance = new EscenarioController(escenario);
      else EscenarioController.instance = new EscenarioController(escenario, em);
    } else if (escenario) {
      // Si es el mismo escenario, solo actualizar la referencia
      EscenarioController.instance.escenario = escenario;
    }
    return EscenarioController.instance;
  }

  public iniciarEscenario(): void {
    // EVITAR MÚLTIPLES INICIALIZACIONES
    if (this.escenarioIniciado) {
      return;
    }

    this.builder = new EscenarioBuilder(this.ecsManager);
    this.builder.construirDesdeArchivo(this.escenario);

    if (!this.sistemaEvento) {
      this.sistemaEvento = new SistemaEvento();
      this.ecsManager.agregarSistema(this.sistemaEvento);
    }

    if (!this.sistemaFase) {
      this.sistemaFase = new SistemaFase();
      this.ecsManager.agregarSistema(this.sistemaFase);
      this.sistemaFase.iniciarEscuchaDeEvento();
    }

    if (!this.sistemaActivo) {
      this.sistemaActivo = new SistemaActivo();
      this.ecsManager.agregarSistema(this.sistemaActivo);
    }

    if (!this.sistemaComandos) {
      this.sistemaComandos = new SistemaComandos();
      this.sistemaComandos.ecsManager = this.ecsManager;
    }

    if (!this.progresoController) {
      this.progresoController = ProgresoController.getInstance();
    }

    // NO emitir el evento aquí - lo haremos después de que los sistemas se suscriban
    this.iniciarEscuchaDeEventos();

    this.escenarioIniciado = true;
  }

  public iniciarEscuchaDeEventos(): void {
    this.ecsManager.on(
      EventosPublicos.TIEMPO_NOTIFICACION_ATAQUE,
      (data: unknown) => {
        const d = data as { descripcionAtaque: string };
        const log = {
          tipo: TipoLogGeneral.ADVERTENCIA,
          mensaje: d.descripcionAtaque,
          pausarTiempo: true,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    // Lo mismo que ariba pero para eventos generalizados
    this.ecsManager.on(
      EventosPublicos.TIEMPO_NOTIFICACION_EVENTO,
      (data: unknown) => {
        const d = data as { descripcionEvento: string };
        const log = {
          tipo: TipoLogGeneral.ADVERTENCIA,
          mensaje: d.descripcionEvento,
          pausarTiempo: true,
        };
        this.agregarLogGeneralEscenario(log);
      }
    );

    this.ecsManager.on(
      EventosInternos.TIEMPO_EJECUCION_ATAQUE,
      (data: unknown) => {
        const d = data as { ataque: AtaqueComponent };
        this.ejecutarAtaque(d.ataque);
      }
    );

    // Lo mismo que ariba pero para eventos generalizados
    this.ecsManager.on(
      EventosInternos.TIEMPO_EJECUCION_EVENTO,
      (data: unknown) => {
        const d = data as { evento: EventoComponent };
        this.ejecutarEvento(d.evento);
      }
    );

    this.ecsManager.on(EventosPublicos.ATAQUE_REALIZADO, (data: unknown) => {
      const d = data as { ataque: AtaqueComponent };
      const log = {
        tipo: TipoLogGeneral.ATAQUE,
        mensaje: `Se comprometió el dispositivo: ${d.ataque.dispositivoAAtacar}. Causa: ${d.ataque.tipoAtaque}`,
        pausarTiempo: true,
      };
      this.agregarLogGeneralEscenario(log);
      this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA,
        MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
      this.sistemaTiempo?.destruir();
    });

    this.ecsManager.on(EventosPublicos.ATAQUE_MITIGADO, (data: unknown) => {
      const d = data as { ataque: AtaqueComponent };
      const log = {
        tipo: TipoLogGeneral.COMPLETADO,
        mensaje: `Se mitigó el ataque a: ${d.ataque.dispositivoAAtacar}. Ataque mitigado: ${d.ataque.tipoAtaque}`,
        pausarTiempo: false,
      };
      this.ecsManager.emit(EventosInternos.OBJETIVO_COMPLETADO);
      this.agregarLogGeneralEscenario(log);
    });

    // this.ecsManager.on(EventosPublicos.PRESUPUESTO_AGOTADO, () => {
    //   this.sistemaTiempo?.pausar(this.entidadTiempo!);
    //   const log = {
    //     tipo: TipoLogGeneral.ADVERTENCIA,
    //     mensaje: "Se agotó el presupuesto, fin de la partida.",
    //     pausarTiempo: true,
    //   };
    //   this.agregarLogGeneralEscenario(log);
    //   this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA,
    //                        MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
    //   this.sistemaTiempo?.destruir();
    // });

    this.ecsManager.on(EventosPublicos.FASE_COMPLETADA, (data: unknown) => {
      const descripcion = data as string;
      const log = {
        tipo: TipoLogGeneral.COMPLETADO,
        mensaje: descripcion,
        pausarTiempo: true,
      };
      this.ecsManager.emit(EventosInternos.OBJETIVO_COMPLETADO);
      this.agregarLogGeneralEscenario(log);
    });

    this.ecsManager.on(EventosPublicos.VERIFICACION_FIRMA_CORRECTA, (data: unknown) => {
      const descripcion = data as string;
      const log = {
        tipo: TipoLogGeneral.COMPLETADO,
        mensaje: descripcion,
        pausarTiempo: false,
      };
      this.ecsManager.emit(EventosInternos.OBJETIVO_COMPLETADO);
      this.agregarLogGeneralEscenario(log);
    });

    // Oyentes para guardar el progreso
    this.ecsManager.on(EventosPublicos.FASE_NO_COMPLETADA, () => {
      this.progresoController?.guardarProgresoEstudiante(
        false,
        this.getTiempoTotalTranscurrido(),
        this.escenario.accionesEsperadas,
        this.ecsManager.getAccionesSimulacion()
      );
      this.sistemaTiempo?.destruir();
    });

    this.ecsManager.on(EventosPublicos.ESCENARIO_COMPLETADO, () => {
      this.progresoController?.guardarProgresoEstudiante(
        true,
        this.getTiempoTotalTranscurrido(),
        this.escenario.accionesEsperadas,
        this.ecsManager.getAccionesSimulacion()
      );
      this.sistemaTiempo?.destruir();
    });
  }

  private agregarLogGeneralEscenario(log: LogGeneral): void {
    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      if (container.tiene(EscenarioComponent)) {
        this.ecsManager
          .getComponentes(entidad)
          ?.get(EscenarioComponent)
          ?.logsGenerales.push(log);
        break;
      }
    }
    this.ecsManager.emit(
      EventosPublicos.LOGS_GENERALES_ACTUALIZADOS,
      log.pausarTiempo
    );
  }

  public cargarEventosEnSistema(): void {
    if (!this.sistemaTiempo) {
      console.error("SistemaTiempo no existe aún");
      return;
    }
    if (!this.sistemaFase) {
      console.error("SistemaFase no existe aún");
      return;
    }
    const eventos = this.getEventos();
    this.sistemaTiempo.eventosEscenario = eventos;
    this.sistemaFase.eventosEscenario = eventos.sort((a, b) => a.tiempoNotificacion - b.tiempoNotificacion);
  }

  public ejecutarTiempo(): void {
    if (!this.entidadTiempo || !this.entidadTiempoTotal) {
      this.entidadTiempo = this.ecsManager.agregarEntidad();
      this.ecsManager.agregarComponente(
        this.entidadTiempo,
        new TiempoComponent()
      );

      this.entidadTiempoTotal = this.ecsManager.agregarEntidad();
      this.ecsManager.agregarComponente(
        this.entidadTiempoTotal,
        new TiempoComponent()
      );

      this.sistemaTiempo = new SistemaTiempo();
      this.ecsManager.agregarSistema(this.sistemaTiempo);
    }
  }
  public iniciarTiempo(): void {
    if (!this.sistemaTiempo || !this.entidadTiempo || !this.entidadTiempoTotal) {
      console.error("Sistema de tiempo no inicializado");
      return;
    }
    this.sistemaTiempo.iniciar(this.entidadTiempo);
    this.sistemaTiempo.iniciarTiempoTotal(this.entidadTiempoTotal);
  }

  public pausarTiempo(): void {
    if (!this.sistemaTiempo || !this.entidadTiempo) {
      console.error("Sistema de tiempo no inicializado");
      return;
    }
    this.sistemaTiempo.pausar(this.entidadTiempo);
  }

  public reanudarTiempo(): void {
    if (!this.sistemaTiempo || !this.entidadTiempo) {
      console.error("Sistema de tiempo no inicializado");
      return;
    }

    this.sistemaTiempo.reanudar(this.entidadTiempo);
  }

  public estaTiempoPausado(): boolean {
    if (!this.ecsManager || !this.entidadTiempo) {
      return false;
    }

    const cont = this.ecsManager.getComponentes(this.entidadTiempo);
    if (!cont) return false;

    const tiempo = cont.get(TiempoComponent);
    return tiempo?.pausado ?? false;
  }

  public get tiempoTranscurrido(): number {
    if (!this.ecsManager || !this.entidadTiempo) {
      return 0;
    }

    const cont = this.ecsManager.getComponentes(this.entidadTiempo);
    if (!cont) return 0;

    const tiempo = cont.get(TiempoComponent);
    return tiempo?.transcurrido ?? 0;
  }

  private getTiempoTotalTranscurrido(): number {
    if (!this.ecsManager || !this.entidadTiempoTotal) {
      return 0;
    }

    const cont = this.ecsManager.getComponentes(this.entidadTiempoTotal);
    if (!cont) return 0;

    const tiempo = cont.get(TiempoComponent);
    return tiempo?.transcurrido ?? 0;
  }

  /**
   * Suscribe un callback a eventos del ECSManager
   * @param eventName Nombre del evento (ej: 'tiempo:actualizado')
   * @param callback Función a ejecutar cuando se emita el evento
   * @returns Función para desuscribirse del evento
   */
  public on(eventName: string, callback: (data: unknown) => void): () => void {
    return this.ecsManager.on(eventName, callback);
  }

  public efectuarPresupuesto(/*montoInicial: number*/): void {
    // if (!this.entidadPresupuesto) {
    //   this.entidadPresupuesto = this.ecsManager.agregarEntidad();
    //   this.ecsManager.agregarComponente(
    //     this.entidadPresupuesto,
    //     new PresupuestoComponent(montoInicial)
    //   );
    this.sistemaPresupuesto = new SistemaPresupuesto();
    this.ecsManager.agregarSistema(this.sistemaPresupuesto);
    // }
  }

  public toggleConfiguracionWorkstation(
    entidadWorkstation: Entidad,
    nombreConfig: string
  ): void {
    if (!this.sistemaPresupuesto /*|| !this.entidadPresupuesto*/) {
      console.error("Sistema de presupuesto no inicializado");
      return;
    }
    this.sistemaPresupuesto.toggleConfiguracionWorkstation(
      // this.entidadPresupuesto,
      entidadWorkstation,
      nombreConfig
    );
  }

  public ejecutarAtaque(ataque: AtaqueComponent) {
    const entidadAtaque = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(entidadAtaque, ataque);

    const dispositivos: [Entidad, string][] = []; // Info de dispositivo: idEntidad y nombre

    this.builder.getEntidades().forEach((container, entidad) => {
      if (container.tiene(DispositivoComponent))
        dispositivos.push([
          entidad,
          container.get(DispositivoComponent)?.nombre ?? "",
        ]);
    });

    const nombreDispositivoAAtacar = ataque.dispositivoAAtacar;

    const entidadDispConSuNombre = dispositivos.filter(
      ([, nombre]) => nombreDispositivoAAtacar == nombre
    );

    if (entidadDispConSuNombre.length > 0) {
      this.sistemaEvento?.ejecutarAtaque(entidadDispConSuNombre[0][0], ataque);
    }
  }

  public ejecutarEvento(evento: EventoComponent) {
    this.sistemaEvento?.ejecutarEvento(evento);
  }

  public getPresupuestoActual(): number {
    //   if (!this.ecsManager || !this.entidadPresupuesto) {
    //     return 0;
    //   }
    //   const cont = this.ecsManager.getComponentes(this.entidadPresupuesto);
    //   if (!cont) return 0;
    //
    //   const presupuesto = cont.get(PresupuestoComponent);
    //   return presupuesto?.monto ?? 0;
    return 0;
  }

  public getEventos(): EventoComponent[] {
    const eventos: EventoComponent[] = [];

    for (const [, container] of this.builder.getEntidades()) {
      if (container.tiene(EventoComponent)) {
        const a = container.get(EventoComponent);
        if (a) eventos.push(a);
      }
      if (container.tiene(AtaqueComponent)) {
        const a = container.get(AtaqueComponent);
        if (a) eventos.push(a);
      }
    }

    return eventos;
  }

  public getWorkstationsYServers(): Entidad[] {
    const workstationsYServers: Entidad[] = [];

    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      if (
        container.tiene(
          WorkstationComponent
        ) /* || container.tiene(ServidorComponent)*/
      ) {
        workstationsYServers.push(entidad);
      }
    }

    return workstationsYServers;
  }

  public getAllDispositivos(): Entidad[] {
    const dispositivosTodos: Entidad[] = [];

    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      if (container.tiene(DispositivoComponent)) {
        dispositivosTodos.push(entidad);
      }
    }

    return dispositivosTodos;
  }

  public getFasesConObjetivos(): FaseComponent[] | undefined {
    for (const [, container] of this.ecsManager.getEntidades()) {
      if (container.tiene(EscenarioComponent)) {
        return container.get(EscenarioComponent)?.fases;
      }
    }
  }

  public async getHashDocumento(contenido: string) {
    return this.sistemaActivo?.calcularHashDocumento(contenido);
  }

  public async getHashFirma(firma: Activo, clave: Activo) {
    return this.sistemaActivo?.calcularHashFirma(firma, clave);
  }

  public registrarVeredictoFirma(registro: RegistroVeredictoFirma) {
    this.sistemaActivo?.registrarVeredictoFirma(registro);
  }

  public getActivosDeDispositivo(entidadDispositivo: Entidad): Activo[] | undefined {
    return this.ecsManager.getComponentes(entidadDispositivo)?.get(ActivoComponent)?.activos;
  }

  public eliminarActivoDeDispositivo(entidadDispositivo: Entidad, nombreActivo: string) {
    const activosDispActual = this.ecsManager.getComponentes(entidadDispositivo)
      ?.get(ActivoComponent);

    const activos = (activosDispActual?.activos ?? []);

    for (let i = 0; i < activos.length; i++) {
      if (activos.at(i)?.nombre == nombreActivo) {
        activosDispActual?.activos?.splice(i, 1);
        break;
      }
    }
  }

  public comprarApp(entidadDispositivo: Entidad, nombreApp: string): void {
    if (!this.sistemaPresupuesto /*|| !this.entidadPresupuesto*/) {
      console.error("Sistema de presupuesto no inicializado");
      return;
    }
    this.sistemaPresupuesto?.comprarApp(
      // this.entidadPresupuesto,
      entidadDispositivo,
      nombreApp
    );
  }

  public desinstalarApp(entidadDispositivo: Entidad, nombreApp: string): void {
    if (!this.sistemaPresupuesto /*|| !this.entidadPresupuesto*/) {
      console.error("Sistema de presupuesto no inicializado");
      return;
    }
    this.sistemaPresupuesto?.desinstalarApp(
      // this.entidadPresupuesto,
      entidadDispositivo,
      nombreApp
    );
  }

  public getTodasAppsDisponibles(): SoftwareApp[] | undefined {
    for (const [, c] of this.ecsManager.getEntidades()) {
      if (c.tiene(EscenarioComponent))
        return c.get(EscenarioComponent)?.apps;
    }
  }

  // Devuelve todas las apps que NO están instaladas (compradas) en el dispositivo actual
  public getAppsDisponiblesPorDispositivo(entidadDispositivo: Entidad)
    : SoftwareApp[] | undefined {
    const todasAppsDisponibles = this.getTodasAppsDisponibles();
    const appsInstaladasDispositivoActual = this.ecsManager.getComponentes(entidadDispositivo)
      ?.get(DispositivoComponent)?.apps;
    const appsDisponiblesParaDispositivoActual = [];

    for (const app of todasAppsDisponibles ?? []) {
      if (!appsInstaladasDispositivoActual?.includes(app))
        appsDisponiblesParaDispositivoActual.push(app);
    }

    return appsDisponiblesParaDispositivoActual;
  }

  // Devuelve el listado de información personas que trabajan en una empresa (zona)
  public getInfoPersonasPorEmpresa(entidadZona: Entidad): InfoPersonaEncontrada[] | undefined {
    const infoPersonasEmpresa: InfoPersonaEncontrada[] = [];
    for (const entidadPersona of this.sistemaJerarquiaEscenario?.obtenerPersonasDeZona(
      entidadZona
    ) ?? []) {
      const personaActual = this.ecsManager.getComponentes(entidadPersona)?.get(PersonaComponent);
      const infoPersonaActual: InfoPersonaEncontrada = {
        nombre: personaActual!.nombre!,
        correo: personaActual!.correo!,
        nivelConcienciaSeguridad: personaActual!.nivelConcienciaSeguridad!
      };
      infoPersonasEmpresa.push(infoPersonaActual);
    }
    return infoPersonasEmpresa;
  }

  public registrarEjecucionAplicacion(nombreAplicacion: string) {
    this.ecsManager.registrarAccion(
      AccionesRealizables.EJECUTAR,
      ObjetosManejables.APLICACION,
      this.tiempoTranscurrido,
      {
        nombreAplicacion: nombreAplicacion
      }
    );
  }

  public registrarEnvioDeCorreo(nombreDispEmisor: string, correoDestinatario: string, asunto: string) {
    this.ecsManager.registrarAccion(
      AccionesRealizables.ENVIO,
      ObjetosManejables.CORREO,
      this.tiempoTranscurrido,
      {
        dispositivoEmisor: nombreDispEmisor,
        destinatario: correoDestinatario,
        asunto: asunto
      }
    );
  }

  public getPlantillasCorreo(): PlantillaCorreoPhishing[] {
    const plantillas: PlantillaCorreoPhishing[] = [];

    for (const plantilla of PlantillasCorreoPhishing) {
      plantillas.push(plantilla);
    }

    return plantillas;
  }

  /* Con esta función se indica el dispositivo en el que el sistema de comandos (la "consola")
     quiere "abrirse". No hay que confundirse por el nombre de la función, ya que el sistema en
     realidad ya está "iniciado" (o sea, ya existe) desde que se instancia el controller. Por lo
     cual, esta función se debe ejecutar cada vez que el usuario decida abrir la consola en algún
     dispositivo, pasándole a esta función la entidad de ese dispositivo actual.
  */
  public iniciarSistemaComandos(entidadDispositivo: Entidad) {
    this.sistemaComandos?.iniciarSistemaComandos(entidadDispositivo);
  }

  public ejecutarComando(comando: string): RespuestaComando | undefined {
    return this.sistemaComandos?.ejecutarComando(comando);
  }

  // MÉTODO PARA RESETEAR EL SINGLETON (útil para desarrollo/testing)
  public static reset(): void {
    if (EscenarioController.instance?.sistemaTiempo) {
      EscenarioController.instance.sistemaTiempo.destruir();
    }
    EscenarioController.instance = null;
  }
}
