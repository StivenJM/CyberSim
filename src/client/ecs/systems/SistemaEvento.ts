import { AccionesRealizables, ObjetosManejables } from "../../shared/types/AccionesEnums";
import { EstadoAtaqueDispositivo, TipoEvento } from "../../shared/types/DeviceEnums";
import type {
  PerfilClienteVPN,
  PerfilVPNGateway,
  RegistroVeredictoFirma,
} from "../../shared/types/EscenarioTypes";
import { EventosPublicos, EventosInternos, MensajesGenerales } from "../../shared/types/EventosEnums";
import type {
  AccionFirewall,
  DireccionTrafico,
} from "../../shared/types/FirewallTypes";
import type { TipoProtocolo } from "../../shared/types/TrafficEnums";
import {
  AtaqueComponent,
  DispositivoComponent,
  EventoComponent,
  RedComponent,
  RouterComponent,
  WorkstationComponent,
} from "../components";
import { Sistema, type Entidad } from "../core";
// import type { ClaseComponente } from "../core/Componente";
import { SistemaActivo } from "./SistemaActivo";

export class SistemaEvento extends Sistema {
  // public componentesRequeridos: Set<ClaseComponente> = new Set([
  //   AtaqueComponent,
  // ]);

  public ejecutarAtaque(
    entidadDispositivo: Entidad,
    ataque: AtaqueComponent
  ): void {
    const container3 = this.ecsManager.getComponentes(entidadDispositivo);
    if (!container3) return;
    const dispositivoAAtacar = container3.get(DispositivoComponent);
    if (!dispositivoAAtacar) return;

    if (
      !this.verificarCondicionMitigacion(
        entidadDispositivo,
        ataque.condicionMitigacion
      )
    ) {
      dispositivoAAtacar.estadoAtaque = EstadoAtaqueDispositivo.COMPROMETIDO;
      this.ecsManager.emit(EventosPublicos.ATAQUE_REALIZADO, { ataque });
    } else {
      this.ecsManager.emit(EventosPublicos.ATAQUE_MITIGADO, { ataque });
    }
  }

  /* Se verifica la condición de mitigación para cada ataque */
  private verificarCondicionMitigacion(
    entidadDispositivo: Entidad,
    condicionMitigacion: unknown
  ): boolean {
    // Se obtiene el dispositivo general sobre el cual se realiza el ataque
    const containerDispositivo =
      this.ecsManager.getComponentes(entidadDispositivo);
    if (!containerDispositivo)
      throw new Error(
        `No existe contenedor para Entidad: ${entidadDispositivo}`
      );

    const condicion = condicionMitigacion as {
      objeto: string;
    };
    /* A partir del objeto de la condición de mitigación (o sea, lo que se supone que debe haberse topado para
     * mitigar el ataque), se verifica (en el preciso momento del ataque) que lo demás de la condición de mitigación
     * del ataque actual se haya cumplido; para lo cual, se extrae, en el momento del ataque, lo necesario para la
     * verificación de la condición de mitigación. De esta forma ya no se depende del registro de acciones ni del tiempo
     * en que estas hayan sido realizadas. */
    switch (condicion?.objeto) {
      case ObjetosManejables.CONFIG_WORKSTATION: {
        const c = condicionMitigacion as {
          val: {
            nombreConfig: string;
            activado: boolean;
          }[];
        };
        const dispositivo = containerDispositivo.get(WorkstationComponent);
        
        for (const configItem of c.val) {
          const config = dispositivo?.configuraciones.find(
            (conf) => conf.nombreConfig == configItem.nombreConfig
          );
          if (config?.activado != configItem.activado) return false;
        }
        return true;
      }
      case ObjetosManejables.CONFIG_FIREWALL: {
        const c = condicionMitigacion as {
          val: {
            nombreRed: string;
            accion: AccionFirewall;
            direccion: DireccionTrafico;
            protocolo: TipoProtocolo;
          }[];
        };
        const router = containerDispositivo.get(RouterComponent);
        if (!router) return false;

        for (const configItem of c.val) {
          const entidadRedEsperada = this.buscarRedPorNombre(configItem.nombreRed);
          if(entidadRedEsperada == null) return false;

          const reglas = router.bloqueosFirewall.get(entidadRedEsperada);
          if(!reglas) return false;

          const reglaItem = reglas.find(
                                (regla) =>
                                  regla.protocolo == configItem.protocolo &&
                                  regla.direccion == configItem.direccion
                              );

          if (reglaItem && reglaItem.accion != configItem.accion) return false;
        }
        
        return true;
      }
      // Próximamente para otros dispositivos y/o configuraciones
    }

    return false;
  }

