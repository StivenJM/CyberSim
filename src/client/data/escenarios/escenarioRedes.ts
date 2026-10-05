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
 * Escenario 4 — Seguridad de Redes: Firewall, Segmentación y VPN
 * Capítulo 4 del sílabo: Seguridad de redes.
 *
 * Objetivo didáctico:
 *   - Comprender segmentación de redes (separar redes por función/sensibilidad).
 *   - Configurar firewalls como solución de seguridad perimetral.
 *   - Establecer conexiones VPN para comunicación segura entre sedes.
 *   - Aplicar conceptos de Firewall, IDS/IPS y defensa en profundidad.
 *
 * Dificultad: ★★★☆☆ (Medio)
 *
 * Layout:
 * ╔══════════════════════════════════╗
 * ║  Zona 1 — Clínica MediSalud     ║
 * ║  ┌────────────────────────────┐  ║
 * ║  │ Terminal de Consultas      │  ║
 * ║  │ Servidor de Historiales    │  ║
 * ║  │ Router Clínica             │  ║
 * ║  │ VPN Gateway Clínica        │  ║
 * ║  └────────────────────────────┘  ║
 * ║  ┌────────────────────────────┐  ║
 * ║  │ PC Administrativo          │  ║
 * ║  │ Servidor Web               │  ║
 * ║  └────────────────────────────┘  ║
 * ╚══════════════════════════════════╝
 *
 * ╔══════════════════════╗   ╔══════════════════════╗
 * ║ Zona 2 — Proveedor   ║   ║ Zona 3 — Laboratorio ║
 * ║ ┌──────────────────┐  ║   ║ ┌──────────────────┐  ║
 * ║ │ Servidor Proveed. │  ║   ║ │ PC Laboratorio   │  ║
 * ║ │ Router Proveedor  │  ║   ║ │ Router Lab.      │  ║
 * ║ └──────────────────┘  ║   ║ └──────────────────┘  ║
 * ╚══════════════════════╝   ╚══════════════════════╝
 */
