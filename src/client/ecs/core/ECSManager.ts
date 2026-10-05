import {
  ComponenteContainer,
  Componente,
  type Entidad,
  type ClaseComponente,
} from "./Componente";
import type { Sistema } from "./Sistema";

type EventCallback = (data: unknown) => void;

export class ECSManager {
  private entidades = new Map<Entidad, ComponenteContainer>();
  private sistemas = new Map<Sistema, Set<Entidad>>();

  private idSiguienteEntidad: number = 0;
  private entidadesADestruir = new Array<Entidad>();

  // Sistema de eventos para comunicación con el frontend
  private eventListeners = new Map<string, Set<EventCallback>>();

  // Sistema de registro de acciones realizadas durante la simulacion
  private accionesSimulacion = new Array<[string, string, number | undefined, unknown?]>();
  /* Array<nombre de acción,
        objeto sobre el cual se hizo la acción (no necesariamente es un objeto de la escena 3D),
        tiempo actual (total) en segundos justo cuando se realizó la acción,
        estado resultante u otro valor relevante (opcional, creo que puede ser útil en algunos casos)> >*/

  // Para Entidades

  public agregarEntidad(): Entidad {
    const entidad = this.idSiguienteEntidad;
    this.idSiguienteEntidad++;
    this.entidades.set(entidad, new ComponenteContainer());
    return entidad;
  }

  public removerEntidad(entidad: Entidad): void {
    this.entidadesADestruir.push(entidad);
  }

  public getEntidades(): Map<Entidad, ComponenteContainer> {
    return this.entidades;
  }

  // Para Componentes

  public agregarComponente(entidad: Entidad, componente: Componente): void {
    this.entidades.get(entidad)?.agregar(componente);
    // this.verificarEntidad(entidad);
  }

  public getComponentes(entidad: Entidad): ComponenteContainer | undefined {
    return this.entidades.get(entidad);
  }

  public removerComponente(
    entidad: Entidad,
    claseComponente: ClaseComponente
  ): void {
    this.entidades.get(entidad)?.eliminar(claseComponente);
    // this.verificarEntidad(entidad);
  }

  // Para Sistemas

  public agregarSistema(sistema: Sistema): void {
    /*if (sistema.componentesRequeridos.size == 0) {
      console.warn(
        `Sistema ${sistema} no agregado: lista de componentes vacía.`
      );
      return;
    }*/

    sistema.ecsManager = this;

    this.sistemas.set(sistema, new Set());
    /*for (const entidad of this.entidades.keys()) {
      this.verificarEntidadSistema(entidad, sistema);
    }*/
  }

  public removerSistema(sistema: Sistema): void {
    this.sistemas.delete(sistema);
  }

  /**
   * Obtiene un sistema específico por su tipo/clase
   * Útil para acceder a sistemas desde controllers
   */
  public getSistema<T extends Sistema>(
    ClaseSistema: new (...args: unknown[]) => T
  ): T | undefined {
    for (const sistema of this.sistemas.keys()) {
      if (sistema instanceof ClaseSistema) {
        return sistema as T;
      }
    }
    return undefined;
  }

  /**
   * Obtiene todos los sistemas registrados
   */
  public getSistemas(): Map<Sistema, Set<Entidad>> {
    return this.sistemas;
  }

  /*public actualizar(): void {
    for (let [sistema, entidades] of this.sistemas.entries()) {
      sistema.actualizar(entidades);
    }
    while (this.entidadesADestruir.length > 0) {
      const entidad = this.entidadesADestruir.pop();
      if (entidad !== undefined) {
        this.destruirEntidad(entidad);
      }
    }
  }*/

  // Para verificaciones internas

  /*private destruirEntidad(entidad: Entidad): void {
    this.entidades.delete(entidad);
    for (let entidades of this.sistemas.values()) {
      entidades.delete(entidad);
    }
  }*/

  /*private verificarEntidad(entidad: Entidad): void {
    for (const sistema of this.sistemas.keys()) {
      this.verificarEntidadSistema(entidad, sistema);
    }
  }*/

  /*private verificarEntidadSistema(entidad: Entidad, sistema: Sistema): void {
    const componenteContainer = this.entidades.get(entidad);
    const componentesRequeridos = sistema.componentesRequeridos;
    if (componenteContainer?.tieneTodos(componentesRequeridos)) {
      this.sistemas.get(sistema)?.add(entidad);
    } else {
      this.sistemas.get(sistema)?.delete(entidad);
    }
  }*/

  // Sistema de eventos

  /**
   * Suscribe un callback a un evento específico
   * @param eventName Nombre del evento
   * @param callback Función a ejecutar cuando se emita el evento
   * @returns Función para desuscribirse del evento
   */
  public on(eventName: string, callback: EventCallback): () => void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName)!.add(callback);

    // Retorna función para desuscribirse
    return () => {
      this.eventListeners.get(eventName)?.delete(callback);
    };
  }

  /**
   * Emite un evento con datos opcionales
   * @param eventName Nombre del evento
   * @param data Datos a pasar a los callbacks
   */
  public emit(eventName: string, data?: unknown): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Remueve todos los listeners de un evento específico
   * @param eventName Nombre del evento
   */
  public off(eventName: string): void {
    this.eventListeners.delete(eventName);
  }

  ///// Sistema de acciones

  public registrarAccion(
    accion: string,
    objeto: string,
    tiempo?: number,
    val?: unknown
  ): void {
    this.accionesSimulacion.push([accion, objeto, tiempo, val]);
  }

  public consultarAccion(
    accion: string,
    objeto: string,
    tiempo?: number,
    val?: unknown
  ): [string, string, number | undefined, unknown?] | undefined {
    return this.accionesSimulacion.find(
      ([a, o, t, v]) =>
        a === accion &&
        o === objeto &&
        (tiempo === undefined ? true : t === tiempo) &&
        JSON.stringify(v) === JSON.stringify(val)
    );
  }

  public getAccionesSimulacion() {
    return this.accionesSimulacion;
  }
}
