import type { NivelConcienciaSeguridad } from "../../shared/types/DeviceEnums";
import { Componente } from "../core";

export class PersonaComponent extends Componente {
    constructor(
        public nombre: string,
        public correo: string,
        public nivelConcienciaSeguridad: NivelConcienciaSeguridad
    ){
        super();
    }
}
