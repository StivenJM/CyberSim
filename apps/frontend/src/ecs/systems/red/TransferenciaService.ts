import type { ECSManager } from "../../core/ECSManager";
import type { Entidad } from "../../core";
import { ActivoComponent, DispositivoComponent } from "../../components";
import { EventosPublicos } from "../../../shared/types/EventosEnums";

// Servicio responsable de transferir activos entre dispositivos
export class TransferenciaService {
  constructor(
    private ecsManager: ECSManager,
  ) {}

  // Transfiere un activo de un dispositivo a otro (protocolo FTP)
  enviarActivo(
    entidadEnvio: Entidad,
    entidadReceptor: Entidad,
    activo: string
  ): void {
    // Obtener componentes de activos de ambos dispositivos
    const activosReceptor = this.ecsManager
      .getComponentes(entidadReceptor)
      ?.get(ActivoComponent);
    const activosEmisor = this.ecsManager
      .getComponentes(entidadEnvio)
      ?.get(ActivoComponent);
    const dispReceptor = this.ecsManager
      .getComponentes(entidadReceptor)
      ?.get(DispositivoComponent);
    const dispEmisor = this.ecsManager
      .getComponentes(entidadEnvio)
      ?.get(DispositivoComponent);

        if (!activosReceptor || !dispReceptor) {
            this.ecsManager.emit(EventosPublicos.RED_ACTIVO_NO_ENVIADO,
                `Activo no enviado: ${dispReceptor?.nombre} no tiene componente de activos.`
            );
            return;
        }

        if (!activosEmisor || !dispEmisor) {
            this.ecsManager.emit(EventosPublicos.RED_ACTIVO_NO_ENVIADO,
                `Activo no enviado: ${dispEmisor?.nombre} no tiene componente de activos.`
            );
            return;
        }

        // Obtener el activo a enviar
        const activoAenviar = activosEmisor.activos.find((a) => a.nombre === activo);
        if (!activoAenviar) {
            this.ecsManager.emit(EventosPublicos.RED_ACTIVO_NO_ENVIADO,
                `Activo no enviado: ${dispEmisor?.nombre} no tiene el activo: ${activo}.`
            );
            return;
        }

        // Verificar si el receptor ya tiene el activo
        if (activosReceptor.activos.some(a => a.nombre === activoAenviar.nombre &&
                                   a.contenido === activoAenviar.contenido)) {
            this.ecsManager.emit(EventosPublicos.RED_ACTIVO_NO_ENVIADO,
                `Activo no enviado: ${dispReceptor?.nombre} ya contiene el activo: ${activo}.`
            );
            return;
        }
 
        // Transferir activo
        activosReceptor.activos.push(activoAenviar);

        this.ecsManager.emit(EventosPublicos.RED_ACTIVO_ENVIADO, {
            nombreActivo: activo,
            d1: dispEmisor.nombre,
            d2: dispReceptor.nombre,
        });
    }
}
