import { AccionFirewall, DireccionTrafico } from '../../shared/types/FirewallTypes';
import type { Reglas } from '../../shared/types/FirewallTypes';
import type { TipoProtocolo } from '../../shared/types/TrafficEnums';
import type { Entidad } from '../core/Componente';

export class FirewallBuilder {
  private bloqueosFirewall: Map<Entidad, Reglas[]>;

  constructor() { 
    this.bloqueosFirewall = new Map();
  }
 
  agregarRegla(
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): this {
    const reglasExistentes = this.bloqueosFirewall.get(entidadRed) || [];
    const nuevaRegla: Reglas = { accion, direccion, protocolo };
    this.bloqueosFirewall.set(entidadRed, [...reglasExistentes, nuevaRegla]);
    return this;
  }

  agregarReglas(
    entidadRed: Entidad,
    protocolos: TipoProtocolo[],
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): this {
    protocolos.forEach(protocolo => {
      this.agregarRegla(entidadRed, protocolo, accion, direccion);
    });
    return this;
  }

  bloquearProtocolos(
    entidadRed: Entidad,
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): this {
    return this.agregarReglas(entidadRed, protocolos, AccionFirewall.DENEGAR, direccion);
  }

  bloquearTodoSaliente(entidadRed: Entidad, protocolos: TipoProtocolo[]): this {
    return this.bloquearProtocolos(entidadRed, protocolos, DireccionTrafico.HACIA);
  }

  bloquearTodoEntrante(entidadRed: Entidad, protocolos: TipoProtocolo[]): this {
    return this.bloquearProtocolos(entidadRed, protocolos, DireccionTrafico.DESDE);
  }
 
  bloquearTodo(entidadRed: Entidad, protocolos: TipoProtocolo[]): this {
    return this.bloquearProtocolos(entidadRed, protocolos, DireccionTrafico.AMBAS);
  }
 
  /*limpiarRed(entidadRed: Entidad): this {
    this.bloqueosFirewall.delete(entidadRed);
    return this;
  }*/
 
  /*limpiarTodo(): this {
    this.bloqueosFirewall.clear();
    return this;
  }*/
 
  build(): Map<Entidad, Reglas[]> {
    return this.bloqueosFirewall;
  }
}
