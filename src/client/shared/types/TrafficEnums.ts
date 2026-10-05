// Tipos de protocolo de red
export enum TipoProtocolo {
  // Web
  WEB_SERVER = "WEB_SERVER",              
  WEB_SERVER_SSL = "WEB_SERVER_SSL",      
  
  // Email
  EMAIL_SERVER = "EMAIL_SERVER",           
  EMAIL_SERVER_SSL = "EMAIL_SERVER_SSL",   
  
  // Administración remota
  TELNET = "TELNET",                       
  SSH = "SSH",                             
  
  // Transferencia de archivos
  FTP = "FTP",                             
  
  // Bases de datos
  DATABASE = "DATABASE",                   
  
  // Directorio
  LDAP = "LDAP",                          
  LDAP_SSL = "LDAP_SSL",                  
  
  // Defensa (específicos del juego)
  DEFENSE_RAT = "DEFENSE_RAT",
  DEFENSE_4T = "DEFENSE_4T",
  
  // VPN
  VPN_GATEWAY = "VPN_GATEWAY",            
  
  // Servicios corporativos
  REPORTING = "REPORTING",                 
  MANAGEMENT = "MANAGEMENT",               
  NETWORK_FILE_SERVICE = "NETWORK_FILE_SERVICE", 
  MESSAGING = "MESSAGING"                  
}

// Información básica de un protocolo
 
export interface ProtocoloInfo {
  tipo: TipoProtocolo;
  puerto: number;
}

// Registro de tráfico de red
export interface RegistroTrafico {
  origen: string;
  destino: string;
  protocolo: TipoProtocolo;
}

// Registro de tráfico bloqueado por firewall
export interface RegistroFirewallBloqueado {
  origen: string;
  destino: string;
  protocolo: TipoProtocolo;
  mensaje: string;
  tipo: 'BLOQUEADO';
  razon?: string;
  entidadRouter?: number; // Entidad del router que bloqueó
  router?: string; // Nombre del router (calculado para UI)
}

// Registro de tráfico permitido por firewall
export interface RegistroFirewallPermitido {
  origen: string;
  destino: string;
  protocolo: TipoProtocolo;
  mensaje: string;
  tipo: 'PERMITIDO';
  entidadRouter?: number; 
  router?: string; 
}

// Registro de configuración del firewall (habilitado/deshabilitado)
export interface RegistroFirewallEstado {
  router: string;
  mensaje: string;
  tipo: 'HABILITADO' | 'DESHABILITADO';
}

// Registro cuando se agrega una regla al firewall
export interface RegistroFirewallRegla {
  router: string;
  mensaje: string;
  tipo: 'REGLA_AGREGADA';
  protocolo: TipoProtocolo;
  accion: 'PERMITIR' | 'DENEGAR';
  direccion: 'HACIA' | 'DESDE' | 'AMBAS';
}

// Registro cuando se cambia la política por defecto
export interface RegistroFirewallPolitica {
  router: string;
  mensaje: string;
  tipo: 'POLITICA_CAMBIADA';
  politicaAnterior: 'PERMITIR' | 'DENEGAR';
  politicaNueva: 'PERMITIR' | 'DENEGAR';
}


