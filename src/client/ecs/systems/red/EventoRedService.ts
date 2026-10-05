import type { ECSManager } from "../../core/ECSManager";
import { EventosPublicos, MensajesGenerales } from "../../../shared/types/EventosEnums";
import type {
  TipoProtocolo,
  // RegistroTrafico,
  RegistroFirewallBloqueado,
} from "../../../shared/types/TrafficEnums";
import type { Entidad } from "../../core";
import { DispositivoComponent, RouterComponent } from "../../components";

export class EventoRedService {
  constructor(private ecsManager: ECSManager) {}

  emitirEventoPermitido(
    origen: string,
    destino: string,
    esObjetivo?: boolean,
    debeSerBloqueado?: boolean
  ): void {
    if (esObjetivo && !debeSerBloqueado) {
      this.ecsManager.emit(EventosPublicos.TRAFICO_PERMITIDO, {
        mensaje: `Trafico permitido: desde ${origen} hacia ${destino}`,
      });
    }
    if (esObjetivo && debeSerBloqueado) {
      this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA,
                           MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
    }
  }

  emitirEventoBloqueado(
    origen: string,
    destino: string,
    protocolo: TipoProtocolo,
    entidadRouter?: Entidad,
    esObjetivo?: boolean,
    debeSerBloqueado?: boolean
  ): void {
    if (entidadRouter) {
      const dispositivo = this.ecsManager
        .getComponentes(entidadRouter)
        ?.get(DispositivoComponent);
      const nombreRouter = dispositivo?.nombre;

      const registro: RegistroFirewallBloqueado = {
        origen,
        destino,
        protocolo,
        mensaje: `Trafico bloqueado: desde ${origen} hacia ${destino}`,
        tipo: "BLOQUEADO",
        entidadRouter,
        router: nombreRouter,
      };

      const routerComponent = this.ecsManager
        .getComponentes(entidadRouter)
        ?.get(RouterComponent);
      routerComponent?.logsTrafico.push(registro);
    }

    if (esObjetivo && debeSerBloqueado) {
      this.ecsManager.emit(EventosPublicos.TRAFICO_BLOQUEADO, {
        mensaje: `Trafico bloqueado: desde ${origen} hacia ${destino}`,
      });
    }
    if (esObjetivo && !debeSerBloqueado) {
      this.ecsManager.emit(EventosPublicos.FASE_NO_COMPLETADA,
                           MensajesGenerales.MSJ_FASE_NO_COMPLETADA);
    }
  }

  // registrarTrafico(
  //   origen: string,
  //   destino: string,
  //   protocolo: TipoProtocolo
  // ): void {
  //   const registro: RegistroTrafico = {
  //     origen,
  //     destino,
  //     protocolo,
  //   };
  //
  //   this.ecsManager.emit(EventosRed.TRAFICO_ENVIADO, registro);
  // }
}
