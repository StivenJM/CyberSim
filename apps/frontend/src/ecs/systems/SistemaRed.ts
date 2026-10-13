import {
  // ActivoComponent,
  // RouterComponent,
  DispositivoComponent,
  VPNGatewayComponent,
  ClienteVPNComponent,
  RedComponent,
} from "../components";
import { Sistema, type Entidad } from "../core";
import { TipoProtocolo } from "../../shared/types/TrafficEnums";
import { AccionFirewall } from "../../shared/types/FirewallTypes";
import type { DireccionTrafico, Reglas } from "../../shared/types/FirewallTypes";
import {
  ConectividadService,
  EventoRedService,
  FirewallService,
  FirewallConfigService,
  TransferenciaService,
  VPNService,
} from "./red";
import type {
  PerfilClienteVPN,
  PerfilVPNGateway,
} from "../../shared/types/EscenarioTypes";
import { EventosPublicos, MensajesGenerales } from "../../shared/types/EventosEnums";
import { AccionesRealizables, ObjetosManejables } from "../../shared/types/AccionesEnums";
import { SistemaTiempo } from "./SistemaTiempo";

// Sistema encargado de gestionar redes, conectividad y firewalls
export class SistemaRed extends Sistema {
  // public componentesRequeridos = new Set([ActivoComponent, RouterComponent]);

  // Servicios especializados
  private conectividadService: ConectividadService | null = null;
  private eventoService: EventoRedService | null = null;
  private firewallService: FirewallService | null = null;
  private firewallConfigService: FirewallConfigService | null = null;
  private transferenciaService: TransferenciaService | null = null;
  private vpnService: VPNService | null = null;

  constructor() {
    super();
  }

  // Inicializa servicios de forma lazy (solo la primera vez que se accede)
  private getEventoService(): EventoRedService {
    if (!this.eventoService) {
      this.eventoService = new EventoRedService(this.ecsManager);
    }
    return this.eventoService;
  }

  private getConectividadService(): ConectividadService {
    if (!this.conectividadService) {
      this.conectividadService = new ConectividadService(this.ecsManager);
    }
    return this.conectividadService;
  }

  private getFirewallService(): FirewallService {
    if (!this.firewallService) {
      this.firewallService = new FirewallService(
        this.getConectividadService(),
        this.ecsManager
      );
    }
    return this.firewallService;
  }

  private getFirewallConfigService(): FirewallConfigService {
    if (!this.firewallConfigService) {
      this.firewallConfigService = new FirewallConfigService(this.ecsManager);
    }
    return this.firewallConfigService;
  }

  private getTransferenciaService(): TransferenciaService {
    if (!this.transferenciaService) {
      this.transferenciaService = new TransferenciaService(
        this.ecsManager
      );
    }
    return this.transferenciaService;
  }

  private getVPNService(): VPNService {
    if (!this.vpnService) {
      this.vpnService = new VPNService(this.ecsManager);
    }
    return this.vpnService;
  }

  // Conecta un dispositivo a una red específica
  public asignarRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    const dispositivo = this.ecsManager
      .getComponentes(entidadDisp)
      ?.get(DispositivoComponent);

    // Verificamos que el dispositivo no esté en la red
    if (dispositivo?.redes.some((d) => d === entidadRed)) {
      return;
    }

    dispositivo?.redes.push(entidadRed);

    this.ecsManager.registrarAccion(
      AccionesRealizables.AGREGAR,
      ObjetosManejables.RED,
      this.getTiempoSimulacion(),
      {
        nombreDispositivo: dispositivo?.nombre,
        nombreRed: this.ecsManager.getComponentes(entidadRed)?.get(RedComponent)?.nombre
      }
    );

