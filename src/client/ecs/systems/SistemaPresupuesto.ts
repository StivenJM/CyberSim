import { Sistema, type Entidad } from "../core";
import {
  WorkstationComponent,
  /*PresupuestoComponent,*/
  DispositivoComponent,
  EscenarioComponent,
} from "../components";
import {
  AccionesRealizables,
  ObjetosManejables,
} from "../../shared/types/AccionesEnums";
import { SistemaTiempo } from "./SistemaTiempo";
// import { EventosPublicos } from "../../types/EventosEnums";

export class SistemaPresupuesto extends Sistema {
  // public componentesRequeridos = new Set([/*PresupuestoComponent*/]);

  public toggleConfiguracionWorkstation(
    // entidadPresupuesto: Entidad,
    entidadWorkstation: Entidad,
    config: string
  ) {
    const componentesEntidadWorkstation = this.ecsManager.getComponentes(entidadWorkstation);
    const componenteConfigWorkstaion = componentesEntidadWorkstation?.get(WorkstationComponent);
    const listaConfigsWorkstation = componenteConfigWorkstaion?.configuraciones;

    if (!listaConfigsWorkstation)
      throw new Error(
        `No existe lista de configuraciones en la Entidad ${entidadWorkstation}`
      );

    for (let i = 0; i < listaConfigsWorkstation.length; i++) {
      if (listaConfigsWorkstation[i].nombreConfig != config) continue;

      // Al hacer click, primero se verifica si la config está desactivada
      if (!listaConfigsWorkstation[i].activado) {
        // if (
        //   this.hayPresupuestoSuficiente(
        //     entidadPresupuesto,
        //     listaConfigsWorkstation[i].costoActivacion
        //   )
        // ) {
          // Aquí recién se hace el toggle
          listaConfigsWorkstation[i].activado = !listaConfigsWorkstation[i].activado;

          // const presupuestoComp = this.ecsManager
          //   .getComponentes(entidadPresupuesto)
          //   ?.get(PresupuestoComponent);
          // if (presupuestoComp) {
          //   presupuestoComp.monto -= listaConfigsWorkstation[i].costoActivacion;
          // }
        // } else break;

        const dispositivoComp = componentesEntidadWorkstation?.get(DispositivoComponent);
        this.ecsManager.registrarAccion(
          AccionesRealizables.CLICK,
          ObjetosManejables.CONFIG_WORKSTATION,
          this.getTiempoSimulacion(),
          {
            nombreConfig: listaConfigsWorkstation[i].nombreConfig,
            dispositivoAAtacar: dispositivoComp?.nombre,
            activado: listaConfigsWorkstation[i].activado,
          }
        );

        break;
        // Caso contrario significa que está activada
      } else {
        // if (
        //   this.hayPresupuestoSuficiente(
        //     entidadPresupuesto,
        //     listaConfigsWorkstation[i].costoActivacion * 0.5
        //   )
        // ) {
          listaConfigsWorkstation[i].activado = !listaConfigsWorkstation[i].activado;

          // const presupuestoComp = this.ecsManager
          //   .getComponentes(entidadPresupuesto)
          //   ?.get(PresupuestoComponent);
          // if (presupuestoComp) {
          //   presupuestoComp.monto -=
          //     listaConfigsWorkstation[i].costoActivacion * 0.5;
          // }
        // } else break;

        const dispositivoComp = componentesEntidadWorkstation?.get(DispositivoComponent);
        this.ecsManager.registrarAccion(
          AccionesRealizables.CLICK,
          ObjetosManejables.CONFIG_WORKSTATION,
          this.getTiempoSimulacion(),
          {
            nombreConfig: listaConfigsWorkstation[i].nombreConfig,
            dispositivoAAtacar: dispositivoComp?.nombre,
            activado: listaConfigsWorkstation[i].activado,
          }
        );

        break;
      }
    }
    // const presupuestoComp = this.ecsManager
    //   .getComponentes(entidadPresupuesto)
    //   ?.get(PresupuestoComponent);
    //
    // this.ecsManager.emit(EventosPublicos.PRESUPUESTO_ACTUALIZADO, {
    //   presupuesto: presupuestoComp?.monto ?? 0,
    // });
    // this.notificarPresupuestoAgotado(entidadPresupuesto);
  }

