import type { PerfilVPNGateway } from "../../shared/types/EscenarioTypes";
import { Componente } from "../core";

/* Contiene la información necesaria para establecer reglas de conexiones 
 * VPN entrantes. 
 *
 * Los perfiles son básicamente reglas o permisos que se definen para el 
 * gateway actual, de modo que todas las conexiones VPN entrantes (solicitudes 
 * de los Clientes VPN) deben coincidir con alguno de los permisos definidos, 
 * según se requiera, para lograr establecer una conexión.
 *
 * De momento sólo abarca los perfiles de conexión VPN para los gateway;
 * se mantiene escalable para, por ejemplo, posiblemente añadir el campo 
 * de Vulnerable Network.
 * */
export class VPNGatewayComponent extends Componente {
    constructor(
        public perfilesVPNGateway: Array<PerfilVPNGateway> = []
    ){
        super();
    }
}