export const escenarioRedes: DefinicionEscenario = {
  id: 4,
  slug: "redes",
  titulo: "Seguridad de Redes: Firewall, Segmentación y VPN",
  categoria: "Cap. 4 — Seguridad de Redes",
  descripcion:
    "La clínica MediSalud debe proteger sus historiales médicos. Aplica segmentación por zonas, " +
    "firewall y una VPN segura con el laboratorio externo.",
  presupuestoInicial: 2500,
  ataques: [],
  eventos: [
    // ── FASE 1: Segmentación de red ──
    {
      nombreEvento: "Segmentar red de historiales médicos",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion:
        "El terminal de consultas debe llegar al servidor de historiales. Ponlo en la misma red médica que él.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Terminal de Consultas",
        dispositivoDestino: "Servidor de Historiales",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Bloquear acceso externo a red médica",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 25,
      descripcion:
        "Un proveedor externo intenta entrar por SSH a la red médica. Bloquéalo con el firewall del router.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Proveedor",
        dispositivoDestino: "Servidor de Historiales",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 45,
      descripcion:
        "¡Perfecto! La red médica quedó aislada del tráfico externo. Ahora conecta el laboratorio de forma segura.",
      fase: 1,
    },
    // ── FASE 2: Conexión VPN con laboratorio ──
    {
      nombreEvento: "Establecer VPN con laboratorio",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 50,
      descripcion:
        "El laboratorio debe enviar resultados de forma segura. Levanta una VPN entre el gateway de la clínica y su PC.",
      fase: 2,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Médica",
          hostLan: "Servidor de Historiales",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Laboratorio-Externo",
          hostRemoto: "PC Laboratorio",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "MediSalud",
          hostRemoto: "Servidor de Historiales",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 70,
      descripcion:
        "¡Felicidades! Aplicaste los tres pilares de la red: segmentación, firewall y VPN. Así se protege el perímetro.",
      fase: 2,
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Segmentación de red y firewall",
      descripcion:
        "La segmentación divide la red en zonas con diferentes niveles de confianza. " +
        "El firewall controla qué tráfico puede pasar entre zonas, actuando como guardia perimetral.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Segmentar red de historiales médicos",
          completado: false,
        },
        {
          descripcion: "Bloquear acceso externo a red médica",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Conexión VPN segura",
      descripcion:
        "Una VPN crea un túnel cifrado sobre una red pública (Internet), " +
        "permitiendo comunicación segura entre sedes remotas como si estuvieran en la misma red privada.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Establecer VPN con laboratorio para envío de resultados",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    // ── ZONA 1: Clínica MediSalud ──
    {
      id: 1,
      nombre: "Clínica MediSalud",
      dominio: "MediSalud",
      redes: [
        { nombre: "LAN-Médica", color: ColoresRed.CIAN },
        { nombre: "LAN-Admin", color: ColoresRed.VERDE },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "Dra. Carmen Flores",
          correo: "carmen.flores@medisalud.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
        {
          nombre: "Ing. Marcos Díaz",
          correo: "marcos.diaz@medisalud.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
      ],
      oficinas: [
        {
          id: 401,
          nombre: "Área de Consultas",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Terminal de Consultas",
                  sistemaOperativo: "Windows 10 Pro",
                  hardware: "HP ProOne 440 G9",
                  software: "Sistema de Consultas, HIS Client",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Dra. Carmen Flores",
                  activos: [
                    {
                      nombre: "agenda_citas.csv",
                      contenido: "Agenda de citas médicas del día",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: [],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor de Historiales",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "OpenEMR, PostgreSQL, HL7 FHIR",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Marcos Díaz",
                  activos: [
                    {
                      nombre: "historiales_medicos.db",
                      contenido: "Base de datos de historiales clínicos (confidencial)",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Médica"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4003,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Clínica",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall, IDS/IPS, VLAN",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Médica", "LAN-Admin", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4004,
                  tipo: TipoDispositivo.VPN,
                  nombre: "VPN Gateway Clínica",
                  sistemaOperativo: "FortiOS",
                  hardware: "Fortinet FortiGate 100F",
                  software: "VPN, IDS/IPS",
                  posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Médica", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
        {
          id: 402,
          nombre: "Oficina Administrativa",
          posicion: { x: 6, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4005,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Administrativo",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Lenovo ThinkCentre M90q",
                  software: "Office 365, SAP, Navegador Web",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Marcos Díaz",
                  activos: [],
                  redes: ["LAN-Admin"],
                },
              ],
            },
            {
              id: 6,
              mueble: Mueble.MESA,
              posicion: { x: 4, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4006,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Web",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R660",
                  software: "Nginx, Portal de Citas Online",
                  posicion: { x: 4, y: 0, z: 2.5, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Admin"],
                },
              ],
            },
          ],
        },
      ],
    },
    // ── ZONA 2: Proveedor Externo ──
    {
      id: 2,
      nombre: "Proveedor de Insumos",
      dominio: "Proveedor",
      redes: [
        { nombre: "Red-Proveedor", color: ColoresRed.MORADO },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 403,
          nombre: "Oficina Proveedor",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4007,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Proveedor",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R740",
                  software: "API Gateway, ERP",
                  posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Proveedor"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4008,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Proveedor",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Proveedor", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // ── ZONA 3: Laboratorio Externo ──
    {
      id: 3,
      nombre: "Laboratorio Clínico",
      dominio: "Laboratorio-Externo",
      redes: [
        { nombre: "Red-Lab", color: ColoresRed.LIMA },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 404,
          nombre: "Oficina de Laboratorio",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4009,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Laboratorio",
                  sistemaOperativo: "Windows 10 Pro",
                  hardware: "HP ProDesk 400 G7",
                  software: "LIMS, Office 365, VPN Client",
                  posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Dr. Pablo Gutiérrez",
                  activos: [
                    {
                      nombre: "resultados_lab.csv",
                      contenido: "Resultados de análisis clínicos pendientes de envío",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["Red-Lab"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 4010,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Laboratorio",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 1100",
                  software: "Routing, Firewall",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Lab", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
