/* eslint-disable @typescript-eslint/no-explicit-any */
export type Entidad = number;

export abstract class Componente {}
export type ClaseComponente<T extends Componente = Componente> = new (
  ...args: any[]
) => T;

export class ComponenteContainer {
  private map = new Map<ClaseComponente, Componente>();

  public agregar(componente: Componente): void {
    this.map.set(componente.constructor as ClaseComponente, componente);
  }

  public get<T extends Componente>(
    claseComponente: ClaseComponente<T>
  ): T | undefined {
    return this.map.get(claseComponente) as T | undefined;
  }

  public tiene(claseComponente: ClaseComponente): boolean {
    return this.map.has(claseComponente);
  }

  /*public tieneTodos(clasesComponente: Iterable<ClaseComponente>): boolean {
    for (const clase of clasesComponente) {
      if (!this.map.has(clase)) return false;
    }
    return true;
  }*/

  public eliminar(claseComponente: ClaseComponente): void {
    this.map.delete(claseComponente);
  }
}
