import { TipoEvento } from "../../shared/types/DeviceEnums";
import { Componente } from "../core";

// Componente generalizado para cualquier evento de la simulación.
/* Es prácticamente como el de ataque, por lo que los atributos homónimos de aquí
   tienen el mismo significado. Es una nueva aparte del de ataque para no romper tanto
   lo que ya se tenía. La lógica es prácticamente la misma, y no es conveniente estar
   modificando todos los archivos involucrados para cada tipo de evento que vaya apareciendo
   durante el desarrollo, por lo cual, se
*/
export class EventoComponent extends Componente {
    constructor(
        public nombreEvento: string,
        public tipoEvento: TipoEvento,
        public tiempoNotificacion: number,
        public descripcion: string,
        public fase: number,
        // Similar a condicionAMitigar en AtaqueComponent, pero en este caso es para brindar cualquier infor útil adicional
        public infoAdicional?: unknown,
        public ejecutarAlInstante?: boolean,
        public tiempoEnOcurrir?: number
    ) {
        super();
        if (!this.tiempoEnOcurrir) this.tiempoEnOcurrir = this.tiempoNotificacion + 10;
        // Excepción: si el evento es una completación de fase entonces el tiempo en ocurrir es el mismo que de notificación
        if(this.tipoEvento == TipoEvento.COMPLETACION_FASE || this.tipoEvento == TipoEvento.COMPLETACION_ESCENARIO || this.ejecutarAlInstante == true)
            this.tiempoEnOcurrir = this.tiempoNotificacion;
    }
}