  /* A partir del formato general de eventos (1), se verifica qué tipo es, para según eso realizar lo que se tenga que hacer.
   * Para lo cual, se emiten los eventos (2) correspondientes para que las clases responsables se encarguen.
   * No confundir entre (1) y (2): (1) son los sucesos (como los ataques) que ocurren en la simulación. (2) son las "señales"
   * que se emiten para que los oyentes de estas señales hagan lo que se les pide según corresponda (es como el patrón Observador).*/
  public ejecutarEvento(evento: EventoComponent): void {
    switch (evento.tipoEvento) {
      case TipoEvento.ENVIO_ACTIVO: {
        //console.log("Ejecutando evento de envío de activo...");
        // Convertir nombres de dispositivos a entidades
        const info = evento.infoAdicional as {
          nombreActivo: string;
          dispositivoEmisor: string;
          dispositivoReceptor: string;
        };
        const entidadEmisor = this.buscarDispositivoPorNombre(
          info.dispositivoEmisor
        );
        const entidadReceptor = this.buscarDispositivoPorNombre(
          info.dispositivoReceptor
        );

        if (!entidadEmisor || !entidadReceptor) {
          console.error(
            `No se encontraron los dispositivos: ${info.dispositivoEmisor}, ${info.dispositivoReceptor}`
          );
          return;
        }

        const eventoConEntidades = {
          entidadEmisor,
          entidadReceptor,
          nombreActivo: info.nombreActivo,
        };

        this.ecsManager.emit(EventosInternos.RED_ENVIAR_ACTIVO, {
          eventoConEntidades,
        });
        break;
      }
      case TipoEvento.TRAFICO_RED: {
        //console.log("Ejecutando evento de tráfico de red...");
        // Convertir nombres de dispositivos a entidades (null = Internet)
        const info = evento.infoAdicional as {
          dispositivoOrigen: string;
          dispositivoDestino: string;
          protocolo: unknown;
          esObjetivo: boolean;
          debeSerBloqueado: boolean;
        };
        const entidadOrigen = this.buscarDispositivoPorNombre(
          info.dispositivoOrigen
        );
        const entidadDestino = this.buscarDispositivoPorNombre(
          info.dispositivoDestino
        );

        const eventoConEntidades = {
          ...evento,
          infoAdicional: {
            entidadOrigen,
            entidadDestino,
            protocolo: info.protocolo,
            esObjetivo: info.esObjetivo,
            debeSerBloqueado: info.debeSerBloqueado,
          },
        };

        this.ecsManager.emit(EventosInternos.RED_TRAFICO, {
          evento: eventoConEntidades,
        });
        break;
      }
      case TipoEvento.CONEXION_VPN: {
        //Obtenemos los permisos del gateway y del cliente
        const info = evento.infoAdicional as {
          gateway: PerfilVPNGateway;
          cliente: PerfilClienteVPN;
        };

        const entidadOrigen = this.buscarDispositivoPorNombre(
          info.gateway.hostRemoto
        );
        const entidadDestino = this.buscarDispositivoPorNombre(
          info.gateway.hostLan
        );

        const permisosConEntidades = {
          entidadOrigen,
          entidadDestino,
          permisos: info,
        };

        this.ecsManager.emit(EventosInternos.VPN_SOLICITUD_CONEXION, {
          permisosConEntidades,
        });
        break;
      }
      case TipoEvento.COMPLETACION_FASE: {
        this.ecsManager.emit(EventosPublicos.FASE_COMPLETADA, evento.descripcion);
        break;
      }
      case TipoEvento.COMPLETACION_ESCENARIO: {
        this.ecsManager.emit(EventosPublicos.ESCENARIO_COMPLETADO, evento.descripcion);
        break;
      }
      case TipoEvento.VERIFICACION_FIRMA: {
        const info = evento.infoAdicional as RegistroVeredictoFirma;

        const registrosVeredictos = this.ecsManager.getSistema(SistemaActivo)?.registroVeredictosFirmas;
        const busquedaVeredicto = registrosVeredictos?.find((registro) => 
          registro.nombreDocumento === info.nombreDocumento &&
          registro.nombreFirma === info.nombreFirma &&
          registro.nombreClave === info.nombreClave &&
          registro.veredicto === info.veredicto
        );

        if(busquedaVeredicto)
          this.ecsManager.emit(EventosPublicos.VERIFICACION_FIRMA_CORRECTA, `Verificación correcta de documento firmado para ${info.nombreDocumento}`);
        else this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA, MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
        break;
      }
      case TipoEvento.VERIFICACION_ACCION_JUGADOR: {
        const info = evento.infoAdicional as {
          accion: string;
          objeto: string;
          tiempo?: number;
          val?: unknown;
        };

        const consultaAccion = this.ecsManager.consultarAccion(info.accion, info.objeto, undefined, info.val);

        if(!consultaAccion)
          this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA, MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
        else this.ecsManager.emit(EventosInternos.OBJETIVO_COMPLETADO);

        break;
      }
      case TipoEvento.ENVIO_CORREO: {
        const info = evento.infoAdicional as {
          dispositivoEmisor: string;
          destinatario: string;
          asunto: string;
        };

        const consultaEnvioCorreo = this.ecsManager.consultarAccion(
          AccionesRealizables.ENVIO,
          ObjetosManejables.CORREO,
          undefined,
          info
        );

        if (!consultaEnvioCorreo)
          this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA, MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
        else this.ecsManager.emit(EventosInternos.OBJETIVO_COMPLETADO);

        break;
      }
      // Próximamente para futuros eventos
    }
  }

  // Método helper para buscar un dispositivo por nombre
  private buscarDispositivoPorNombre(nombre: string): Entidad | null {
    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      const dispositivo = container.get(DispositivoComponent);
      if (dispositivo && dispositivo.nombre === nombre) {
        return entidad;
      }
    }
    return null;
  }

  private buscarRedPorNombre(nombreRed: string): Entidad | null {
    for (const [entidad, container] of this.ecsManager.getEntidades()) {
      const red = container.get(RedComponent);
      if (red && red.nombre === nombreRed) {
        return entidad;
      }
    }
    return null;
  }
}
