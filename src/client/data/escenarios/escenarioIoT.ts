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
import type { DefinicionEscenario } from "../../shared/types/EscenarioTypes";

/**
 * Escenario 13 — Seguridad IoT e Infraestructura Crítica
 * Capítulo 6 del sílabo: Tendencias actuales (IoT, Cloud, etc.).
 *
 * Objetivo didáctico:
 *   - Comprender los riesgos de dispositivos IoT conectados a la red corporativa.
 *   - Segmentar redes IoT de redes corporativas.
 *   - Defender infraestructura crítica contra ataques dirigidos.
 *   - Establecer monitoreo seguro remoto vía VPN.
 *
 * Dificultad: ★★★★★ (Alto)
 */
export const escenarioIoT: DefinicionEscenario = {
  id: 13,
  slug: "iot",
  titulo: "Seguridad IoT e Infraestructura Crítica",
  categoria: "Cap. 6 — Tendencias Actuales",
  descripcion:
    "SmartFactory integró sensores IoT en producción. Segmenta la red IoT, protege los SCADA " +
    "con firewall, defiende contra un troyano y habilita monitoreo remoto seguro.",
  presupuestoInicial: 4000,
  ataques: [
    {
      nombreAtaque: "Troyano en sistema SCADA",
      tiempoNotificacion: 65,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "Estación SCADA",
      descripcion:
        "¡ALERTA CRÍTICA! Se detectó un intento de infección de troyano en la 'Estación SCADA'. " +
        "Si 'Actualizaciones automáticas de antivirus' está activado, el ataque será mitigado.",
      fase: 2,
      condicionMitigacion: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        val: [
          {
            nombreConfig: "Actualizaciones automáticas de antivirus",
            activado: true
          },
        ],
      },
    },
  ],
  eventos: [
    // ── FASE 1: Segmentación IoT ──
    {
      nombreEvento: "Aislar sensores IoT en red dedicada",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion:
        "Los sensores IoT deben vivir en su propia red, aislados del resto. Ubícalos en la red de planta.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Controlador IoT",
        dispositivoDestino: "Servidor de Producción",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Bloquear acceso externo a red IoT",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 25,
      descripcion:
        "Los sensores IoT no deben ser alcanzables desde Internet. Cierra ese acceso en el perímetro de la planta.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Monitoreo Remoto",
        dispositivoDestino: "Servidor de Producción",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 45,
      descripcion: "¡Red IoT segmentada! Ahora protege la infraestructura SCADA.",
      fase: 1,
    },
    // ── FASE 2: Proteger SCADA ──
    {
      nombreEvento: "Activar antivirus en estación SCADA",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 50,
      descripcion:
        "La estación SCADA controla procesos críticos. Protégela contra malware activando sus defensas.",
      fase: 2,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        tiempo: 0,
        val: { nombreConfig: "Actualizaciones automáticas de antivirus", activado: true },
      },
    },
    {
      nombreEvento: "Completación Fase 2",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 80,
      descripcion: "SCADA protegido. Ahora establece monitoreo remoto seguro.",
      fase: 2,
    },
    // ── FASE 3: Monitoreo remoto ──
    {
      nombreEvento: "VPN para monitoreo remoto",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 85,
      descripcion:
        "El NOC debe supervisar la planta de forma segura. Configura una VPN con modo EA entre 'VPN Gateway Planta' y 'PC Monitoreo Remoto'.",
      fase: 3,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-IoT",
          hostLan: "Servidor de Producción",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "NOC-Remoto",
          hostRemoto: "PC Monitoreo Remoto",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "SmartFactory",
          hostRemoto: "Servidor de Producción",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 105,
      descripcion:
        "¡Infraestructura IoT asegurada! Segmentar, blindar el SCADA y cifrar el acceso remoto son la base.",
      fase: 3,
    },
  ],
  fases: [
    {
      id: 1, nombre: "Fase 1: Segmentación de red IoT",
      descripcion: "Los dispositivos IoT deben estar en una red aislada, sin acceso directo desde Internet.",
      faseActual: true, completada: false,
      objetivos: [
        { descripcion: "Aislar sensores IoT en red dedicada", completado: false },
        { descripcion: "Bloquear acceso externo a red IoT", completado: false },
      ],
    },
    {
      id: 2, nombre: "Fase 2: Protección de infraestructura SCADA",
      descripcion: "Los sistemas SCADA controlan procesos críticos. Protégelos contra malware industrial.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Activar antivirus en estación SCADA", completado: false },
      ],
    },
    {
      id: 3, nombre: "Fase 3: Monitoreo remoto seguro",
      descripcion: "Establece acceso VPN cifrado para supervisión remota de la planta.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Establecer VPN para monitoreo remoto", completado: false },
      ],
    },
  ],
  zonas: [
    {
      id: 1, nombre: "Planta SmartFactory", dominio: "SmartFactory",
      redes: [
        { nombre: "LAN-IoT", color: ColoresRed.LIMA },
        { nombre: "LAN-Corp", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        { nombre: "Ing. Roberto Fuentes", correo: "roberto.fuentes@smartfactory.com", nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA },
        { nombre: "Técnico Carlos Luna", correo: "carlos.luna@smartfactory.com", nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA },
      ],
      oficinas: [
        {
          id: 1301, nombre: "Centro de Control",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 13001, tipo: TipoDispositivo.WORKSTATION, nombre: "Estación SCADA",
                sistemaOperativo: "Windows 10 LTSC", hardware: "Siemens IPC677E",
                software: "WinCC, SCADA Runtime, PLC Manager",
                posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Ing. Roberto Fuentes",
                activos: [
                  { nombre: "config_plc.bak", contenido: "Configuración PLC — línea de producción A", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-Corp"],
              }],
            },
            {
              id: 2, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 13002, tipo: TipoDispositivo.WORKSTATION, nombre: "Servidor de Producción",
                sistemaOperativo: "Ubuntu Server 22.04", hardware: "Dell PowerEdge R750",
                software: "MQTT Broker, InfluxDB, Grafana",
                posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Ing. Roberto Fuentes",
                activos: [
                  { nombre: "datos_sensores.db", contenido: "Base de datos de telemetría IoT", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-IoT"],
              }],
            },
            {
              id: 3, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 13003, tipo: TipoDispositivo.ROUTER, nombre: "Router Planta",
                sistemaOperativo: "Cisco IOS", hardware: "Cisco IE-4010",
                software: "Routing, Firewall, Industrial Protocol Support",
                posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-IoT", "LAN-Corp", "Internet"], conectadoAInternet: true,
              }],
            },
            {
              id: 4, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 13004, tipo: TipoDispositivo.VPN, nombre: "VPN Gateway Planta",
                sistemaOperativo: "FortiOS", hardware: "Fortinet FortiGate 200F", software: "VPN, IDS/IPS",
                posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-IoT", "Internet"], conectadoAInternet: true,
              }],
            },
          ],
        },
        {
          id: 1302, nombre: "Piso de Producción",
          posicion: { x: 6, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 13005, tipo: TipoDispositivo.WORKSTATION, nombre: "Controlador IoT",
                sistemaOperativo: "Raspberry Pi OS", hardware: "Raspberry Pi 4 Industrial",
                software: "MQTT Client, Sensor Gateway, Edge Computing",
                posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Técnico Carlos Luna",
                activos: [], redes: [],
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
      id: 2, nombre: "NOC Remoto", dominio: "NOC-Remoto",
      redes: [
        { nombre: "Red-NOC", color: ColoresRed.MORADO },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [{
        id: 1303, nombre: "Centro de Monitoreo",
        posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
        espacios: [
          {
            id: 1, mueble: Mueble.MESA, posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 13006, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Monitoreo Remoto",
              sistemaOperativo: "Ubuntu 24.04", hardware: "Dell Precision 5570",
              software: "Grafana, VPN Client, Wireshark",
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [], redes: ["Red-NOC"],
            }],
          },
          {
            id: 2, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 13007, tipo: TipoDispositivo.ROUTER, nombre: "Router NOC",
              sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 1100", software: "Routing, Firewall",
              posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
              redes: ["Red-NOC", "Internet"], conectadoAInternet: true,
            }],
          },
        ],
      }],
    },
  ],
};
