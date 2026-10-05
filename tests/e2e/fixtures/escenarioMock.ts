// Escenario sintético para pruebas E2E. No es contenido de producción: vive fuera de
// src/client/data/escenarios, así que no entra al registro real ni aparece en la UI.
// Ejercita la mecánica (progresión de fases, firewall, hardening) con datos que el test
// controla; sobrevive a que se edite o borre cualquier escenario real. Se inyecta vía el
// seam de SelectedLevelContext (window.__E2E_ESCENARIO__), inerte en producción.

import { TipoDispositivo, TipoActivo, TipoAtaque, EstadoAtaqueDispositivo, Mueble, TipoEvento } from "../../../src/client/shared/types/DeviceEnums";
import { AccionesRealizables, ObjetosManejables } from "../../../src/client/shared/types/AccionesEnums";
import { TipoProtocolo } from "../../../src/client/shared/types/TrafficEnums";
import { ColoresRed } from "../../../src/client/data/colores";

export const SLUG_MOCK = "e2e-mock";
export const ID_MOCK = 9001;

export const escenarioMock: unknown = {
  id: ID_MOCK,
  slug: SLUG_MOCK,
  titulo: "E2E Mock: Mecánica controlada",
  descripcion: "Escenario sintético para pruebas E2E. No es contenido real.",
  categoria: "E2E",
  presupuestoInicial: 1000,

  // Fase 1: objetivo de red (/redes + firewall). Fase 2: objetivo de hardening (/dispositivos).
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Bloquear amenaza externa",
      descripcion: "Bloquear el acceso SSH desde el servidor externo.",
      faseActual: true,
      completada: false,
      objetivos: [
        { descripcion: "Bloquear acceso SSH externo", completado: false },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Endurecer dispositivos",
      descripcion: "Mitigar el troyano vía USB en la workstation.",
      faseActual: false,
      completada: false,
      objetivos: [
        { descripcion: "Bloquear medios extraíbles", completado: false },
      ],
    },
  ],

  eventos: [
    {
      nombreEvento: "Bloquear acceso SSH externo",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 3,
      descripcion: "El servidor externo intenta SSH contra el PC Director.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Externo",
        dispositivoDestino: "PC Director",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
  ],

  ataques: [
    {
      nombreAtaque: "Bloqueo de Troyano vía USB",
      tiempoNotificacion: 8,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "PC Director",
      descripcion: "Un troyano intenta ejecutarse desde un medio extraíble.",
      fase: 2,
      condicionMitigacion: {
        accion: AccionesRealizables.CLICK,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        val: [{ nombreConfig: "Bloquear medios extraíbles", activado: true }],
      },
    },
  ],

  redes: [],
  accionesEsperadas: [],

  zonas: [
    {
      id: 1,
      nombre: "Consultora E2E",
      dominio: "E2E",
      redes: [{ nombre: "LAN-Oficina", color: ColoresRed.CIAN }],
      oficinas: [
        {
          id: 9801,
          nombre: "Oficina Principal",
          posicion: { x: 0, y: 0, z: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0 },
              dispositivos: [
                {
                  id: 9001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Director",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell OptiPlex 7090",
                  posicion: { x: 0, y: 0, z: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [
                    {
                      nombre: "contratos.pdf",
                      contenido: "Documento de prueba",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Oficina"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.RACK,
              posicion: { x: 2, y: 0, z: 0 },
              dispositivos: [
                {
                  id: 9002,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Principal",
                  hardware: "Cisco ISR 1100",
                  posicion: { x: 2, y: 0, z: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Oficina"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
