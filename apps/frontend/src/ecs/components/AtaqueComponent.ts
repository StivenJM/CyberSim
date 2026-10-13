import { TipoEvento, type TipoAtaque } from "../../shared/types/DeviceEnums";
import { EventoComponent } from "./EventoComponent";

export class AtaqueComponent extends EventoComponent {
  constructor(
    public nombreAtaque: string,
    /* Tiempo en segundos en el que se notificará un futuro ataque desde que sucedió un evento. Ej: inició la simulación,
     * se hizo toggle a una config específica, etc.
     * No debe tomar en cuenta mientras está pausado. Ej: si se define tiempoNotificacion = 10 al inicio de la simulación,
     * entonces se notificará del ataque cuando el tiempo de simulación alcance los 10 segundos;
     * si se pausara el tiempo a los 5 segundos, y se dejan pasar otros 5 segundos pausado,
     * la notificaicón no debería ocurrir. */
    public tiempoNotificacion: number,
    public tipoAtaque: TipoAtaque,
    public dispositivoAAtacar: string, // Nombre del dispositivo (DispositivoComponent) a atacar
    public descripcion: string, // Descripción breve que explica o advierte sobre el ataque.
    public fase: number, // Fase a la que pertenece el ataque
    public condicionMitigacion: {
      accion: string;
      objeto: string;
      tiempo?: number;
      val?: unknown;
    },
    /**
     * Tiempo en segundos en el que ocurrirá el ataque desde que se notificó. La condición de pausa también aplica
     * Es como un tiempo "de gracia" hasta que ocurra el ataque. De momento se define en 10 segundos luego de la notificacion:
     */
    public tiempoEnOcurrir?: number
  ) {
    super(nombreAtaque, TipoEvento.NO_APLICA, tiempoNotificacion, descripcion, fase); 
    if (!this.tiempoEnOcurrir) this.tiempoEnOcurrir = this.tiempoNotificacion + 10;
  }
}
