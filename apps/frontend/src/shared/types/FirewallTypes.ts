import type { TipoProtocolo } from "./TrafficEnums";

export enum AccionFirewall {
    PERMITIR = 'PERMITIR',
    DENEGAR = 'DENEGAR'
}

export enum DireccionTrafico {
    HACIA = 'HACIA',  // SALIENTE
    DESDE = 'DESDE',  // ENTRANTE
    AMBAS = 'AMBAS'
}

export interface Reglas {
    accion: AccionFirewall;
    direccion: DireccionTrafico;
    protocolo: TipoProtocolo;
}

