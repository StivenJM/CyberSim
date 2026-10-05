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
 * Escenario 11 — Segmentación PCI-DSS: Empresa Retail
 * Capítulo 4 del sílabo: Soluciones comunes de seguridad de redes.
 *
 * Objetivo didáctico:
 *   - Aplicar segmentación PCI-DSS para proteger datos de pago.
 *   - Configurar múltiples reglas de firewall (SSH y FTP).
 *   - Establecer VPN entre tienda y bodega remota.
 *
 * Dificultad: ★★★★☆ (Medio-Alto)
 */
export const escenarioSegmentacionPCI: DefinicionEscenario = {
  id: 11,
  slug: "segmentacion-pci",
  titulo: "Segmentación PCI-DSS: Empresa Retail",
  categoria: "Cap. 4 — Seguridad de Redes",
  descripcion:
    "Una cadena retail debe cumplir PCI-DSS para proteger datos de pago. Segmenta la red, " +
    "configura reglas de firewall y establece VPN entre tienda central y bodega remota.",
  presupuestoInicial: 2500,
  ataques: [],
  eventos: [
    {
      nombreEvento: "Segmentar red de pagos",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion:
        "PCI-DSS exige aislar los sistemas de pago. Lleva el terminal de pagos a la red de pagos para cumplir la norma.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Terminal de Pagos",
        dispositivoDestino: "Servidor de Pagos",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Bloquear SSH externo a PCI-DSS",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 25,
      descripcion:
        "El proveedor intenta entrar por SSH a la red de pagos. Bloquéalo con el firewall del router de la tienda.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Proveedor",
        dispositivoDestino: "Servidor de Pagos",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 45,
      descripcion: "¡Red de pagos segmentada y protegida! Ahora conecta la bodega de forma segura.",
      fase: 1,
    },
    {
      nombreEvento: "Conexión VPN con bodega",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 50,
      descripcion:
        "La bodega debe consultar el inventario de forma segura. Levanta una VPN entre el gateway de la tienda y su PC.",
      fase: 2,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Inventario",
          hostLan: "Servidor de Inventario",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Bodega",
          hostRemoto: "PC Bodega",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Tienda-Central",
          hostRemoto: "Servidor de Inventario",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 70,
      descripcion: "¡Felicidades! La red cumple con PCI-DSS y la bodega tiene conexión segura.",
      fase: 2,
    },
  ],
  fases: [
    {
      id: 1, nombre: "Fase 1: Segmentación PCI-DSS y firewall",
      descripcion: "Aísla la red de pagos y protégela con reglas de firewall estrictas.",
      faseActual: true, completada: false,
      objetivos: [
        { descripcion: "Segmentar red de pagos", completado: false },
        { descripcion: "Bloquear SSH externo a PCI-DSS", completado: false },
      ],
    },
    {
      id: 2, nombre: "Fase 2: VPN segura con bodega",
      descripcion: "Establece una conexión VPN cifrada y autenticada con la bodega remota.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Establecer VPN con bodega para consulta de inventario", completado: false },
      ],
    },
  ],
  zonas: [
    {
      id: 1, nombre: "Tienda Central", dominio: "Tienda-Central",
      redes: [
        { nombre: "PCI-DSS", color: ColoresRed.ROJO },
        { nombre: "LAN-Inventario", color: ColoresRed.VERDE },
        { nombre: "LAN-Oficina", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.NARANJA },
      ],
      personas: [
        { nombre: "Roberto Sánchez", correo: "roberto.sanchez@retail.com", nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA },
        { nombre: "Marta Ruiz", correo: "marta.ruiz@retail.com", nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA },
      ],
      oficinas: [
        {
          id: 1101, nombre: "Área de Cajas",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 11001, tipo: TipoDispositivo.WORKSTATION, nombre: "Terminal de Pagos",
                sistemaOperativo: "Windows 10 IoT", hardware: "HP RP9 Retail System",
                software: "POS Software, Payment Gateway",
                posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Roberto Sánchez",
                activos: [{ nombre: "transacciones_dia.log", contenido: "Registro de transacciones", tipo: TipoActivo.DOCUMENTO }],
                redes: [],
              }],
            },
            {
              id: 2, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 11002, tipo: TipoDispositivo.WORKSTATION, nombre: "Servidor de Pagos",
                sistemaOperativo: "Ubuntu Server 22.04", hardware: "Dell PowerEdge R750",
                software: "Payment Processor, TLS Gateway",
                posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Roberto Sánchez", activos: [], redes: ["PCI-DSS"],
              }],
            },
            {
              id: 3, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 11003, tipo: TipoDispositivo.ROUTER, nombre: "Router Tienda",
                sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 4331",
                software: "Routing, Firewall, VLAN",
                posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["PCI-DSS", "LAN-Inventario", "Internet"], conectadoAInternet: true,
              }],
            },
            {
              id: 4, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 11004, tipo: TipoDispositivo.VPN, nombre: "VPN Gateway Tienda",
                sistemaOperativo: "FortiOS", hardware: "Fortinet FortiGate 100F", software: "VPN, IDS",
                posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-Inventario", "Internet"], conectadoAInternet: true,
              }],
            },
          ],
        },
        {
          id: 1102, nombre: "Oficina Administrativa",
          posicion: { x: 6, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 11005, tipo: TipoDispositivo.WORKSTATION, nombre: "Servidor de Inventario",
                sistemaOperativo: "Ubuntu Server 22.04", hardware: "Dell PowerEdge R660",
                software: "ERP, Inventory Management",
                posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Marta Ruiz",
                activos: [{ nombre: "inventario_actual.csv", contenido: "Listado de inventario actualizado", tipo: TipoActivo.DOCUMENTO }],
                redes: ["LAN-Inventario"],
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
      id: 2, nombre: "Proveedor Externo", dominio: "Proveedor",
      redes: [
        { nombre: "Red-Proveedor", color: ColoresRed.MORADO },
        { nombre: "Internet", color: ColoresRed.NARANJA },
      ],
      oficinas: [{
        id: 1103, nombre: "Datacenter Proveedor",
        posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
        espacios: [
          {
            id: 1, mueble: Mueble.MESA, posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 11006, tipo: TipoDispositivo.WORKSTATION, nombre: "Servidor Proveedor",
              sistemaOperativo: "Ubuntu Server 22.04", hardware: "Dell PowerEdge R740",
              software: "API Gateway, EDI",
              posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [], redes: ["Red-Proveedor"],
            }],
          },
          {
            id: 2, mueble: Mueble.MESA, posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
            dispositivos: [{
              id: 11007, tipo: TipoDispositivo.ROUTER, nombre: "Router Proveedor",
              sistemaOperativo: "Cisco IOS", hardware: "Cisco ASR 1001-X",
              software: "Routing, Firewall, NAT",
              posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
              redes: ["Red-Proveedor", "Internet"], conectadoAInternet: true,
            }],
          },
        ],
      }],
    },
    {
      id: 3, nombre: "Bodega Remota", dominio: "Bodega",
      redes: [
        { nombre: "Red-Bodega", color: ColoresRed.LIMA },
        { nombre: "Internet", color: ColoresRed.NARANJA },
      ],
      oficinas: [{
        id: 1104, nombre: "Oficina de Bodega",
        posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
        espacios: [
          {
            id: 1, mueble: Mueble.MESA, posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 11008, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Bodega",
              sistemaOperativo: "Windows 10 Pro", hardware: "HP ProDesk 400 G7",
              software: "WMS, Office 365",
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [], redes: ["Red-Bodega"],
            }],
          },
          {
            id: 2, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 11009, tipo: TipoDispositivo.ROUTER, nombre: "Router Bodega",
              sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 1100", software: "Routing, Firewall",
              posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
              redes: ["Red-Bodega", "Internet"], conectadoAInternet: true,
            }],
          },
        ],
      }],
    },
  ],
};
