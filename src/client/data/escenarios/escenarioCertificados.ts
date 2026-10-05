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
 * Escenario 9 — Certificados Digitales y PKI
 * Capítulo 2 del sílabo: Funciones hash, certificados digitales y PKI.
 *
 * Objetivo didáctico:
 *   - Practicar verificación de múltiples documentos firmados (cadena de confianza).
 *   - Configurar firewall para proteger el servidor de certificados.
 *   - Establecer VPN con solo autenticación (modo A) vs cifrado completo (EA).
 *
 * Dificultad: ★★★☆☆ (Medio)
 */
export const escenarioCertificados: DefinicionEscenario = {
  id: 9,
  slug: "certificados",
  titulo: "Certificados Digitales y PKI",
  categoria: "Cap. 2 — Criptografía",
  descripcion:
    "La CA InternalCA emite certificados digitales. Verifica firmas, protege el servidor CA " +
    "con firewall y cifra la emisión a la sucursal con VPN.",
  presupuestoInicial: 2000,
  ataques: [],
  eventos: [
    {
      nombreEvento: "Verificar certificado del servidor",
      tipoEvento: TipoEvento.VERIFICACION_FIRMA,
      tiempoNotificacion: 5,
      descripcion:
        "Llegó el 'Certificado Servidor Web', supuestamente emitido por la CA. Verifícalo y decide si es auténtico.",
      fase: 1,
      infoAdicional: {
        nombreDocumento: "Certificado Servidor Web",
        nombreFirma: "Firma CA Servidor",
        nombreClave: "Clave_Publica_CA",
        veredicto: true,
      },
    },
    {
      nombreEvento: "Detectar certificado falsificado",
      tipoEvento: TipoEvento.VERIFICACION_FIRMA,
      tiempoNotificacion: 20,
      descripcion:
        "Llegó el 'Certificado Sospechoso' que dice venir de la CA, pero podría ser falso. Verifícalo y emite tu veredicto.",
      fase: 1,
      infoAdicional: {
        nombreDocumento: "Certificado Sospechoso",
        nombreFirma: "Firma CA Sospechoso",
        nombreClave: "Clave_Publica_CA",
        veredicto: false,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 35,
      descripcion: "¡Bien! Confiar solo en lo que la firma de la CA respalda. Ahora protege la infraestructura.",
      fase: 1,
    },
    {
      nombreEvento: "Proteger servidor de CA",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 40,
      descripcion:
        "El servidor de la CA es crítico: si lo comprometen, emitirían certificados falsos. Ciérrale el acceso externo.",
      fase: 2,
      infoAdicional: {
        dispositivoOrigen: "PC Sucursal",
        dispositivoDestino: "Servidor CA",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 2",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 55,
      descripcion: "Servidor CA protegido. Ahora establece un canal seguro con la sucursal.",
      fase: 2,
    },
    {
      nombreEvento: "VPN cifrada para emisión de certificados",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 60,
      descripcion:
        "La sucursal debe recibir los certificados sin que nadie los intercepte. Configura la VPN con modo EA.",
      fase: 3,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-CA",
          hostLan: "Servidor CA",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Sucursal",
          hostRemoto: "PC Sucursal",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "CA-Central",
          hostRemoto: "Servidor CA",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 80,
      descripcion:
        "¡PKI bajo control! Verificar firmas, blindar la CA y cifrar la emisión sostienen la confianza.",
      fase: 3,
    },
  ],
  fases: [
    {
      id: 1, nombre: "Fase 1: Verificar cadena de confianza",
      descripcion: "Verifica certificados digitales emitidos por la CA y detecta certificados falsificados.",
      faseActual: true, completada: false,
      objetivos: [
        { descripcion: "Verificar certificado del servidor", completado: false },
        { descripcion: "Detectar certificado falsificado", completado: false },
      ],
    },
    {
      id: 2, nombre: "Fase 2: Proteger servidor CA",
      descripcion: "El servidor de la Autoridad Certificadora debe estar protegido contra accesos no autorizados.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Proteger servidor de CA", completado: false },
      ],
    },
    {
      id: 3, nombre: "Fase 3: Distribución segura de certificados",
      descripcion: "Establece una VPN cifrada para distribuir certificados de forma segura a la sucursal.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Establecer VPN cifrada para emisión de certificados", completado: false },
      ],
    },
  ],
  zonas: [
    {
      id: 1, nombre: "Centro de Certificación", dominio: "CA-Central",
      redes: [
        { nombre: "LAN-CA", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        { nombre: "Ing. Alejandro Vega", correo: "alejandro.vega@ca.com", nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA },
      ],
      oficinas: [
        {
          id: 901, nombre: "Sala de Certificación",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 9001, tipo: TipoDispositivo.WORKSTATION, nombre: "Servidor CA",
                sistemaOperativo: "Ubuntu Server 22.04", hardware: "Dell PowerEdge R750",
                software: "OpenSSL, EJBCA, HSM Manager",
                posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Ing. Alejandro Vega",
                activos: [
                  { nombre: "Certificado Servidor Web", contenido: "CN=webserver.corp.com\nO=Corp S.A.\nValidity: 2025-2026\nSerial: 4A:2B:8C", tipo: TipoActivo.DOCUMENTO, firma: "Firma CA Servidor" },
                  { nombre: "Firma CA Servidor", contenido: "CN=webserver.corp.com\nO=Corp S.A.\nValidity: 2025-2026\nSerial: 4A:2B:8C", tipo: TipoActivo.FIRMA_DIGITAL, propietario: "InternalCA" },
                  { nombre: "Certificado Sospechoso", contenido: "CN=webserver.corp.com\nO=Corp S.A.\nValidity: 2025-2026\nSerial: MODIFICADO-POR-ATACANTE", tipo: TipoActivo.DOCUMENTO, firma: "Firma CA Sospechoso" },
                  { nombre: "Firma CA Sospechoso", contenido: "CN=webserver.corp.com\nO=Corp S.A.\nValidity: 2025-2026\nSerial: 4A:2B:8C", tipo: TipoActivo.FIRMA_DIGITAL, propietario: "InternalCA" },
                  { nombre: "Clave_Publica_CA", tipo: TipoActivo.CLAVE_PUBLICA, propietario: "InternalCA" },
                ],
                redes: ["LAN-CA"],
              }],
            },
            {
              id: 2, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 9002, tipo: TipoDispositivo.ROUTER, nombre: "Router CA",
                sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 4331", software: "Routing, Firewall",
                posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-CA", "Internet"], conectadoAInternet: true,
              }],
            },
            {
              id: 3, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 9003, tipo: TipoDispositivo.VPN, nombre: "VPN Gateway CA",
                sistemaOperativo: "FortiOS", hardware: "Fortinet FortiGate 100F", software: "VPN, IDS",
                posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-CA", "Internet"], conectadoAInternet: true,
              }],
            },
          ],
        },
      ],
    },
    {
      id: 2, nombre: "Sucursal", dominio: "Sucursal",
      redes: [
        { nombre: "Red-Sucursal", color: ColoresRed.VERDE },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 902, nombre: "Oficina Sucursal",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1, mueble: Mueble.MESA, posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 9004, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Sucursal",
                sistemaOperativo: "Windows 11 Pro", hardware: "Dell OptiPlex 7090",
                software: "VPN Client, Office 365",
                posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [], redes: ["Red-Sucursal"],
              }],
            },
            {
              id: 2, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 9005, tipo: TipoDispositivo.ROUTER, nombre: "Router Sucursal",
                sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 1100", software: "Routing, Firewall",
                posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["Red-Sucursal", "Internet"], conectadoAInternet: true,
              }],
            },
          ],
        },
      ],
    },
  ],
};
