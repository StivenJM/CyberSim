import { Componente, type Entidad } from "../core/Componente";

/**
 * Representa un espacio que puede contener dispositivos
 * Mantiene referencias a las entidades de dispositivos que contiene
 */
export class EspacioComponent extends Componente {
  constructor(
    public id: number,
    public mueble: string = "libre",
    public dispositivos: Entidad[] = [],
    public tipo: string = "espacio"
  ) {
    super();
  }
}
