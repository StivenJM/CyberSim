import type { Entidad } from "../../../../ecs/core/Componente";

/**
 * Representación UI de una red del ECS.
 * `estaActiva` solo aplica en el contexto de un dispositivo: indica si ese
 * dispositivo está conectado a la red. En otros contextos (ej. listado
 * de redes de un router) el campo se omite.
 */
export interface RedInfo {
  entidadId: Entidad;
  nombre: string;
  color: string;
  estaActiva?: boolean;
}
