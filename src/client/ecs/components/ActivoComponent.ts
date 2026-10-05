import type { Activo } from "../../shared/types/EscenarioTypes";
import { Componente } from "../core";

// Es el conjunto total de activos de un dispositivo (workstation, server)
export class ActivoComponent extends Componente {
    constructor(
        public activos: Array<Activo> = [] 
    ){
        super();
    }
}
