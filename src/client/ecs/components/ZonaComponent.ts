import { Componente, type Entidad } from "../core/Componente";

/**
 * Representa una zona que contiene oficinas
 */
export class ZonaComponent extends Componente {
  constructor(
    public id: number,
    public nombre: string,
    public dominio: string,
    public esInteractiva: boolean = true,
    public oficinas: Entidad[] = [],
    public redes: Entidad[] = [],
    public personas: Entidad[] = [],
    public tipo: string = "zona"
  ) {
    super();
  }
}
