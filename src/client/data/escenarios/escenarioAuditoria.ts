import {
  AccionesRealizables,
  ObjetosManejables,
} from "../../shared/types/AccionesEnums";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
  TipoProteccionVPN,
} from "../../shared/types/DeviceEnums";
import type { DefinicionEscenario } from "../../shared/types/EscenarioTypes";
import { TipoProtocolo } from "../../shared/types/TrafficEnums";
import { ColoresRed } from "../colores";

/**
 * Escenario 12 — Auditoría de Seguridad Empresarial
 * Capítulo 5 del sílabo: Fundamentos de SGSI.
 *
 * Objetivo didáctico:
 *   - Realizar escaneo de dispositivos y búsqueda de personas (reconocimiento).
 *   - Evaluar vulnerabilidades de ingeniería social (phishing).
 *   - Aplicar controles correctivos (firewall, VPN).
 *
 * Dificultad: ★★★★☆ (Medio-Alto)
 */
export const escenarioAuditoria: DefinicionEscenario = {
  id: 12,
  slug: "auditoria",
  titulo: "Auditoría de Seguridad Empresarial",
  categoria: "Cap. 5 — Administración de Riesgos",
  descripcion:
    "Auditas a LogiCorp. Escanea la infraestructura, detecta vulnerabilidades humanas " +
    "y aplica controles correctivos de red.",
  presupuestoInicial: 3000,
  ataques: [],
  eventos: [
    // ── FASE 1: Reconocimiento ──
    {
      nombreEvento: "Escaneo de infraestructura",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 5,
      descripcion:
        "Toda auditoría empieza por reconocer el terreno. Escanea la infraestructura de LogiCorp con Net-Scan Viz.",
      fase: 1,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.APLICACION,
        tiempo: 0,
        val: { nombreAplicacion: "Net-Scan Viz" },
      },
    },
    {
      nombreEvento: "Búsqueda de empleados",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 20,
      descripcion:
        "Las personas también son un vector de ataque. Perfila a los empleados con Company Social-Searcher.",
      fase: 1,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.APLICACION,
        tiempo: 0,
        val: { nombreAplicacion: "Company Social-Searcher" },
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 35,
      descripcion: "Reconocimiento completado. Ahora aplica controles correctivos.",
      fase: 1,
    },
    // ── FASE 2: Controles correctivos ──
    {
      nombreEvento: "Bloquear acceso no autorizado al servidor",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 40,
      descripcion:
        "El servidor de datos quedó expuesto por SSH desde Internet: falla crítica. Ciérrale ese acceso en el perímetro.",
      fase: 2,
      infoAdicional: {
        dispositivoOrigen: "PC Auditor",
        dispositivoDestino: "Servidor de Datos",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Establecer canal seguro para auditoría",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 55,
      descripcion:
        "Para seguir auditando sin filtraciones, cifra el canal. Configura una VPN con modo EA hacia la red corporativa.",
      fase: 2,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Corp",
          hostLan: "Servidor de Datos",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Auditor-Externo",
          hostRemoto: "PC Auditor",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "LogiCorp",
          hostRemoto: "Servidor de Datos",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 75,
      descripcion:
        "¡Auditoría completada! Un SGSI vive de auditorías periódicas que detectan y corrigen riesgos.",
      fase: 2,
    },
  ],
  fases: [
    {
      id: 1, nombre: "Fase 1: Reconocimiento y análisis",
      descripcion: "Escanea la infraestructura e identifica vulnerabilidades humanas y técnicas.",
      faseActual: true, completada: false,
      objetivos: [
        { descripcion: "Escaneo de infraestructura", completado: false },
        { descripcion: "Búsqueda de empleados", completado: false },
      ],
    },
    {
      id: 2, nombre: "Fase 2: Controles correctivos",
      descripcion: "Aplica controles de red (firewall, VPN) para mitigar las vulnerabilidades encontradas.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Bloquear acceso no autorizado al servidor", completado: false },
        { descripcion: "Establecer canal seguro para auditoría", completado: false },
      ],
    },
  ],
  zonas: [
    {
      id: 1, nombre: "Oficinas LogiCorp", dominio: "LogiCorp",
      redes: [
        { nombre: "LAN-Corp", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        { nombre: "Gabriela Herrera", correo: "gabriela.herrera@logicorp.com", nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA },
        { nombre: "Diego Paredes", correo: "diego.paredes@logicorp.com", nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA },
        { nombre: "Valentina Cruz", correo: "valentina.cruz@logicorp.com", nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA },
      ],
      oficinas: [
        {
          id: 1201, nombre: "Centro de Datos",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 12001, tipo: TipoDispositivo.WORKSTATION, nombre: "Servidor de Datos",
                sistemaOperativo: "Ubuntu Server 22.04", hardware: "Dell PowerEdge R750",
                software: "PostgreSQL, Apache, LDAP",
                posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Valentina Cruz",
                activos: [
                  { nombre: "politica_seguridad.pdf", contenido: "Política de seguridad corporativa v2.1", tipo: TipoActivo.DOCUMENTO },
                  { nombre: "inventario_activos.xlsx", contenido: "Inventario de activos de información", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-Corp"],
              }],
            },
            {
              id: 2, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 12002, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Operaciones",
                sistemaOperativo: "Windows 11 Pro", hardware: "Dell OptiPlex 7090",
                software: "Office 365, ERP, Navegador",
                posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Diego Paredes", activos: [], redes: ["LAN-Corp"],
              }],
            },
            {
              id: 3, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 12003, tipo: TipoDispositivo.ROUTER, nombre: "Router LogiCorp",
                sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 4331", software: "Routing, Firewall",
                posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-Corp", "Internet"], conectadoAInternet: true,
              }],
            },
            {
              id: 4, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 12004, tipo: TipoDispositivo.VPN, nombre: "VPN Gateway LogiCorp",
                sistemaOperativo: "FortiOS", hardware: "Fortinet FortiGate 200F", software: "VPN, IDS/IPS",
                posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-Corp", "Internet"], conectadoAInternet: true,
              }],
            },
          ],
        },
      ],
    },
    {
      id: 2, nombre: "Oficina del Auditor", dominio: "Auditor-Externo",
      redes: [
        { nombre: "Red-Auditor", color: ColoresRed.INDIGO },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [{
        id: 1202, nombre: "Consultora de Auditoría",
        posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
        espacios: [
          {
            id: 1, mueble: Mueble.MESA, posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 12005, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Auditor",
              sistemaOperativo: "Kali Linux 2024.4", hardware: "Dell Precision 5570",
              software: "Nmap, Nessus, Wireshark, VPN Client",
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [], redes: ["Red-Auditor"],
            }],
          },
          {
            id: 2, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 12006, tipo: TipoDispositivo.ROUTER, nombre: "Router Auditor",
              sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 1100", software: "Routing, NAT",
              posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
              redes: ["Red-Auditor", "Internet"], conectadoAInternet: true,
            }],
          },
        ],
      }],
    },
  ],
};
