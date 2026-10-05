import type { PerfilClienteVPN } from "../../shared/types/EscenarioTypes";
import { Componente } from "../core";

/* Contiene la información necesaria para añadir reglas de conexión 
 * VPN para un cliente (Workstation o Server).
 *
 * Es prácticamente lo mismo que el componente VPN para los gateways,
 * pero la diferencia es que lo que se añada aquí es lo que se va a 
 * contrastar con lo establecido en el gateway; si logra hacer match
 * con alguno de los permisos definidos, se establece conexión.
 *
 * De igual forma se mantiene escalable como el componente del gateway.
 * */
export class ClienteVPNComponent extends Componente {
    constructor(
        public perfilesClienteVPN: Array<PerfilClienteVPN> = []
    ){
        super();
    }
}
