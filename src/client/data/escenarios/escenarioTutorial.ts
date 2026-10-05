import { AccionesRealizables, ObjetosManejables } from "../../shared/types/AccionesEnums";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
} from "../../shared/types/DeviceEnums";
import type { DefinicionEscenario } from "../../shared/types/EscenarioTypes";
import { AccionFirewall, DireccionTrafico } from "../../shared/types/FirewallTypes";
import { TipoProtocolo } from "../../shared/types/TrafficEnums";
import { ColoresRed } from "../colores";

/**
 * Escenario 1 — Tutorial: Introducción a la Seguridad Informática
 * Capítulo 1 del sílabo: Conceptos básicos de seguridad.
 *
 * Objetivo didáctico:
 *   - Familiarizar al jugador con la interfaz del juego.
 *   - Introducir los conceptos de Confidencialidad, Integridad y Disponibilidad (CIA).
 *   - Enseñar las mecánicas básicas: asignar redes y configurar firewall.
 *
 * Dificultad: ★☆☆☆☆ (Muy fácil — guiado)
 *
 * Layout:
 * ╔═══════════════════════════╗   ╔═══════════════════════╗
 * ║  Zona 1 — Oficina        ║   ║  Zona 2 — Internet    ║
 * ║  ┌─────────────────────┐  ║   ║  ┌─────────────────┐  ║
 * ║  │ PC Empleado         │  ║   ║  │ Servidor Externo│  ║
 * ║  │ Servidor Interno    │  ║   ║  │ Router Externo  │  ║
 * ║  │ Router Principal    │  ║   ║  └─────────────────┘  ║
 * ║  └─────────────────────┘  ║   ╚═══════════════════════╝
 * ╚═══════════════════════════╝
 */
export const escenarioTutorial: DefinicionEscenario = {
  id: 1,
  slug: "tutorial",
  titulo: "Tutorial: Introducción a la Seguridad",
  categoria: "Cap. 1 — Introducción",
  descripcion:
    "Tu primer día como administrador en TechStart. Aprende los tres pilares de la seguridad: " +
    "Confidencialidad, Integridad y Disponibilidad (CIA).",
  presupuestoInicial: 500,
  ataques: [],
  eventos: [
    // ── FASE 1: Disponibilidad ──
    {
      nombreEvento: "Restaurar conectividad interna",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 5,
      tiempoEnOcurrir: 10,
      descripcion:
        "El PC Empleado no llega al servidor interno: no tiene red. Conéctalo a la LAN de la oficina.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Empleado",
        dispositivoDestino: "Servidor Interno",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 15,
      descripcion:
        "¡Excelente! Restauraste la disponibilidad del sistema. Ahora protege la confidencialidad de los datos.",
      fase: 1,
    },
    // ── FASE 2: Confidencialidad ──
    {
      nombreEvento: "Bloquear acceso SSH externo",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 20,
      tiempoEnOcurrir: 25,
      descripcion:
        "Alguien intenta entrar por SSH desde Internet a tu red interna. Usa el firewall del router para frenarlo.",
      fase: 2,
      infoAdicional: {
        dispositivoOrigen: "Servidor Externo",
        dispositivoDestino: "PC Empleado",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 30,
      descripcion:
        "¡Tutorial completado! Dominas disponibilidad y confidencialidad.",
      fase: 2,
    },
  ],
  accionesEsperadas: [
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.RED,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 10,
      val: {
        nombreDispositivo: "PC Empleado",
        nombreRed: "LAN-Oficina"
      }
    },
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_FIREWALL,
      inicioTiempoEsperado: 20,
      finTiempoEsperado: 25,
      val: {
        nombreRouter: "Router Principal",
        nombreRed: "LAN-Oficina",
        accion: AccionFirewall.DENEGAR,
        direccion: DireccionTrafico.HACIA,
        protocolo: TipoProtocolo.SSH,
      },
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Disponibilidad — Conectar sistemas",
      descripcion:
        "La disponibilidad es uno de los tres pilares de la seguridad (CIA). Significa que los sistemas y datos " +
        "deben estar accesibles cuando se necesiten. Asigna la red correcta al PC del empleado.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Restaurar conectividad interna",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Confidencialidad — Bloquear intrusos",
      descripcion:
        "La confidencialidad protege la información contra accesos no autorizados. " +
        "Configura el firewall para bloquear conexiones SSH desde Internet.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Bloquear acceso SSH externo",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    // ── ZONA 1: Oficina TechStart ──
    {
      id: 1,
      nombre: "Oficina TechStart",
      dominio: "TechStart",
      redes: [
        { nombre: "LAN-Oficina", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "María López",
          correo: "maria.lopez@techstart.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
        {
          nombre: "Pedro Ramírez",
          correo: "pedro.ramirez@techstart.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
      ],
      oficinas: [
        {
          id: 101,
          nombre: "Oficina Principal",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Empleado",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell OptiPlex 7090",
                  software: "Office 365, Navegador Web",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "María López",
                  activos: [
                    {
                      nombre: "reporte_mensual.docx",
                      contenido: "Reporte de actividades del mes",
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
                  id: 1002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Interno",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "Apache, MySQL, Management Service",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Pedro Ramírez",
                  activos: [
                    {
                      nombre: "datos_clientes.db",
                      contenido: "Base de datos de clientes (confidencial)",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Oficina"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.RACK,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1003,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Principal",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Oficina", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // ── ZONA 2: Internet ──
    {
      id: 2,
      nombre: "Internet",
      dominio: "WWW",
      redes: [
        { nombre: "Red-Externa", color: ColoresRed.NARANJA },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 201,
          nombre: "Servidor Externo",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Externo",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R740",
                  software: "Apache, DNS",
                  posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Externa"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.RACK,
              posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2002,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Externo",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, NAT",
                  posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Externa", "Internet"],
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
