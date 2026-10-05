import type {
  AtaqueComponent,
  EventoComponent,
  FaseComponent,
} from "../../ecs/components";
import type { Entidad } from "../../ecs/core";
import type { ColoresRed } from "../../data/colores";
import type { AccionesRealizables, ObjetosManejables } from "./AccionesEnums";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoAtaque,
  TipoDispositivo,
  TipoEvento,
  TipoProteccionVPN,
} from "./DeviceEnums";
import type { TipoLogGeneral } from "./EventosEnums";
import type { AccionFirewall, DireccionTrafico } from "./FirewallTypes";
import type { TipoProtocolo } from "./TrafficEnums";

export interface Escenario {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string;
  presupuestoInicial: number;
  zonas: Entidad[];
  ataques: AtaqueComponent[];
  eventos: EventoComponent[];
  fases: FaseComponent[];
  redes: Entidad[];
  accionesEsperadas: unknown[];
}

export interface EscenarioPreview {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string;
  categoria?: string;
}

export interface Zona {
  id: number;
  nombre: string;
}

export interface Dispositivo {
  id: number;
  tipo: TipoDispositivo;
  nombre?: string;
  sistemaOperativo?: string;
  hardware: string;
  software?: string;
  posicion?: { x: number; y: number; z: number; rotacionY?: number };
  estadoAtaque?: EstadoAtaqueDispositivo;
  // Id de la entidad ECS asociada (útil para acciones sobre la entidad)
  entidadId?: number;
  // Configuraciones del Workstation si aplica (las provee WorkstationComponent)
  configuraciones?: unknown;
  activos: Activo[];
  redes?: Array<{ nombre: string; color: string; entidadId: number }>;
  // Decorativo: se muestra en 3D pero se excluye de topología, escaneo e interacción.
  decorativo?: boolean;
}

export interface Activo {
  nombre: string;
  contenido?: string;
  tipo: TipoActivo;
  firma?: string; // En caso de que sea un documento firmado, se coloca el nombre de la firma
  propietario?: string;
}

export interface RegistroVeredictoFirma {
  nombreDocumento: string;
  nombreFirma: string;
  nombreClave: string;
  veredicto: boolean;
}

