import {
  AccionesRealizables,
  ObjetosManejables,
} from "../../shared/types/AccionesEnums";
import {
    ComandoTerminal,
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
} from "../../shared/types/DeviceEnums";
import type { DefinicionEscenario } from "../../shared/types/EscenarioTypes";
import { ColoresRed } from "../colores";
import { PlantillasCorreoPhishing } from "../plantillas/Plantillas";

function generarContrasenia(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultado = '';
  const longitud = 7;

  for (let i = 0; i < longitud; i++) {
    const indice = Math.floor(Math.random() * caracteres.length);
    resultado += caracteres[indice];
  }

  return resultado;
}

const contrasenia = generarContrasenia();

export const escenarioHackingEtico: DefinicionEscenario = {
  id: 5,
  slug: "hacking-etico",
  titulo: "Hacking Ético y Análisis de Vulnerabilidades",
  categoria: "Cap. 5 — Administración de Riesgos",
  descripcion:
    "Eres Lisa Rodríguez, aficionada al hacking ético. Sigue las fases del proceso " +
    "aplicando ingeniería social para obtener información de la empresa 'Corporación'.",
  presupuestoInicial: 1000,
  ataques: [],
  eventos: [
    {
      nombreEvento: "Escaneo de dispositivos",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 5,
      tiempoEnOcurrir: 10,
      descripcion:
        "Inicia el reconocimiento: escanea los dispositivos del dominio con Net-Scan Viz. Pista: guarda lo que encuentres.",
      fase: 1,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.APLICACION,
        val: {
          nombreAplicacion: "Net-Scan Viz",
        },
      },
    },
    {
      nombreEvento: "Búsqueda de personas",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 15,
      tiempoEnOcurrir: 20,
      descripcion:
        "Investiga a los empleados con Company Social-Searcher. Pista: fíjate quién es más propenso a la ingeniería social.",
      fase: 1,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.APLICACION,
        val: {
          nombreAplicacion: "Company Social-Searcher",
        },
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 25, // Este es un caso especial. Aquí se ejecutará directamente en el tiempo de notificación
      descripcion:
        "¡Reconocimiento completo! Con la información reunida ya puedes pasar a la fase de explotación.",
      fase: 1,
    },
    {
      nombreEvento: "Creación de correo phishing",
      tipoEvento: TipoEvento.ENVIO_CORREO,
      tiempoNotificacion: 30,
      tiempoEnOcurrir: 35,
      descripcion:
        "Usa Phish-Matic para crear un correo de phishing y engañar al empleado para que entregue sus credenciales.",
      fase: 2,
      infoAdicional: {
        dispositivoEmisor: "Computadora Lisa",
        destinatario: "jacob.garcia@corp.com",
        asunto: PlantillasCorreoPhishing[0].asunto,
      },
    },
    {
      nombreEvento: "Recepción de credenciales",
      tipoEvento: TipoEvento.ENVIO_ACTIVO,
      tiempoNotificacion: 40,
      ejecutarAlInstante: true,
      descripcion:
        "¡El engaño funcionó! El empleado envió sus credenciales. Búscalas en tu explorador de archivos.",
      fase: 2,
      infoAdicional: {
        nombreActivo: "credenciales",
        dispositivoEmisor: "Computadora Jacob",
        dispositivoReceptor: "Computadora Lisa",
      },
    },
    {
      nombreEvento: "Conexión a dispositivo mediante SSH",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 45,
      tiempoEnOcurrir: 50,
      descripcion:
        "Con las credenciales, abre la consola y accede al equipo del empleado por SSH. Pista: usa el comando de ayuda 'h'.",
      fase: 2,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.COMANDO,
        val: {
          comando: ComandoTerminal.SSH,
          nombreEquipo: "pc-jacob",
          usuario: "jgarcia",
          contrasenia: contrasenia,
          conectadoDesde: "Computadora Lisa",
        },
      },
    },
    {
      nombreEvento: "Obtención de información confidencial",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 55,
      tiempoEnOcurrir: 60,
      descripcion:
        "Ya dentro del equipo, busca y obtén información confidencial de la empresa.",
      fase: 2,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.COMANDO,
        val: {
          comando: ComandoTerminal.CAT,
          nombreArchivo: "secret_keys",
          nombreDispositivo: "Computadora Jacob",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 65,
      descripcion:
        "¡Escenario completado! Ya conoces las fases de un proceso de hacking ético: reconocer y luego explotar.",
      fase: 2,
    },
  ],
  accionesEsperadas: [
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.APLICACION,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 10,
      val: {
        nombreDispositivo: "Computadora Lisa",
        aplicacionAgregada: "Net-Scan Viz"
      }
    },
    {
      accion: AccionesRealizables.EJECUTAR,
      objeto: ObjetosManejables.APLICACION,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 10,
      val: {
        nombreAplicacion: "Net-Scan Viz"
      }
    },
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.APLICACION,
      inicioTiempoEsperado: 15,
      finTiempoEsperado: 20,
      val: {
        nombreDispositivo: "Computadora Lisa",
        aplicacionAgregada: "Company Social-Searcher"
      }
    },
    {
      accion: AccionesRealizables.EJECUTAR,
      objeto: ObjetosManejables.APLICACION,
      inicioTiempoEsperado: 15,
      finTiempoEsperado: 20,
      val: {
        nombreAplicacion: "Company Social-Searcher"
      }
    },
    {
      accion: AccionesRealizables.ENVIO,
      objeto: ObjetosManejables.CORREO,
      inicioTiempoEsperado: 30,
      finTiempoEsperado: 35,
      val: {
        dispositivoEmisor: "Computadora Lisa",
        destinatario: "jacob.garcia@corp.com",
        asunto: PlantillasCorreoPhishing[0].asunto
      }
    },
    {
      accion: AccionesRealizables.EJECUTAR,
      objeto: ObjetosManejables.COMANDO,
      inicioTiempoEsperado: 45,
      finTiempoEsperado: 50,
      val: {
        comando: ComandoTerminal.SSH,
        nombreEquipo: "pc-jacob",
        usuario: "jgarcia",
        contrasenia: contrasenia,
        conectadoDesde: "Computadora Lisa"
      }
    },
    {
      accion: AccionesRealizables.EJECUTAR,
      objeto: ObjetosManejables.COMANDO,
      inicioTiempoEsperado: 55,
      finTiempoEsperado: 60,
      val: {
        comando: ComandoTerminal.LS,
        nombreDispositivo: "Computadora Jacob"
      }
    },
    {
      accion: AccionesRealizables.EJECUTAR,
      objeto: ObjetosManejables.COMANDO,
      inicioTiempoEsperado: 55,
      finTiempoEsperado: 60,
      val: {
        comando: ComandoTerminal.CAT,
        nombreArchivo: "secret_keys",
        nombreDispositivo: "Computadora Jacob"
      }
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Fase de Reconocimiento y Escaneo",
      descripcion:
        "Recopilar información de la empresa y sus empleados antes de realizar el ataque.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Escaneo de dispositivos",
          completado: false,
        },
        {
          descripcion: "Búsqueda de personas",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Fase de Explotación",
      descripcion:
        "Con la información recopilada, se intenta obtener acceso no autorizado mediante técnicas de ingeniería social.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Creación de correo phishing",
          completado: false,
        },
        {
          descripcion: "Recepción de credenciales",
          completado: false,
        },
        {
          descripcion: "Conexión a dispositivo mediante SSH",
          completado: false,
        },
        {
          descripcion: "Obtención de información confidencial",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    {
      id: 1,
      nombre: "Corporación - Edificio Principal",
      dominio: "Corporación",
      esInteractiva: false,
      // Redes disponibles para asignar en esta zona
      redes: [
        {
          nombre: "LAN1",
          color: ColoresRed.CIAN,
        },
        {
          nombre: "LAN2",
          color: ColoresRed.VERDE,
        },
        {
          nombre: "Internet",
          color: ColoresRed.ROJO,
        },
      ],
      personas: [
        {
          nombre: "Carlos Mendoza",
          correo: "carlos.mendoza@corp.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Jacob García",
          correo: "jacob.garcia@corp.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA,
        },
        {
          nombre: "Ana Torres",
          correo: "ana.torres@corp.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
      ],
      oficinas: [
        {
          id: 101,
          nombre: "Sala de Servidores",
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
                  nombre: "Computadora Administrativa",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "Apache, MySQL, PHP, Management Service",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Carlos Mendoza",
                  nombreEquipo: "PcAdmin",
                  usuario: "admin",
                  contrasenia: "a123",
                  activos: [
                    {
                      nombre: "Documento Jacob",
                      contenido: "La contraseña secreta es 12344",
                      tipo: TipoActivo.DOCUMENTO,
                      firma: "Firma Documento Jacob",
                    },
                    {
                      nombre: "Firma Documento Jacob",
                      contenido: "La contraseña secreta es 123",
                      tipo: TipoActivo.FIRMA_DIGITAL,
                      propietario: "Jacob",
                    },
                    {
                      nombre: "Clave_Publica_Jacob",
                      tipo: TipoActivo.CLAVE_PUBLICA,
                      propietario: "Jacob",
                    },
                    {
                      nombre: "Activo genérico",
                      contenido: "a",
                      tipo: TipoActivo.GENERICO,
                    },
                    {
                      nombre: "Activo genérico 2",
                      contenido: "abcdefg",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                    {
                      nombre: "Activo2",
                      contenido: "Bienvenido",
                      tipo: TipoActivo.GENERICO,
                    },
                  ],
                  // --- ESTADO INICIAL: ninguna ---
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
                  id: 1007,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Jacob",
                  sistemaOperativo: "pfSense",
                  hardware: "Fortinet FortiGate 200F",
                  software: "IDS/IPS, VPN",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Jacob García",
                  nombreEquipo: "pc-jacob",
                  usuario: "jgarcia",
                  contrasenia: contrasenia,
                  activos: [
                    {
                      nombre: "credenciales",
                      contenido: `usuario: jgarcia\ncontraseña: ${contrasenia}`,
                      tipo: TipoActivo.DOCUMENTO,
                    },
                    {
                      nombre: "secret_keys",
                      contenido:
                        "# Credenciales de base de datos principal (NO COMPARTIR NI MODIFICAR!!)\nDB_HOST=prod-db.internal.corporacion\nDB_USER=admin_prod\nDB_PASSWORD=Sup3rS3cr3t_DB_P@ss!!\n",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  // --- ESTADO INICIAL: Solo en LAN2 ---
                  // --- RETO 1: El PO debe añadir "LAN1" aquí ---
                  redes: ["LAN2"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.RACK,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1004,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Principal",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- RETO 2: El PO debe configurar Firewall aquí ---
                  redes: ["LAN1", "Internet"], // Controla LAN1
                  conectadoAInternet: true,
                },
              ],
            },
            {
              id: 4,
              mueble: Mueble.RACK,
              posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1008,
                  tipo: TipoDispositivo.VPN,
                  nombre: "VPN Gateway",
                  sistemaOperativo: "VPN OS",
                  hardware: "Cisco VPN",
                  software: "VPN",
                  posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- RETO 3: El PO debe configurar esto ---
                  redes: ["LAN2", "Internet"], // Controla LAN2
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // --- ZONA WWW (Ordenada) ---
    {
      id: 2,
      nombre: "WWW - Red Externa",
      dominio: "WWW",
      esInteractiva: false,
      redes: [
        {
          nombre: "RedWWW",
          color: ColoresRed.NARANJA,
        },
        {
          nombre: "Internet",
          color: ColoresRed.ROJO,
        },
      ],
      oficinas: [
        {
          id: 201,
          nombre: "Datacenter Externo",
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
                  nombre: "Servidor Web Externo",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R740",
                  software: "Apache, MySQL, DNS",
                  posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ana Torres",
                  activos: [],
                  // Origen de los Retos 1 (indirecto) y 2 (directo)
                  redes: ["RedWWW"],
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
                  nombre: "Router WWW",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["RedWWW", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // --- ---
    {
      id: 3,
      nombre: "Casa Atacante",
      dominio: "Off-site",
      esInteractiva: true,
      redes: [
        {
          nombre: "Red-Lisa",
          color: ColoresRed.INDIGO,
        },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 301,
          nombre: "Estudio de Lisa",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Lisa",
                  sistemaOperativo: "Windows 11",
                  hardware: "Dell PowerEdge R740",
                  software: "IDS/IPS, VPN",
                  posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Lisa Rodriguez",
                  nombreEquipo: "PcLisa",
                  usuario: "lisa",
                  contrasenia: "l123",
                  activos: [],
                  // Origen del Reto 3 (VPN)
                  redes: ["Red-Lisa"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3002,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Lisa",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Lisa", "Internet"],
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
