export enum Mueble {
  MESA = "mesa",
  RACK = "rack",
  LIBRE = "libre",
}

export enum TipoDispositivo {
  WORKSTATION = "workstation",
  SERVER = "server",
  ROUTER = "router",
  SWITCH = "switch",
  VPN = "vpn",
  NAS = "nas",
  OTRO = "otro",
}

export enum EstadoAtaqueDispositivo {
  NORMAL = "normal",
  COMPROMETIDO = "comprometido", // Que está bajo un ataque
}

export enum TipoProteccionVPN {
  EA = "Encriptar y Autenticar",
  A = "Solo Autenticar",
  N = "Ninguna",
  B = "Bloquear",
}

export enum TipoAtaque {
  INFECCION_TROYANO = "Infección de troyano",
}

export enum TipoEvento {
  ENVIO_ACTIVO = "Envío de activo",
  TRAFICO_RED = "Tráfico de red",
  CONEXION_VPN = "Conexión VPN",
  NO_APLICA = "n/a", // Para compatibilidad (en el constructor) con los ataques, que también son eventos pero ya tienen su propia lógica
  COMPLETACION_FASE = "Completación de fase",
  COMPLETACION_ESCENARIO = "Completación de escenario",
  VERIFICACION_FIRMA = "Verificación de firma",
  VERIFICACION_ACCION_JUGADOR = "Verificación de acciones de un jugador en la simulación",
  ENVIO_CORREO = "Envío de correo",
}

export enum TipoActivo {
  GENERICO = "generico",
  DOCUMENTO = "doc",
  FIRMA_DIGITAL = "firma digital",
  CLAVE_PUBLICA = "clave publica",
}

export enum NivelConcienciaSeguridad {
  ALTA = "Alta",
  MEDIA = "Media",
  BAJA = "Baja",
}

export enum ComandoTerminal {
  H = "h",
  LS = "ls",
  CAT = "cat",
  SSH = "ssh",
  CLS = "cls",
}
