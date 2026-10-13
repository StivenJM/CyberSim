import { Componente } from "../core/Componente";

export class Velocidad extends Componente {
    constructor(
        public vx: number,
        public vz: number
    ){
        super();
    }
}
