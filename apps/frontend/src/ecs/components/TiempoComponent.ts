import { Componente } from "../core/Componente";

export class TiempoComponent extends Componente {
    constructor(
        public transcurrido: number = 0, // tiempo total transcurrido en segundos
        public pausado: boolean = false,
    ){
        super();
    }
}
