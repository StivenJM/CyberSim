import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoAtaque,
  TipoDispositivo,
  TipoEvento,
} from "../../shared/types/DeviceEnums";
import { TipoProtocolo } from "../../shared/types/TrafficEnums";
import {
  AccionesRealizables,
  ObjetosManejables,
} from "../../shared/types/AccionesEnums";
import { ColoresRed } from "../colores";
import {
  AccionFirewall,
  DireccionTrafico,
} from "../../shared/types/FirewallTypes";
import type { DefinicionEscenario } from "../../shared/types/EscenarioTypes";

/**
 * Escenario 8 — Amenazas y Ataques Comunes
 * Capítulo 1 del sílabo: Requerimientos funcionales de seguridad.
 *
 * Objetivo didáctico:
 *   - Identificar amenazas y ataques comunes (troyano, acceso no autorizado).
 *   - Aplicar configuraciones de hardening como medida preventiva.
 *   - Comprender la relación amenaza → vulnerabilidad → riesgo → ataque.
 *
 * Dificultad: ★★☆☆☆ (Fácil-Medio)
 */
export const escenarioAmenazas: DefinicionEscenario = {
  id: 8,
  slug: "amenazas",
  titulo: "Amenazas y Ataques Comunes",
  categoria: "Cap. 1 — Introducción",
  descripcion:
    "Una consultora está bajo alerta. Bloquea accesos no autorizados con firewall " +
    "y endurece los workstations para frenar un troyano.",
  presupuestoInicial: 1000,
  ataques: [
    // ── FASE 2: Hardening contra amenaza interna ──
    {
      nombreAtaque: "Bloqueo de Troyano vía USB infectado",
      tiempoNotificacion: 25,
      tiempoEnOcurrir: 30,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "PC Secretaría",
      descripcion:
        "Un empleado podría conectar una USB infectada en el PC de secretaría sin saberlo. Endurécelo contra ese vector de ataque.",
      fase: 2,
      condicionMitigacion: {
        accion: AccionesRealizables.CLICK,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        val: [
          {
            nombreConfig: "Bloquear medios extraíbles",
            activado: true,
          },
        ],
      },
    },
  ],
  eventos: [
    // ── FASE 1: Bloquear amenaza externa ──
    {
      nombreEvento: "Bloquear acceso SSH externo",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 5,
      descripcion:
        "Llega un intento de conexión SSH desde Internet a la red de la oficina. Bloquea ese acceso no autorizado en el perímetro.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Externo",
        dispositivoDestino: "PC Director",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 20,
      descripcion:
        "¡Bien! Has bloqueado la amenaza externa. Ahora protege los equipos contra amenazas internas.",
      fase: 1,
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 35,
      descripcion:
        "¡Felicidades! Protegiste la empresa contra amenazas externas e internas. Recuerda: amenaza + vulnerabilidad = riesgo.",
      fase: 2,
    },
  ],
  accionesEsperadas: [
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_FIREWALL,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 15,
      val: {
        nombreRouter: "Router Oficina",
        nombreRed: "LAN-Oficina",
        accion: AccionFirewall.DENEGAR,
        direccion: DireccionTrafico.HACIA,
        protocolo: TipoProtocolo.SSH,
      },
    },
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_WORKSTATION,
      inicioTiempoEsperado: 25,
      finTiempoEsperado: 30,
      val: {
        nombreConfig: "Bloquear medios extraíbles",
        dispositivoAAtacar: "PC Secretaría",
        activado: true,
      },
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Bloquear amenaza externa",
      descripcion:
        "Las amenazas externas buscan explotar vulnerabilidades en tu red. " +
        "Usa el firewall para bloquear el acceso no autorizado.",
      faseActual: true,
      completada: false,
      objetivos: [
        { descripcion: "Bloquear acceso SSH externo", completado: false },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Proteger contra amenaza interna",
      descripcion:
        "Las amenazas internas (USB infectados, software malicioso) requieren " +
        "configuraciones preventivas en los dispositivos.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Bloqueo de Troyano vía USB infectado",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    {
      id: 1,
      nombre: "Consultora InfoTech",
      dominio: "InfoTech",
      redes: [
        { nombre: "LAN-Oficina", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "Ing. Patricia Morales",
          correo: "patricia.morales@infotech.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Sandra Ruiz",
          correo: "sandra.ruiz@infotech.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA,
        },
      ],
      oficinas: [
        {
          id: 801,
          nombre: "Oficina Principal",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 8001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Director",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell OptiPlex 7090",
                  software: "Office 365, Navegador",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Patricia Morales",
                  activos: [
                    {
                      nombre: "contratos_clientes.pdf",
                      contenido: "Contratos confidenciales",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Oficina"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 8002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Secretaría",
                  sistemaOperativo: "Windows 10 Pro",
                  hardware: "HP ProDesk 400 G7",
                  software: "Office 365, Outlook",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Sandra Ruiz",
                  activos: [],
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
                  id: 8003,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Oficina",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: -90 },
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
          id: 802,
          nombre: "Servidor Externo",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 8004,
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
                  id: 8005,
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
