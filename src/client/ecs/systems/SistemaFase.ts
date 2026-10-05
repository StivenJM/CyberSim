import { TipoEvento } from "../../shared/types/DeviceEnums";
import { EventosInternos } from "../../shared/types/EventosEnums";
import { AtaqueComponent, EscenarioComponent, EventoComponent/*, FaseComponent*/ } from "../components";
import { Sistema } from "../core";
// import type { ClaseComponente } from "../core/Componente";

export class SistemaFase extends Sistema {
  // public componentesRequeridos: Set<ClaseComponente> = new Set([FaseComponent]);
  public eventosEscenario: EventoComponent[] = [];
  private indexEventoActualACumplir: number = 0;

  public iniciarEscuchaDeEvento(): void {
    this.ecsManager.on(EventosInternos.OBJETIVO_COMPLETADO, () => {
        this.marcarObjetivoDeFaseCompletado(); 
    });
  }

  // Va marcando, en orden de definción en el json, los objetivos que se van cumpliendo.
  // Es decir, cada vez que se llama a este método, se marca como completado el siguiente
  // objetivo definido. En otras palabras, se toman los objetivos (todos los que estén definidos) 
  // como una lista ordenada según se hayan definido en el json, y cada vez que se llame 
  // a este método, se marca como completado al siguiente de la lista. Ahí radica la 
  // importancia de tenerlos definidos en orden en el json.
  private marcarObjetivoDeFaseCompletado(): void {
    let escenario;
    for (const [,c] of this.ecsManager.getEntidades()) {
      if (c.tiene(EscenarioComponent)) {
        escenario = c.get(EscenarioComponent);
        break;
      }
    } 

    let eventoActual;
    let nombreEventoActual = "";

    if (!(this.eventosEscenario[this.indexEventoActualACumplir] instanceof AtaqueComponent)) {
      eventoActual = this.eventosEscenario[this.indexEventoActualACumplir];
      nombreEventoActual = eventoActual.nombreEvento;
    } else {
      eventoActual = this.eventosEscenario[this.indexEventoActualACumplir] as AtaqueComponent;
      nombreEventoActual = eventoActual.nombreAtaque;
    }

    const faseActual = escenario?.fases.at(eventoActual.fase - 1);
    
    if (eventoActual.tipoEvento == TipoEvento.COMPLETACION_FASE) {
      faseActual!.completada = true;
      faseActual!.faseActual = false;
      if (eventoActual.fase + 1 <= escenario!.fases.length) escenario!.fases.at(eventoActual.fase)!.faseActual = true;
      this.indexEventoActualACumplir++;
      return;
    } 

    for (const fase of escenario?.fases ?? []) {
      if (fase.id == faseActual!.id) fase.faseActual = true;
      else fase.faseActual = false;
    }

    for (const objetivo of faseActual!.objetivos ?? []) {
      if (objetivo.descripcion == nombreEventoActual) {
        objetivo.completado = true;
        this.indexEventoActualACumplir++;
        break;
      }
    }
  }
}
