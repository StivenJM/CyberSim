import { Componente } from "../core/Componente";

export class TransformComponent extends Componente {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public rotacionY: number
    ){
        super();
    }
}
