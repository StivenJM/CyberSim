import { ECSManager } from "./ECSManager";
// import type { ClaseComponente } from "./Componente";

export abstract class Sistema {
  // Lista de clases/constructores de componentes requeridos por el sistema
  // public abstract componentesRequeridos: Set<ClaseComponente>;

  //public abstract actualizar(entidades: Set<Entidad>): void

  public ecsManager!: ECSManager;
}
