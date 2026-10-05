import type { ECSManager } from "../../core/ECSManager";
import type { Entidad } from "../../core";
import { DispositivoComponent, RedComponent, RouterComponent } from "../../components";
import { TipoProtocolo } from "../../../shared/types/TrafficEnums";
import { DireccionTrafico, AccionFirewall } from "../../../shared/types/FirewallTypes";
import type { Reglas } from "../../../shared/types/FirewallTypes";
import { AccionesRealizables, ObjetosManejables } from "../../../shared/types/AccionesEnums";
import { SistemaTiempo } from "../SistemaTiempo";

export class FirewallConfigService {
    constructor(private ecsManager: ECSManager) {}

    static obtenerTodosLosProtocolos(): TipoProtocolo[] {
        return Object.values(TipoProtocolo);
    }

    agregarReglaFirewall(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolo: TipoProtocolo,
        accion: AccionFirewall,
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        // Obtener reglas existentes para esta red
        const reglasExistentes = router.bloqueosFirewall.get(entidadRed) || [];
        
        // Filtrar reglas que coincidan con el mismo protocolo y dirección
        const reglasFiltradas = reglasExistentes.filter(regla => 
            !(regla.protocolo === protocolo && 
              (regla.direccion === direccion || regla.direccion === DireccionTrafico.AMBAS || direccion === DireccionTrafico.AMBAS))
        );
        
        // Agregar la nueva regla
        const nuevaRegla: Reglas = { accion, direccion, protocolo };
        router.bloqueosFirewall.set(entidadRed, [...reglasFiltradas, nuevaRegla]);

        const tiempoSimulacion = this.getTiempoSimulacion();
        if (!(tiempoSimulacion == undefined || tiempoSimulacion <= 0 || tiempoSimulacion == null)){
            this.ecsManager.registrarAccion(
                AccionesRealizables.CLICK,
                ObjetosManejables.CONFIG_FIREWALL,
                this.getTiempoSimulacion(),
                {
                    nombreRouter: dispositivo.nombre,
                    nombreRed: this.ecsManager.getComponentes(entidadRed)?.get(RedComponent)?.nombre ?? "",
                    accion: accion,
                    direccion: direccion,
                    protocolo: protocolo
                }
            );
        }
    }

    bloquearProtocolosEnRed(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolos: TipoProtocolo[],
        direccion: DireccionTrafico
    ): void {
        protocolos.forEach(protocolo => {
            this.agregarReglaFirewall(
                entidadRouter,
                entidadRed,
                protocolo,
                AccionFirewall.DENEGAR,
                direccion
            );
        });
    }

    permitirProtocolosEnRed(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolos: TipoProtocolo[],
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        
        if (!router) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        const reglasExistentes = router.bloqueosFirewall.get(entidadRed) || [];
        
        const reglasActualizadas = reglasExistentes.filter(regla => 
            !(protocolos.includes(regla.protocolo) && regla.direccion === direccion)
        );

        if (reglasActualizadas.length > 0) {
            router.bloqueosFirewall.set(entidadRed, reglasActualizadas);
        } else {
            router.bloqueosFirewall.delete(entidadRed);
        }
    }

    obtenerReglasDeRed(entidadRouter: Entidad, entidadRed: Entidad): Reglas[] {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        
        if (!router) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return [];
        }

        return router.bloqueosFirewall.get(entidadRed) || [];
    }

    eliminarRegla(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolo: TipoProtocolo,
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        const reglasExistentes = router.bloqueosFirewall.get(entidadRed) || [];
        const reglasActualizadas = reglasExistentes.filter(regla => 
            !(regla.protocolo === protocolo && regla.direccion === direccion)
        );

        if (reglasActualizadas.length > 0) {
            router.bloqueosFirewall.set(entidadRed, reglasActualizadas);
        } else {
            router.bloqueosFirewall.delete(entidadRed);
        }

    }

    obtenerRedesConReglas(entidadRouter: Entidad): Entidad[] {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        
        if (!router) {
            return [];
        }

        return Array.from(router.bloqueosFirewall.keys());
    }

    private getTiempoSimulacion(): number | undefined {
        return this.ecsManager.getSistema(SistemaTiempo)?.getTiempoSimulacion();
    }
}
