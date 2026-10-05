import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoAtaque,
  TipoDispositivo,
  TipoEvento,
  TipoProteccionVPN,
} from "../../shared/types/DeviceEnums";
import { TipoProtocolo } from "../../shared/types/TrafficEnums";
import {
  AccionesRealizables,
  ObjetosManejables,
} from "../../shared/types/AccionesEnums";
import { ColoresRed } from "../colores";
import { AccionFirewall, DireccionTrafico } from "../../shared/types/FirewallTypes";
import type { DefinicionEscenario } from "../../shared/types/EscenarioTypes";

/**
 * Escenario 10 — Control de Acceso y Protocolos Seguros
 * Capítulo 3 del sílabo: Control de acceso y protocolos seguros.
 *
 * Objetivo didáctico:
 *   - Aplicar múltiples configuraciones de hardening simultáneamente.
 *   - Defender contra un ataque que explota software no autorizado.
 *   - Segmentar red para separar zonas de confianza (control de acceso a nivel de red).
 *   - Configurar VPN con solo autenticación (modo A) para acceso interno.
 *
 * Dificultad: ★★★☆☆ (Medio)
 */
export const escenarioControlAcceso: DefinicionEscenario = {
  id: 10,
  slug: "control-acceso",
  titulo: "Control de Acceso y Protocolos Seguros",
  categoria: "Cap. 3 — Autenticación",
  descripcion:
    "La universidad TechU debe proteger sus laboratorios de investigación. " +
    "Aplica hardening, segmenta la red y habilita VPN autenticada para investigadores remotos.",
  presupuestoInicial: 2500,
  ataques: [
    {
      nombreAtaque: "Ejecución de software no autorizado",
      tiempoNotificacion: 37,
      tiempoEnOcurrir: 42,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "PC Estudiante",
      descripcion:
        "Un estudiante descargó software no autorizado con malware en el PC del aula. Si está bien protegido, el ataque se frena.",
      fase: 2,
      condicionMitigacion: {
        accion: AccionesRealizables.CLICK,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        val: [
          {
            nombreConfig: "Sin software externo",
            activado: true
          },
        ],
      },
    },
  ],
  eventos: [
    // ── FASE 1: Segmentación de red ──
    {
      nombreEvento: "Asignar laboratorio a red segura",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 5,
      tiempoEnOcurrir: 10,
      descripcion:
        "El 'PC Investigador' necesita comunicarse con el 'Servidor de Datos'. Asígnalo a la red 'LAN-Lab'.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Investigador",
        dispositivoDestino: "Servidor de Datos",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Bloquear acceso desde red estudiantil",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 15,
      tiempoEnOcurrir: 20,
      descripcion:
        "Los estudiantes no deben llegar al laboratorio por SSH. Bloquea ese acceso en el perímetro de la red del laboratorio.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Estudiante",
        dispositivoDestino: "Servidor de Datos",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 25,
      descripcion: "Red segmentada correctamente. Ahora debes proteger los equipos.",
      fase: 1,
    },
    // ── FASE 2: Hardening + ataque ──
    {
      nombreEvento: "Bloquear software externo en aula",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 30,
      tiempoEnOcurrir: 35,
      descripcion:
        "Un equipo del aula es vulnerable al software que bajan los estudiantes. Endurécelo para impedir instalaciones no autorizadas.",
      fase: 2,
      infoAdicional: {
        accion: AccionesRealizables.CLICK,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        val: { 
          nombreConfig: "Sin software externo",
          dispositivoAAtacar: "PC Estudiante",
          activado: true
        },
      },
    },
    {
      nombreEvento: "Completación Fase 2",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 45,
      descripcion: "Equipos protegidos. Ahora configura acceso remoto para investigadores.",
      fase: 2,
    },
    // ── FASE 3: VPN autenticada ──
    {
      nombreEvento: "Configurar VPN para investigador remoto",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 50,
      descripcion:
        "Un investigador necesita acceder al server del laboratorio desde casa. Configura VPN modo 'Encriptar y Autenticar' (EA) entre el gateway y su PC remoto.",
      fase: 3,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Lab",
          hostLan: "Servidor de Datos",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Investigador-Remoto",
          hostRemoto: "PC Remoto Investigador",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "TechU",
          hostRemoto: "Servidor de Datos",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 65,
      descripcion:
        "¡Felicidades! Has implementado control de acceso multicapa: " +
        "segmentación de red, hardening de dispositivos y VPN autenticada.",
      fase: 3,
    },
  ],
  accionesEsperadas: [
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.RED,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 10,
      val: {
        nombreDispositivo: "PC Investigador",
        nombreRed: "LAN-Lab"
      }
    },
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_FIREWALL,
      inicioTiempoEsperado: 15,
      finTiempoEsperado: 20,
      val: {
        nombreRouter: "Router Universidad",
        nombreRed: "LAN-Lab",
        accion: AccionFirewall.DENEGAR,
        direccion: DireccionTrafico.HACIA,
        protocolo: TipoProtocolo.SSH,
      }
    },
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_WORKSTATION,
      inicioTiempoEsperado: 30,
      finTiempoEsperado: 35,
      val: {
        nombreConfig: "Sin software externo",
        dispositivoAAtacar: "PC Estudiante",
        activado: true
      }
    },
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.PERFIL_VPN_GATEWAY,
      inicioTiempoEsperado: 50,
      finTiempoEsperado: 60,
      val: {
        nombreVPNGateway: "VPN Gateway Universidad",
        lanLocal: "LAN-Lab",
        hostLan: "Servidor de Datos",
        proteccion: TipoProteccionVPN.EA,
        dominioRemoto: "Investigador-Remoto",
        hostRemoto: "PC Remoto Investigador"
      }
    },
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.PERFIL_CLIENTE_VPN,
      inicioTiempoEsperado: 50,
      finTiempoEsperado: 60,
      val: {
        nombreCliente: "PC Remoto Investigador",
        proteccion: TipoProteccionVPN.EA,
        dominioRemoto: "TechU",
        hostRemoto: "Servidor de Datos"
      }
    },
  ],
  fases: [
    {
      id: 1, nombre: "Fase 1: Segmentación y control de acceso",
      descripcion: "Separa la red de laboratorio de la red estudiantil y bloquea accesos no autorizados.",
      faseActual: true, completada: false,
      objetivos: [
        { descripcion: "Asignar laboratorio a red segura", completado: false },
        { descripcion: "Bloquear acceso desde red estudiantil", completado: false },
      ],
    },
    {
      id: 2, nombre: "Fase 2: Hardening de equipos",
      descripcion: "Protege los equipos del aula contra software malicioso.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Bloquear software externo en aula", completado: false },
      ],
    },
    {
      id: 3, nombre: "Fase 3: Acceso remoto autenticado",
      descripcion: "Configura VPN autenticada para investigadores remotos.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Configurar VPN para investigador remoto", completado: false },
      ],
    },
  ],
  zonas: [
    {
      id: 1, nombre: "Campus TechU", dominio: "TechU",
      redes: [
        { nombre: "LAN-Lab", color: ColoresRed.CIAN },
        { nombre: "LAN-Aula", color: ColoresRed.VERDE },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        { nombre: "Dr. Felipe Castillo", correo: "felipe.castillo@techu.edu", nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA },
        { nombre: "Estudiante Martín", correo: "martin@techu.edu", nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA },
      ],
      oficinas: [
        {
          id: 1001, nombre: "Laboratorio de Investigación",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 10001, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Investigador",
                sistemaOperativo: "Ubuntu 24.04", hardware: "Dell Precision 5570",
                software: "MATLAB, Python, Jupyter",
                posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Dr. Felipe Castillo",
                activos: [{ nombre: "datos_investigacion.csv", contenido: "Datos de investigación confidenciales", tipo: TipoActivo.DOCUMENTO }],
                redes: [],
              }],
            },
            {
              id: 2, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 10002, tipo: TipoDispositivo.WORKSTATION, nombre: "Servidor de Datos",
                sistemaOperativo: "Ubuntu Server 22.04", hardware: "Dell PowerEdge R750",
                software: "PostgreSQL, JupyterHub, NFS",
                posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Dr. Felipe Castillo",
                activos: [], redes: ["LAN-Lab"],
              }],
            },
            {
              id: 3, mueble: Mueble.RACK, posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 10003, tipo: TipoDispositivo.ROUTER, nombre: "Router Universidad",
                sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 4331",
                software: "Routing, Firewall, VLAN",
                posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-Lab", "LAN-Aula", "Internet"], conectadoAInternet: true,
              }],
            },
            {
              id: 4, mueble: Mueble.RACK, posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 10004, tipo: TipoDispositivo.VPN, nombre: "VPN Gateway Universidad",
                sistemaOperativo: "FortiOS", hardware: "Fortinet FortiGate 200F", software: "VPN, IDS/IPS",
                posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-Lab", "Internet"], conectadoAInternet: true,
              }],
            },
          ],
        },
        {
          id: 1002, nombre: "Aula de Computación",
          posicion: { x: 6, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 10005, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Estudiante",
                sistemaOperativo: "Windows 10 Pro", hardware: "HP ProDesk 400 G7",
                software: "Office 365, Navegador Web",
                posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Estudiante Martín",
                activos: [], redes: ["LAN-Aula"],
              }],
            },
            {
              id: 6, mueble: Mueble.MESA, posicion: { x: 4, y: 0, z: 2.5, rotacionY: 180 },
              dispositivos: [],
            },
          ],
        },
      ],
    },
    {
      id: 2, nombre: "Casa Investigador", dominio: "Investigador-Remoto",
      redes: [
        { nombre: "Red-Casa", color: ColoresRed.INDIGO },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [{
        id: 1003, nombre: "Home Office",
        posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
        espacios: [
          {
            id: 1, mueble: Mueble.MESA, posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 10006, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Remoto Investigador",
              sistemaOperativo: "Ubuntu 24.04", hardware: "Dell Latitude 5540",
              software: "VPN Client, SSH, Jupyter",
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [], redes: ["Red-Casa"],
            }],
          },
          {
            id: 2, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 10007, tipo: TipoDispositivo.ROUTER, nombre: "Router Casa",
              sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 1100", software: "Routing, NAT",
              posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
              redes: ["Red-Casa", "Internet"], conectadoAInternet: true,
            }],
          },
        ],
      }],
    },
  ],
};
