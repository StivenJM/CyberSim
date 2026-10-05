import { Sistema } from "../core";
import { type Entidad } from "../core";
import {
  TiempoComponent,
  EventoComponent,
  AtaqueComponent,
} from "../components";
import { EventosInternos, EventosPublicos } from "../../shared/types/EventosEnums";

export class SistemaTiempo extends Sistema {
  // public componentesRequeridos = new Set([TiempoComponent]);
  public intervalo: ReturnType<typeof setInterval> | null = null;
  public intervaloTiempoTotal: ReturnType<typeof setInterval> | null = null;
  public eventosEscenario: EventoComponent[] = []; 

  public pausar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;

    const tiempo = container.get(TiempoComponent);
    if (!tiempo) return;
    tiempo.pausado = true;

    // IMPORTANTE: Detener el intervalo cuando se pausa
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }

    // console.log("Pausando tiempo en SistemaTiempo", tiempo);
    this.ecsManager.emit(EventosPublicos.TIEMPO_PAUSADO, {
      transcurrido: tiempo.transcurrido,
      pausado: true,
    });
  }

  public reanudar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;

    const tiempo = container.get(TiempoComponent);
    if (!tiempo) return;
    tiempo.pausado = false;

    // Solo crear intervalo si no existe uno ya corriendo
    if (!this.intervalo) {
      this.iniciarIntervalo(tiempo);
    }

    this.ecsManager.emit(EventosPublicos.TIEMPO_REANUDADO, {
      transcurrido: tiempo.transcurrido,
      pausado: false,
    });
  }

  public iniciar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;

    const tiempo = container.get(TiempoComponent);
    if (!tiempo) return;

    // Evitar múltiples intervalos
    if (this.intervalo) return;

    this.iniciarIntervalo(tiempo);
  }

  public iniciarTiempoTotal(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;

    const tiempo = container.get(TiempoComponent);
    if (!tiempo) return;

    // Evitar múltiples intervalos
    if (this.intervaloTiempoTotal) return;

    this.iniciarIntervaloTiempoTotal(tiempo);
  }

  private iniciarIntervalo(tiempo: TiempoComponent) {
    this.intervalo = setInterval(() => {
      tiempo.transcurrido += 1;

      // Emitir evento cuando el tiempo cambia
      this.ecsManager.emit(EventosPublicos.TIEMPO_ACTUALIZADO, {
        transcurrido: tiempo.transcurrido,
        pausado: tiempo.pausado,
      });

      /* Verificar que sea un tiempo de notificacion de ataque o evento
         y verificar que sea un tiempo de ejecución de ataque o evento
      */
      for (const evento of this.eventosEscenario) {
        if (tiempo.transcurrido == evento.tiempoNotificacion) {
          if (evento instanceof AtaqueComponent) {
            this.ecsManager.emit(EventosPublicos.TIEMPO_NOTIFICACION_ATAQUE, {
              descripcionAtaque: evento.descripcion,
            });
          } else {
            this.ecsManager.emit(EventosPublicos.TIEMPO_NOTIFICACION_EVENTO, {
              descripcionEvento: evento.descripcion,
            });
          }
        }
        if (tiempo.transcurrido == evento.tiempoEnOcurrir) {
          if (evento instanceof AtaqueComponent) {
            this.ecsManager.emit(EventosInternos.TIEMPO_EJECUCION_ATAQUE, {
              ataque: evento,
            });
          } else {
            this.ecsManager.emit(EventosInternos.TIEMPO_EJECUCION_EVENTO, {
              evento,
            });
          }
        }
      }

      //console.log(`Tiempo transcurrido: ${tiempo.transcurrido}s`);
    }, 1000);
  }

  private iniciarIntervaloTiempoTotal(tiempo: TiempoComponent) {
    this.intervaloTiempoTotal = setInterval(() => {
      tiempo.transcurrido += 1;
    }, 1000);
  }

  /** Se devuelve el tiempo mostrado de la simulación, no el tiempo total.
   *  Como la primera entidad de tiempo que se añade es la de la simulación, no hay 
   *  problema en que la búsqueda se detenga en el primer TiempoComponent que encuentre
   **/
  public getTiempoSimulacion(): number | undefined{
    for (const [, container] of this.ecsManager.getEntidades().entries()) {
      if (container.tiene(TiempoComponent)) return container.get(TiempoComponent)?.transcurrido;
    }
  }

  // Método para limpiar el intervalo cuando se destruye el sistema
  public destruir() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }
}
