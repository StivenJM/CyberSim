import { TipoDispositivo } from "../../../shared/types/DeviceEnums";
import { DispositivoComponent, RedComponent, ZonaComponent } from "../../components";
import type { ECSManager } from "../../core";
import type { Entidad } from "../../core/Componente";
import { SistemaJerarquiaEscenario } from "../SistemaJerarquiaEscenario";


export class RedDisponibilidadService {
  constructor(private ecsManager: ECSManager) {}


  public obtenerRedesDisponibles(entidadDisp: Entidad): Entidad[] {
    const sistemaJerarquia = this.ecsManager.getSistema(SistemaJerarquiaEscenario);
    if (!sistemaJerarquia) return [];

    const zonaEntidadId = sistemaJerarquia.obtenerZonaDeDispositivo(entidadDisp);
    if (!zonaEntidadId) return [];

    const zonaContainer = this.ecsManager.getComponentes(zonaEntidadId);
    const zonaComponent = zonaContainer?.get(ZonaComponent);
    if (!zonaComponent) return [];

    const dispContainer = this.ecsManager.getComponentes(entidadDisp);
    const dispComp = dispContainer?.get(DispositivoComponent);
    if (!dispComp) return [];


    const esRouterOVPN = dispComp.tipo === TipoDispositivo.ROUTER || dispComp.tipo === TipoDispositivo.VPN;

    return zonaComponent.redes.filter((redEntidadId) => {
      const redContainer = this.ecsManager.getComponentes(redEntidadId);
      const redComp = redContainer?.get(RedComponent);
      
      if (redComp?.nombre === "Internet" && !esRouterOVPN) {
        return false;
      }
      
      return true;
    });
  }


  public puedeConectarseARed(entidadDisp: Entidad, entidadRed: Entidad): boolean {
    const redContainer = this.ecsManager.getComponentes(entidadRed);
    const redComp = redContainer?.get(RedComponent);
    
    if (redComp?.nombre === "Internet") {
      const dispContainer = this.ecsManager.getComponentes(entidadDisp);
      const dispComp = dispContainer?.get(DispositivoComponent);
      
      return dispComp?.tipo === TipoDispositivo.ROUTER || dispComp?.tipo === TipoDispositivo.VPN;
    }
    
    return true;
  }
}
