import { Componente, type Entidad } from "../core/Componente";

/**
 * Representa una oficina que contiene espacios
 */
export class OficinaComponent extends Componente {
  constructor(
    public id: number,
    public nombre: string,
    public espacios: Entidad[] = [],
    public tipo: string = "oficina"
  ) {
    super();
  }
}
