import { TipoProtocolo } from "../../shared/types/TrafficEnums";

export interface EsquemaProtocolo {
    protocolo: TipoProtocolo;
    nombre: string;
}

export const ConfiguracionProtocolos: ReadonlyArray<EsquemaProtocolo> = Object.freeze([
    { protocolo: TipoProtocolo.WEB_SERVER, nombre: "HTTP" },
    { protocolo: TipoProtocolo.WEB_SERVER_SSL, nombre: "HTTPS" },
    { protocolo: TipoProtocolo.EMAIL_SERVER, nombre: "SMTP" },
    { protocolo: TipoProtocolo.EMAIL_SERVER_SSL, nombre: "SMTP SSL" },
    { protocolo: TipoProtocolo.TELNET, nombre: "Telnet" },
    { protocolo: TipoProtocolo.SSH, nombre: "SSH" },
    { protocolo: TipoProtocolo.FTP, nombre: "FTP" },
    { protocolo: TipoProtocolo.DATABASE, nombre: "MySQL" },
    { protocolo: TipoProtocolo.LDAP, nombre: "LDAP" },
    { protocolo: TipoProtocolo.LDAP_SSL, nombre: "LDAP SSL" },
    { protocolo: TipoProtocolo.DEFENSE_RAT, nombre: "Defense RAT" },
    { protocolo: TipoProtocolo.DEFENSE_4T, nombre: "Defense 4T" },
    { protocolo: TipoProtocolo.VPN_GATEWAY, nombre: "VPN" },
    { protocolo: TipoProtocolo.REPORTING, nombre: "Syslog" },
    { protocolo: TipoProtocolo.MANAGEMENT, nombre: "SNMP" },
    { protocolo: TipoProtocolo.NETWORK_FILE_SERVICE, nombre: "SMB" },
    { protocolo: TipoProtocolo.MESSAGING, nombre: "XMPP" }
]);
