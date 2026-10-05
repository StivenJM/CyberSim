import { describe, expect, test } from "vitest";
import { ECSManager } from "../src/client/ecs/core";
import { SistemaPresupuesto } from "../src/client/ecs/systems";
import { DispositivoComponent, EscenarioComponent, /*PresupuestoComponent,*/ WorkstationComponent } from "../src/client/ecs/components";
import { ConfiguracionWorkstation } from "../src/client/data/configuraciones/configWorkstation";
import { EstadoAtaqueDispositivo, TipoDispositivo } from "../src/client/shared/types/DeviceEnums";
import { APPS } from "../src/client/data/apps";

describe(/*'PresupuestoComponent y */'SistemaPresupuesto', () => {
    test('activación y desactivación de configuraciones'/* con presupuesto suficiente'*/, () => {
        const em = new ECSManager();
        // const entidadPresupuesto = em.agregarEntidad();
        // const presupuestoInicial = 1000;
        // em.agregarComponente(entidadPresupuesto, new PresupuestoComponent(presupuestoInicial));
        const sistema = new SistemaPresupuesto();
        em.agregarSistema(sistema);

        // const c = em.getComponentes(entidadPresupuesto);
        // expect(c).toBeDefined();
        // const presupuesto = c!.get(PresupuestoComponent);
        // expect(presupuesto.monto).toBe(presupuestoInicial);

        const configuracion = ConfiguracionWorkstation.values().next().value!.nombreConfig;
        const estadoOriginalConfiguracion = ConfiguracionWorkstation.values().next().value!.activado;

        // Simular activación de una configuración
        const entidadWorkstation = em.agregarEntidad();
        em.agregarComponente(entidadWorkstation, new DispositivoComponent("dispo", "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, "", "", ""));
        em.agregarComponente(entidadWorkstation, new WorkstationComponent());
        sistema.toggleConfiguracionWorkstation(/*entidadPresupuesto, */entidadWorkstation, configuracion)
        // expect(presupuesto.monto).toBeLessThan(presupuestoInicial);

        const estadoActualConfiguracion = em.getEntidades().get(entidadWorkstation)?.get(WorkstationComponent)?.configuraciones.find((c) => c.nombreConfig == configuracion)?.activado;

        expect(estadoActualConfiguracion).not.toBe(estadoOriginalConfiguracion);

        //console.log("Se activó la configuración:", configuracion);
        //console.log("Estado original configuracion:", estadoOriginalConfiguracion);
        //console.log("Estado actual configuración:", estadoActualConfiguracion);
        // console.log("Presupuesto actual:", presupuesto.monto)

        // const montoDespuesDeActivacion = presupuesto.monto

        // Simular desactivación de una configuración
        sistema.toggleConfiguracionWorkstation(/*entidadPresupuesto, */entidadWorkstation, configuracion)
        // expect(presupuesto.monto).toBeLessThan(montoDespuesDeActivacion);
        //console.log("Se desactivó la configuración:", configuracion)
        // console.log("Presupuesto actual:", presupuesto.monto)
    });

    // test('activación y desactivación de configuraciones con presupuesto insuficiente', () => {
    //     const em = new ECSManager();
    //     const entidadPresupuesto = em.agregarEntidad();
    //     const presupuestoInicial = 15;
    //     em.agregarComponente(entidadPresupuesto, new PresupuestoComponent(presupuestoInicial));
    //     const sistema = new SistemaPresupuesto();
    //     em.agregarSistema(sistema);
    //
    //     const c = em.getComponentes(entidadPresupuesto);
    //     expect(c).toBeDefined();
    //     const presupuesto = c!.get(PresupuestoComponent);
    //     expect(presupuesto.monto).toBe(presupuestoInicial);
    //
    //     const configuracion = ConfiguracionWorkstation.values().next().value!.nombreConfig;
    //
    //     // Simular activación de una configuración con presupuesto insuficiente
    //     const entidadWorkstation = em.agregarEntidad();
    //     em.agregarComponente(entidadWorkstation, new DispositivoComponent("dispo", "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, []));
    //     em.agregarComponente(entidadWorkstation, new WorkstationComponent());
    //     sistema.toggleConfiguracionWorkstation(entidadPresupuesto, entidadWorkstation, configuracion)
    //     expect(presupuesto.monto).toEqual(presupuestoInicial);
    //     console.log("No se activó la configuración:", configuracion)
    //     console.log("Presupuesto actual:", presupuesto.monto)
    //
    //     presupuesto.monto = presupuestoInicial;
    //
    //     // Simular desactivación de una configuración con presupuesto insuficiente
    //     sistema.toggleConfiguracionWorkstation(entidadPresupuesto, entidadWorkstation, configuracion)
    //     expect(presupuesto.monto).toEqual(presupuesto.monto);
    //     console.log("No se desactivó la configuración:", configuracion)
    //     console.log("Presupuesto actual:", presupuesto.monto)
    // });

    test("instalación y desinstalación de apps de workstations", () => {
        const em = new ECSManager();

        const sistemaPresupuesto = new SistemaPresupuesto();
        em.agregarSistema(sistemaPresupuesto);

        const appsDisponibles = APPS;

        const entidadEscenario = em.agregarEntidad();
        em.agregarComponente(entidadEscenario, new EscenarioComponent(1,"escenario","escenario",10,[],[],[],"",[],appsDisponibles));

        const entidadWorkstation = em.agregarEntidad();
        em.agregarComponente(entidadWorkstation, new DispositivoComponent("dispo", "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, "", "", "",[],"",[]));        

        // Instalación de app
        sistemaPresupuesto.comprarApp(entidadWorkstation, appsDisponibles[0].nombre);

        const appsEnDispositivo = em.getEntidades().get(entidadWorkstation)!.get(DispositivoComponent)!.apps;

        expect(appsEnDispositivo![0].nombre).toBe(appsDisponibles[0].nombre);

        // Desinstalación de app
        sistemaPresupuesto.desinstalarApp(entidadWorkstation, appsDisponibles[0].nombre);

        const appsEnDispLuego = em.getEntidades().get(entidadWorkstation)!.get(DispositivoComponent)!.apps;

        expect(appsEnDispLuego!.length).toBe(0);
    });
});
