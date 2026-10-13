import type { Entidad, ClaseComponente } from "../core/Componente";
import { Sistema } from "../core";

/**
 * Sistema genérico para gestionar relaciones bidireccionales padre <-> hijo.
 * Ejemplos de uso: Zona<->Oficina, Oficina<->Espacio, Espacio<->Dispositivo.
 * Se parametriza por la clase del componente padre, la clase del componente hijo
 * y el nombre de la propiedad en el componente padre que contiene el array de hijos.
 *
 * Mantiene un índice bidireccional para permitir consultas en ambas direcciones:
 * - Obtener hijos de un padre
 * - Obtener padre de un hijo
 */
export class SistemaRelaciones extends Sistema {
  // Conjunto de componentes requeridos por este sistema (se completa en el constructor)
  // public componentesRequeridos = new Set<ClaseComponente>();

  // Índice inverso: hijo -> padre (para navegación inversa)
  private indiceHijoPadre = new Map<Entidad, Entidad>();

  constructor(
    private ClasePadre: ClaseComponente,
    private ClaseHijo: ClaseComponente,
    private propiedadPadre: string // nombre de la propiedad en el componente padre que contiene Entidad[]
  ) {
    super();
    // registrar ambos tipos para que el ECS pueda filtrar entidades si hace falta
    // this.componentesRequeridos.add(this.ClasePadre);
    // this.componentesRequeridos.add(this.ClaseHijo);
  }

  // Añade childId al array padre[propiedadPadre] si existen ambos componentes
  // También actualiza el índice inverso hijo->padre
  agregar(padreId: Entidad, hijoId: Entidad): void {
    const padre = this.ecsManager
      ?.getComponentes(padreId)
      ?.get(this.ClasePadre);
    const hijo = this.ecsManager?.getComponentes(hijoId)?.get(this.ClaseHijo);
    if (!padre || !hijo) return;
    const arr = (padre as unknown as Record<string, unknown>)[
      this.propiedadPadre
    ] as Entidad[] | undefined;
    if (!Array.isArray(arr)) return;
    if (!arr.includes(hijoId)) {
      arr.push(hijoId);
      // Actualizar índice inverso
      this.indiceHijoPadre.set(hijoId, padreId);
    }
  }

  // Elimina hijoId del array padre[propiedadPadre] y actualiza el índice inverso
  remover(padreId: Entidad, hijoId: Entidad): void {
    const padre = this.ecsManager
      ?.getComponentes(padreId)
      ?.get(this.ClasePadre);
    if (!padre) return;
    const arr = (padre as unknown as Record<string, unknown>)[
      this.propiedadPadre
    ] as Entidad[] | undefined;
    if (!Array.isArray(arr)) return;
    const index = arr.indexOf(hijoId);
    if (index !== -1) {
      arr.splice(index, 1);
      // Actualizar índice inverso
      this.indiceHijoPadre.delete(hijoId);
    }
  }

  // Devuelve copia del array de hijos de un padre
  obtenerHijos(padreId: Entidad): Entidad[] {
    const padre = this.ecsManager
      ?.getComponentes(padreId)
      ?.get(this.ClasePadre);
    const arr = padre
      ? ((padre as unknown as Record<string, unknown>)[this.propiedadPadre] as
          | Entidad[]
          | undefined)
      : undefined;
    return arr ? [...arr] : [];
  }

  obtenerPadre(hijoId: Entidad): Entidad | undefined {
    return this.indiceHijoPadre.get(hijoId);
  }

  tienePadre(hijoId: Entidad): boolean {
    return this.indiceHijoPadre.has(hijoId);
  }

  limpiar(): void {
    this.indiceHijoPadre.clear();
  }
}
