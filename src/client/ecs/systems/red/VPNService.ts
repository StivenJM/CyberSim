import type { PerfilClienteVPN, PerfilVPNGateway } from "../../../shared/types/EscenarioTypes";
import { EventosPublicos } from "../../../shared/types/EventosEnums";
import { ClienteVPNComponent, DispositivoComponent, RedComponent, VPNGatewayComponent, ZonaComponent } from "../../components";
import type { ECSManager, Entidad } from "../../core";
import { SistemaRelaciones } from "../SistemaRelaciones";

export class VPNService {
    constructor(
        private ecsManager: ECSManager
    ) {}

    establecerConexion(
        entidadOrigen: Entidad,
        entidadDestino: Entidad,
        permisos: unknown
    ): void {
        const permisosEvento = permisos as {
            gateway: PerfilVPNGateway;
            cliente: PerfilClienteVPN;
        };
       
        //////////// Lado del cliente 

        // Obtenemos los permisos (perfiles) VPN definidos en el cliente
        const perfilesCliente = this.ecsManager.getComponentes(entidadOrigen)?.get(ClienteVPNComponent)?.perfilesClienteVPN;
       
        if (perfilesCliente?.length === 0) {
            this.ecsManager.emit(EventosPublicos.VPN_CONEXION_RECHAZADA,
                `Conexión VPN rechazada: No existen perfiles de conexión VPN definidos en ${permisosEvento.gateway.hostRemoto}.`
            );
            return;
        }

        // Verificamos que alguno de los perfiles definidos en el cliente coincidan con los esperados del evento
        if (!perfilesCliente?.find((perfil) => 
            perfil.proteccion === permisosEvento.cliente.proteccion &&
            perfil.dominioRemoto === permisosEvento.cliente.dominioRemoto &&
            perfil.hostRemoto === permisosEvento.cliente.hostRemoto
        )) {
            this.ecsManager.emit(EventosPublicos.VPN_CONEXION_RECHAZADA,
                `Conexión VPN rechazada: ${permisosEvento.gateway.hostRemoto} no cuenta con un permiso para establecer una conexión VPN con ${permisosEvento.cliente.hostRemoto}.`
            );
            return;
        }

        /////////// Lado del VPN Gateway

        // Obtenemos el VPN Gateway al que está conectado el dispositivo de destino
        const vpn = this.obtenerVPNDelDispositivo(entidadDestino);

        if (!vpn) {
            console.error(`No existe un VPN Gateway conectado al dispositivo ${permisosEvento.gateway.hostLan}`)
            return;
        } 

        // Obtenemos los perfiles definidos en el VPN
        const perfilesVPN = vpn?.perfilesVPNGateway;

        const entidadVPN = this.encontrarEntidadVPN(vpn);
        const dispositivoDeVPN = this.ecsManager.getComponentes(entidadVPN!)?.get(DispositivoComponent);

        if (perfilesVPN.length === 0) {
            this.ecsManager.emit(EventosPublicos.VPN_CONEXION_RECHAZADA,
                `Conexión VPN rechazada: No existen perfiles de conexión VPN definidos en ${dispositivoDeVPN?.nombre}.`
            );
            return;
        }

        // Verificamos que alguno de los perfiles definidos en el VPN coincidan con los permisos esperados del evento
        if (!perfilesVPN?.find((perfil) => 
            perfil.lanLocal === permisosEvento.gateway.lanLocal &&
            perfil.hostLan === permisosEvento.gateway.hostLan &&
            perfil.proteccion === permisosEvento.gateway.proteccion &&
            perfil.dominioRemoto === permisosEvento.gateway.dominioRemoto &&
            perfil.hostRemoto === permisosEvento.gateway.hostRemoto
        )) {
            this.ecsManager.emit(EventosPublicos.VPN_CONEXION_RECHAZADA,
                `Conexión VPN rechazada: ${dispositivoDeVPN?.nombre} no cuenta con un permiso para permitir una conexión VPN entre ${permisosEvento.gateway.hostRemoto} y ${permisosEvento.gateway.hostLan}.`
            );
            return;
        }

        // Si pasó todas las verificaciones, entonces se establece conexión
        this.ecsManager.emit(EventosPublicos.VPN_CONEXION_ESTABLECIDA,
            `Conexión VPN establecida: ${permisosEvento.gateway.hostRemoto} se conectó a ${permisosEvento.gateway.hostLan}`
        );
    }

    buscarVPNConDispositivo(entidadDispositivo: Entidad): { vpn: VPNGatewayComponent; zonaId: Entidad } | null {
        // 1. Obtener las redes del dispositivo
        const redesDelDispositivo = this.ecsManager.getComponentes(entidadDispositivo)?.get(DispositivoComponent)?.redes;
        if (redesDelDispositivo!.length === 0) return null;
        
        // 2. Encontrar la zona que contiene alguna de estas redes
        for (const [zonaEntidad, container] of this.ecsManager.getEntidades()) {
            const zona = container.get(ZonaComponent);
            if (!zona) continue;
            
            // Obtener las redes de esta zona usando SistemaRelaciones
            const redesZona = this.obtenerRedesDeZona(zonaEntidad);
            
            // Verificar si la zona contiene alguna red del dispositivo
            const zonaContieneDispositivo = redesZona.some(redId => 
                redesDelDispositivo!.includes(redId)
            );
            
            if (!zonaContieneDispositivo) continue;
            
            // 3. Buscar el router en esta zona
            // El VPN es un dispositivo que tiene redes de esta zona
            for (const [vpnEntidad, vpnContainer] of this.ecsManager.getEntidades()) {
                const vpn = vpnContainer.get(VPNGatewayComponent);
                if (!vpn) continue;
                
                // Verificar si este vpn tiene redes de esta zona
                const redesVpn = this.ecsManager.getComponentes(vpnEntidad)?.get(DispositivoComponent)?.redes;
                const vpnEnZona = redesVpn?.some(redId => redesZona.includes(redId));
                
                if (vpnEnZona) {
                    return { vpn: vpn, zonaId: zonaEntidad };
                }
            }
        }
        
        return null;
    }

    obtenerVPNDelDispositivo(entidadDispositivo: Entidad): VPNGatewayComponent | null {
        return this.buscarVPNConDispositivo(entidadDispositivo)?.vpn || null;
    }
    
    private obtenerRedesDeZona(zonaEntidad: Entidad): Entidad[] {
        const sistemasArray = Array.from(this.ecsManager.getSistemas().keys());
        const sistemasRelaciones = sistemasArray.filter((s): s is SistemaRelaciones => s instanceof SistemaRelaciones);
        for (const sistema of sistemasRelaciones) {
            const hijos = sistema.obtenerHijos(zonaEntidad);
            if (hijos.length > 0) {
                const primerHijo = this.ecsManager.getComponentes(hijos[0])?.get(RedComponent);
                if (primerHijo) {
                    return hijos; 
                }
            }
        }   
        return [];
    }

    private encontrarEntidadVPN(vpnComponent: VPNGatewayComponent): Entidad | null {
        for (const [entidad, container] of this.ecsManager.getEntidades()) {
            const vpn = container.get(VPNGatewayComponent);
            if (vpn === vpnComponent) {
                return entidad;
            }
        }
        return null;
    }
}