  public comprarApp(
    // entidadPresupuesto: Entidad,
    entidadDispoitivo: Entidad,
    nombreApp: string
  ) {
    const dispositivo = this.ecsManager.getComponentes(entidadDispoitivo)?.get(DispositivoComponent);

    let escenario;
    for (const [, c] of this.ecsManager.getEntidades()) {
      if (c.tiene(EscenarioComponent)) {
        escenario = c.get(EscenarioComponent);
        break;
      }
    }

    const appsEscenario = escenario?.apps;

    for (const app of appsEscenario ?? []) {
      if (app.nombre == nombreApp) {
        // if (this.hayPresupuestoSuficiente(entidadPresupuesto, app.precio)) {
          // Inicializar el array de apps si no existe
          if (!dispositivo) break;
          if (!dispositivo.apps) {
            dispositivo.apps = [];
          } 

          dispositivo.apps.push(app);

          this.ecsManager.registrarAccion(
            AccionesRealizables.AGREGAR,
            ObjetosManejables.APLICACION,
            this.getTiempoSimulacion(),
            {
              nombreDispositivo: dispositivo.nombre,
              aplicacionAgregada: app.nombre
            }
          );
          // const presupuestoComp = this.ecsManager
          //   .getComponentes(entidadPresupuesto)
          //   ?.get(PresupuestoComponent);
          // if (presupuestoComp) {
          //   presupuestoComp.monto -= app.precio;
          //   this.ecsManager.emit(EventosPublicos.PRESUPUESTO_ACTUALIZADO, {
          //     presupuesto: presupuestoComp.monto,
          //   });
          //   this.notificarPresupuestoAgotado(entidadPresupuesto);
          // }
        // } else break;

        break;
      }
    }
  }

  public desinstalarApp(
    // entidadPresupuesto: Entidad,
    entidadDispoitivo: Entidad,
    nombreApp: string
  ) {
    const dispositivo = this.ecsManager.getComponentes(entidadDispoitivo)?.get(DispositivoComponent);

    const appsDispositivo = dispositivo?.apps ?? [];

    for (let i = 0; i < appsDispositivo.length; i++) {
      const app = appsDispositivo[i];
      if (app?.nombre == nombreApp) {
        // Guardar precio antes de eliminar
        // const precioApp = app.precio;
        dispositivo?.apps?.splice(i, 1);

        this.ecsManager.registrarAccion(
          AccionesRealizables.ELIMINAR,
          ObjetosManejables.APLICACION,
          this.getTiempoSimulacion(),
          {
            nombreDispositivo: dispositivo?.nombre ?? "",
            aplicacionEliminada: app.nombre
          }
        );
        // const presupuestoComp = this.ecsManager
        //   .getComponentes(entidadPresupuesto)
        //   ?.get(PresupuestoComponent);
        // if (presupuestoComp) {
        //   presupuestoComp.monto += precioApp * 0.5;
        //   this.ecsManager.emit(EventosPublicos.PRESUPUESTO_ACTUALIZADO, {
        //     presupuesto: presupuestoComp.monto,
        //   });
        // }
        break;
      }
    }
  }

  private getTiempoSimulacion(): number | undefined {
    return this.ecsManager.getSistema(SistemaTiempo)?.getTiempoSimulacion();
  }

  // private hayPresupuestoSuficiente(
  //   entidadPresupuesto: Entidad,
  //   montoAProcesar: number
  // ): boolean {
  //   const presupuestoComp = this.ecsManager
  //     .getComponentes(entidadPresupuesto)
  //     ?.get(PresupuestoComponent);
  //   const presupuestoActual = presupuestoComp?.monto ?? 0;
  //
  //   if (montoAProcesar > presupuestoActual) return false;
  //
  //   return true;
  // }

  // private notificarPresupuestoAgotado(entidadPresupuesto: Entidad): void {
  //   const presupuestoComp = this.ecsManager
  //     .getComponentes(entidadPresupuesto)
  //     ?.get(PresupuestoComponent);
  //
  //   if (presupuestoComp?.monto === 0)
  //     this.ecsManager.emit(EventosPublicos.PRESUPUESTO_AGOTADO);
  // }
}
