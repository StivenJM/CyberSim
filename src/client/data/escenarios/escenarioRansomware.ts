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

export const escenarioRansomware: DefinicionEscenario = {
  id: 6,
  slug: "ransomware",
  titulo: "Gestión de Riesgos: Respuesta a Incidentes",
  categoria: "Cap. 5 — Administración de Riesgos",
  descripcion:
    "Un hospital detecta ransomware activo. Ejecuta la respuesta a incidentes: contén la amenaza, " +
    "protege activos críticos y habilita VPN de emergencia para el CSIRT.",
  presupuestoInicial: 3000,
  ataques: [],
  eventos: [
    {
      nombreEvento: "Aislar sistema infectado",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion:
        "Hay un equipo de la clínica con ransomware activo. Aíslalo de la red antes de que infecte al resto.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Estación de Enfermería",
        dispositivoDestino: "Servidor de Historiales",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Proteger servidor de historiales",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 25,
      descripcion:
        "El servidor de historiales sigue expuesto. Bloquea el tráfico SSH hacia él desde el firewall.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Estación de Enfermería",
        dispositivoDestino: "Servidor de Historiales",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 40,
      descripcion:
        "¡Amenaza contenida! Aislar y filtrar tráfico frena la propagación. Ahora habilita el acceso remoto seguro.",
      fase: 1,
    },
    {
      nombreEvento: "VPN de emergencia para equipo remoto",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 45,
      descripcion:
        "El CSIRT necesita asistir de forma remota. Conecta el 'VPN Gateway Hospital' y el 'PC Analista CSIRT' en modo Encriptar y Autenticar (EA).",
      fase: 2,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Clinica",
          hostLan: "Servidor de Historiales",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "CSIRT-Remoto",
          hostRemoto: "PC Analista CSIRT",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Hospital",
          hostRemoto: "Servidor de Historiales",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 65,
      descripcion: "¡Incidente resuelto! Contener, proteger y dar acceso seguro al CSIRT cierra la respuesta.",
      fase: 2,
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Contención del incidente",
      descripcion:
        "Aislar los sistemas comprometidos y proteger los datos críticos del hospital.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Aislar sistema infectado",
          completado: false,
        },
        {
          descripcion: "Proteger servidor de historiales",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Acceso remoto para equipo CSIRT",
      descripcion:
        "Establecer una conexión VPN segura para que el equipo de respuesta pueda investigar.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Establecer VPN de emergencia para el equipo CSIRT",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    {
      id: 1,
      nombre: "Hospital Central",
      dominio: "Hospital",
      redes: [
        { nombre: "LAN-Clinica", color: ColoresRed.CIAN },
        { nombre: "Cuarentena", color: ColoresRed.ROJO },
        { nombre: "LAN-Admin", color: ColoresRed.VERDE },
        { nombre: "Internet", color: ColoresRed.NARANJA },
      ],
      personas: [
        {
          nombre: "Dra. Elena Vargas",
          correo: "elena.vargas@hospital.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
        {
          nombre: "Ing. Fernando Reyes",
          correo: "fernando.reyes@hospital.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
      ],
      oficinas: [
        {
          id: 601,
          nombre: "Sala de Servidores",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 6001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor de Historiales",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "OpenEMR, PostgreSQL, HL7 FHIR",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Fernando Reyes",
                  activos: [
                    {
                      nombre: "historiales_medicos.db",
                      contenido: "Base de datos de historiales clínicos",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                    {
                      nombre: "backup_semanal.tar.gz",
                      contenido: "Respaldo semanal del sistema",
                      tipo: TipoActivo.GENERICO,
                    },
                  ],
                  redes: ["LAN-Clinica"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 6002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Estación de Enfermería",
                  sistemaOperativo: "Windows 10 Pro",
                  hardware: "HP ProDesk 400 G7",
                  software: "OpenEMR Client, Office 365",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Dra. Elena Vargas",
                  activos: [],
                  redes: ["LAN-Clinica"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 6003,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Hospital",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall, VLAN",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Clinica", "Internet"],
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
                  id: 6004,
                  tipo: TipoDispositivo.VPN,
                  nombre: "VPN Gateway Hospital",
                  sistemaOperativo: "FortiOS",
                  hardware: "Fortinet FortiGate 200F",
                  software: "VPN, IDS/IPS",
                  posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Clinica", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
        {
          id: 602,
          nombre: "Oficina de TI",
          posicion: { x: 6, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 6005,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Administrador TI",
                  sistemaOperativo: "Ubuntu 24.04",
                  hardware: "Lenovo ThinkStation P360",
                  software: "Wireshark, Nessus, Ansible",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Fernando Reyes",
                  activos: [
                    {
                      nombre: "plan_contingencia.pdf",
                      contenido: "Plan de contingencia ante ciberataques",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Admin"],
                },
              ],
            },
            {
              id: 6,
              mueble: Mueble.MESA,
              posicion: { x: 4, y: 0, z: 2.5, rotacionY: 180 },
              dispositivos: [],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      nombre: "Centro CSIRT Remoto",
      dominio: "CSIRT-Remoto",
      redes: [
        { nombre: "Red-CSIRT", color: ColoresRed.MORADO },
        { nombre: "Internet", color: ColoresRed.NARANJA },
      ],
      oficinas: [
        {
          id: 603,
          nombre: "Oficina CSIRT",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 6006,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Analista CSIRT",
                  sistemaOperativo: "Kali Linux 2024.4",
                  hardware: "Dell Precision 5570",
                  software: "Volatility, Autopsy, YARA",
                  posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-CSIRT"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 6007,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router CSIRT",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-CSIRT", "Internet"],
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
