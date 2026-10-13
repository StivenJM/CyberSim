import type { ObjetivoFase } from "../../shared/types/EscenarioTypes";
import { Componente } from "../core";

export class FaseComponent extends Componente {
    constructor(
        public id: number,
        public nombre: string,
        public descripcion: string,
        public faseActual: boolean,
        public completada: boolean,
        public objetivos: ObjetivoFase[] = []
    ){
        super();
    }
}