export interface SoftwareApp {
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface PerfilVPNGateway {
  lanLocal: string;
  hostLan: string;
  proteccion: TipoProteccionVPN;
  dominioRemoto: string;
  hostRemoto: string;
}

export interface PerfilClienteVPN {
  proteccion: TipoProteccionVPN;
  dominioRemoto: string;
  hostRemoto: string;
}

export interface Espacio {
  id: number;
  mueble: Mueble | null;
  posicion?: { x: number; y: number; z: number; rotacionY?: number };
  dispositivos: Dispositivo[];
}

export interface Oficina {
  id: number;
  nombre?: string;
  posicion?: { x: number; y: number; z: number };
  espacios: Espacio[];
}

export interface LogGeneral {
  tipo: TipoLogGeneral;
  mensaje: string;
  pausarTiempo: boolean;
}

export interface ObjetivoFase {
    descripcion: string;
    completado: boolean;
}

export interface InfoDispositivoEscaneado {
  nombre: string;
  sistOp: string;
  encargado: string;
}

export interface InfoPersonaEncontrada {
  nombre: string;
  correo: string;
  nivelConcienciaSeguridad: NivelConcienciaSeguridad;
}

export interface PlantillaCorreoPhishing {
  asunto: string;
  mensaje: string;
}

export interface RespuestaComando {
  texto: string;
  entidadActual: Entidad;
}

export interface DefinicionEscenario {
  id: number;
  slug: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  presupuestoInicial?: number;
  ataques: {
    nombreAtaque: string;
    tiempoNotificacion: number;
    tiempoEnOcurrir?: number;
    tipoAtaque: TipoAtaque;
    dispositivoAAtacar: string;
    descripcion: string;
    fase: number;
    condicionMitigacion: {
      accion: AccionesRealizables;
      objeto: ObjetosManejables;
      tiempo?: number;
      val: // El val (info adicional) dependerá del objeto de ObjetosManejables. Se maneja en SistemaEvento
      { // Para CONFIG_WORKSTATION
        nombreConfig: string;
        activado: boolean;
      }[] |
      { // Para CONFIG_FIREWALL
        nombreRed: string;
        accion: AccionFirewall;
        direccion: DireccionTrafico;
        protocolo: TipoProtocolo;
      }[];
    };
  }[];
  eventos: {
    nombreEvento: string;
    tipoEvento: TipoEvento;
    tiempoNotificacion: number;
    tiempoEnOcurrir?: number;
    descripcion: string;
    fase: number;
    infoAdicional?: // Lo mismo que el val de ataques pero aquí dependerá de TipoEvento
    { // Para ENVIO_ACTIVO
      nombreActivo: string;
      dispositivoEmisor: string;
      dispositivoReceptor: string;
    } |
    { // Para TRAFICO_RED
      dispositivoOrigen: string;
      dispositivoDestino: string;
      protocolo: TipoProtocolo;
      esObjetivo: boolean;
      debeSerBloqueado: boolean;
    } |
    { // Para CONEXION_VPN
      gateway: PerfilVPNGateway;
      cliente: PerfilClienteVPN;
    } | // Para VERIFICACION_FIRMA
    RegistroVeredictoFirma |
    { // Para VERIFICACION_ACCION_JUGADOR
      accion: AccionesRealizables;
      objeto: ObjetosManejables;
      tiempo?: number;
      val?: unknown; // Dependerá de las acciones que se quieran verificar, para su correcto uso se recomienda revisar ejemplos 
                     // en escenarios que utilicen este evento o los ejemplos definidos en 'SistemaEvento y SistemaFase.test.ts'.
    } |
    { // Para ENVIO_CORREO
      dispositivoEmisor: string;
      destinatario: string;
      asunto: string;
    };
    ejecutarAlInstante?: boolean;
  }[];
  accionesEsperadas: { // Son las acciones que se espera que el jugador realice durante la simulación,
                       // estas se guardan para el análisis de la partida, para comparlas con el registro 
                       // de acciones realizadas (las acciones que sí se realizaron en la simulación, obtenidas 
                       // de la estructura de accionesSimulacion del ECSManager).
    accion: AccionesRealizables;
    objeto: ObjetosManejables;
    inicioTiempoEsperado: number;
    finTiempoEsperado: number;
    val?: unknown; // Dependerá de las acciones que se esperen. Para una mejor comprensión y uso se recomienda revisar los 
                   // ejemplos en los escenarios que definan este atributo
  }[];
  fases: {
    id: number;
    nombre: string;
    descripcion: string;
    faseActual: boolean;
    completada: boolean;
    objetivos: ObjetivoFase[];
  }[];
  zonas: {
    id: number;
    nombre: string;
    dominio: string;
    esInteractiva?: boolean; // Útil para cuando se quiere que el jugador no pueda examinar dispositivos de otras zonas 
    redes: { nombre: string; color: ColoresRed; }[];
    personas?: {
      nombre: string;
      correo: string;
      nivelConcienciaSeguridad: NivelConcienciaSeguridad;
    }[];
    oficinas: {
      id: number;
      nombre: string;
      posicion: { x: number;  y: number; z: number; rotacionY: number; };
      espacios: {
        id: number;
        mueble: Mueble;
        posicion: { x: number; y: number; z: number; rotacionY: number; };
        dispositivos: {
          id: number;
          tipo: TipoDispositivo;
          nombre: string;
          sistemaOperativo: string;
          hardware: string;
          software: string;
          posicion: { x: number; y: number; z: number; rotacionY: number; };
          estadoAtaque: EstadoAtaqueDispositivo;
          personaEncargada?: string; // Sólo para workstations o servers
          /* 'nombreEquipo' es el nombre interno del dispositivo, mostrado en la consola/terminal de los dispositivos,
             y 'nombre' es el convencional, el nombre común con el que el jugador puede identificarlo en la escena. */
          nombreEquipo?: string; // --|- Normalmente, estos 3 se definirán sólo cuando
          usuario?: string;      //   |  se utilice la consola/terminal de los dispositivos.
          contrasenia?: string;  // --|  Principalmente usados para realizar actividades de SSH.
          activos: Activo[];
          redes: string[];
          conectadoAInternet?: boolean;
          // Se muestra en 3D pero no es utilizable. Útil para vestir escenas sin contaminar el nivel
          decorativo?: boolean;
        }[];
      }[];
    }[]; 
  }[];
}