    this.ecsManager.emit(EventosPublicos.RED_ASIGNADA, {
      entidadDispositivo: entidadDisp,
      entidadRed: entidadRed,
    });
  }

  // Remueve un dispositivo de una red específica
  public removerRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    const dispositivo = this.ecsManager
      .getComponentes(entidadDisp)
      ?.get(DispositivoComponent);

    if (!dispositivo) return;

    const index = dispositivo.redes.indexOf(entidadRed);
    if (index > -1) {
      dispositivo.redes.splice(index, 1);

      this.ecsManager.registrarAccion(
        AccionesRealizables.ELIMINAR,
        ObjetosManejables.RED,
        this.getTiempoSimulacion(),
        {
          nombreDispositivo: dispositivo?.nombre,
          nombreRed: this.ecsManager.getComponentes(entidadRed)?.get(RedComponent)?.nombre
        }
      );

      this.ecsManager.emit(EventosPublicos.RED_REMOVIDA, {
        entidadDispositivo: entidadDisp,
        entidadRed: entidadRed,
      });
    }
  }

  // Envía tráfico entre dos dispositivos validando conectividad y firewall
  public enviarTrafico(
    entidadOrigen: Entidad,
    entidadDestino: Entidad,
    protocolo: TipoProtocolo,
    payload: unknown,
    esObjetivo?: boolean,
    debeSerBloqueado?: boolean
  ): void {
    const dispOrigen = this.ecsManager
      .getComponentes(entidadOrigen)
      ?.get(DispositivoComponent);
    const dispDestino = this.ecsManager
      .getComponentes(entidadDestino)
      ?.get(DispositivoComponent);

    if (!dispOrigen || !dispDestino) {
      return;
    }
    if (
      !this.getConectividadService().estanConectados(
        entidadOrigen,
        entidadDestino
      )
    ) {
      // console.log(
      //   `❌ SistemaRed.enviarTrafico: Dispositivos NO están conectados`
      // );
      this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA,
                             MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
      return;
    }

    //console.log(`✅ SistemaRed.enviarTrafico: Dispositivos ESTÁN conectados`);

    const resultadoFirewall = this.getFirewallService().validarFirewall(
      entidadOrigen,
      entidadDestino,
      protocolo
    );

    if (!resultadoFirewall.permitido) {
      // console.log(
      //   `❌ SistemaRed.enviarTrafico: Tráfico BLOQUEADO por firewall`
      // );
      if (protocolo == TipoProtocolo.VPN_GATEWAY) { // Esto debería ir en las comprobaciones del lado del cliente dentro del método getVPNService().establecerConexion(...), pero por cuestiones de compatibilidad se lo deja aquí, ya que la comprobación que se hace con !resultadoFirewall.permitido es lo mismo que se haría dentro del método de establecerConexion.
        this.ecsManager.emit(EventosPublicos.VPN_CONEXION_RECHAZADA, 
          `Conexión VPN rechazada: un firewall de ${dispOrigen.nombre} tiene bloqueada la salida de conexiones VPN.`
        );
        return;
      }

      if (protocolo == TipoProtocolo.FTP) { // La misma razón que arriba
        this.ecsManager.emit(EventosPublicos.RED_ACTIVO_NO_ENVIADO,
          `Activo no enviado: un firewall ha rechazado la conexión entre ${dispOrigen.nombre} y ${dispDestino.nombre}.`
        );
        return;
      }

      // Emitir evento de bloqueo
      this.getEventoService().emitirEventoBloqueado(
        dispOrigen.nombre,
        dispDestino.nombre,
        protocolo,
        resultadoFirewall.entidadRouter,
        esObjetivo ?? false,
        debeSerBloqueado ?? true
      );

      return;
    }

    //console.log(`✅ SistemaRed.enviarTrafico: Firewall PERMITIÓ el tráfico`);

    // Emitir evento de tráfico permitido
    this.getEventoService().emitirEventoPermitido(
      dispOrigen.nombre,
      dispDestino.nombre,
      esObjetivo ?? false,
      debeSerBloqueado ?? false
    );

    switch (protocolo) {
      case TipoProtocolo.FTP: {
        const activo = payload as string;
        this.getTransferenciaService().enviarActivo(
          entidadOrigen,
          entidadDestino,
          activo
        );
        break;
      }
      case TipoProtocolo.VPN_GATEWAY: {
        const permisosVPN = payload as {
          gateway: PerfilVPNGateway;
          cliente: PerfilClienteVPN;
        };
        this.getVPNService().establecerConexion(
          entidadOrigen,
          entidadDestino,
          permisosVPN
        );
        break;
      }
      // Próximamente para otros protocolos
    }

    return;
  }

  public agregarReglaFirewall(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().agregarReglaFirewall(
      entidadRouter,
      entidadRed,
      protocolo,
      accion,
      direccion
    );
  }

  public bloquearProtocolosEnRed(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().bloquearProtocolosEnRed(
      entidadRouter,
      entidadRed,
      protocolos,
      direccion
    );
  }

  public permitirProtocolosEnRed(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().permitirProtocolosEnRed(
      entidadRouter,
      entidadRed,
      protocolos,
      direccion
    );
  }

  public obtenerReglasDeRed(
    entidadRouter: Entidad,
    entidadRed: Entidad
  ): Reglas[] {
    return this.getFirewallConfigService().obtenerReglasDeRed(
      entidadRouter,
      entidadRed
    );
  }

  public eliminarReglaFirewall(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    direccion: DireccionTrafico
  ): void {
    this.getFirewallConfigService().eliminarRegla(
      entidadRouter,
      entidadRed,
      protocolo,
      direccion
    );
  }

  public obtenerRedesDeRouter(entidadRouter: Entidad): Entidad[] {
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);
    return dispositivo?.redes || [];
  }

  public obtenerDispositivosPorRed(entidadRed: Entidad): Entidad[] {
    const dispositivos: Entidad[] = [];

    // Itera una sola vez por todas las entidades del ECS
    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      // Solo verifica entidades que tienen DispositivoComponent
      if (container.tiene(DispositivoComponent)) {
        const dispositivo = container.get(DispositivoComponent);

        // Verifica si el dispositivo tiene la red especificada
        if (dispositivo?.redes.includes(entidadRed)) {
          dispositivos.push(entidad);
        }
      }
    }

    return dispositivos;
  }

  /////////////////////////////// Métodos VPN //////////////////////////////////

  agregarPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    perfil: PerfilVPNGateway
  ): void {
    this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent)
      ?.perfilesVPNGateway.push(perfil);

    const nombreVPN = this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(DispositivoComponent)?.nombre;

    this.ecsManager.registrarAccion(
      AccionesRealizables.AGREGAR,
      ObjetosManejables.PERFIL_VPN_GATEWAY,
      this.getTiempoSimulacion(),
      {
        nombreVPNGateway: nombreVPN,
        lanLocal: perfil.lanLocal,
        hostLan: perfil.hostLan,
        proteccion: perfil.proteccion,
        dominioRemoto: perfil.dominioRemoto,
        hostRemoto: perfil.hostRemoto
      }
    );

    this.ecsManager.emit(
      EventosPublicos.VPN_GATEWAY_PERFIL_AGREGADO,
      `Se agregó correctamente un nuevo perfil de conexión VPN en ${nombreVPN}`
    );
  }

  // Se pasa la entidad del gateway de la cual se quiere eliminar un perfil, y se le pasa el índice de la tabla
  // que se corresponde con el array de perfiles (desde arriba de la tabla es el índice 0)
  removerPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    indexEnTabla: number
  ): void {
    const nombreVPN = this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(DispositivoComponent)?.nombre;

    const actualVPNGateway = this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent);

    const perfilAEliminar = actualVPNGateway?.perfilesVPNGateway.at(indexEnTabla);
    this.ecsManager.registrarAccion(
      AccionesRealizables.ELIMINAR,
      ObjetosManejables.PERFIL_VPN_GATEWAY,
      this.getTiempoSimulacion(),
      {
        nombreVPNGateway: nombreVPN,
        lanLocal: perfilAEliminar?.lanLocal ?? "",
        hostLan: perfilAEliminar?.hostLan ?? "",
        proteccion: perfilAEliminar?.proteccion ?? "",
        dominioRemoto: perfilAEliminar?.dominioRemoto ?? "",
        hostRemoto: perfilAEliminar?.hostRemoto ?? ""
      }
    );
 
    if (actualVPNGateway) {
      actualVPNGateway.perfilesVPNGateway.splice(indexEnTabla, 1);
    }

    this.ecsManager.emit(
      EventosPublicos.VPN_GATEWAY_PERFIL_ELIMINADO,
      `Se eliminó correctamente un perfil de conexión VPN en ${nombreVPN}`
    );
  }

  agregarPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    perfil: PerfilClienteVPN
  ): void {
    this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent)
      ?.perfilesClienteVPN.push(perfil);

    const nombreCliente = this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(DispositivoComponent)?.nombre;

    this.ecsManager.registrarAccion(
      AccionesRealizables.AGREGAR,
      ObjetosManejables.PERFIL_CLIENTE_VPN,
      this.getTiempoSimulacion(),
      {
        nombreCliente: nombreCliente,
        proteccion: perfil.proteccion,
        dominioRemoto: perfil.dominioRemoto,
        hostRemoto: perfil.hostRemoto
      }
    );    

    this.ecsManager.emit(
      EventosPublicos.VPN_CLIENTE_PERFIL_AGREGADO,
      `Se agregó correctamente un nuevo perfil de conexión VPN en ${nombreCliente}`
    );
  }

  removerPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    indexEnTabla: number
  ): void {
    const nombreCliente = this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(DispositivoComponent)?.nombre;

    const actualClienteVPN = this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent);

    const perfilAEliminar = actualClienteVPN?.perfilesClienteVPN.at(indexEnTabla);
    this.ecsManager.registrarAccion(
      AccionesRealizables.ELIMINAR,
      ObjetosManejables.PERFIL_CLIENTE_VPN,
      this.getTiempoSimulacion(),
      {
        nombreCliente: nombreCliente,
        proteccion: perfilAEliminar?.proteccion ?? "",
        dominioRemoto: perfilAEliminar?.dominioRemoto ?? "",
        hostRemoto: perfilAEliminar?.hostRemoto ?? ""
      }
    );
 
    if (actualClienteVPN) actualClienteVPN.perfilesClienteVPN.splice(indexEnTabla, 1); 

    this.ecsManager.emit(
      EventosPublicos.VPN_GATEWAY_PERFIL_ELIMINADO,
      `Se eliminó correctamente un perfil de conexión VPN en ${nombreCliente}`
    );
  }

  private getTiempoSimulacion(): number | undefined {
    return this.ecsManager.getSistema(SistemaTiempo)?.getTiempoSimulacion();
  }
}
