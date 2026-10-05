import { describe, it, beforeEach, expect } from "vitest";
import { SistemaJerarquiaEscenario } from "../src/client/ecs/systems";
import { ECSManager, Entidad } from "../src/client/ecs/core";
import { DispositivoComponent, EscenarioComponent, EspacioComponent, OficinaComponent, PersonaComponent, RedComponent, ZonaComponent } from "../src/client/ecs/components";
import { ColoresRed } from "../src/client/data/colores";
import { EstadoAtaqueDispositivo, NivelConcienciaSeguridad, TipoDispositivo } from "../src/client/shared/types/DeviceEnums";

describe("SistemaJerarquiaEscenario", () => {
    
    let em: ECSManager;
    let sistemaJerarquiaEscenario: SistemaJerarquiaEscenario;
    let entidadEscenario: Entidad;
    let entidadZonaJacob: Entidad;
    let entidadZonaLisa: Entidad;
    let entidadPersonaJacob: Entidad;
    let entidadPersonaLisa: Entidad;
    let entidadRedJacob: Entidad;
    let entidadRedLisa: Entidad;
    let entidadOficinaJacob: Entidad;
    let entidadOficinaLisa: Entidad;
    let entidadEspacio1OficinaJacob: Entidad;
    let entidadEspacio2OficinaJacob: Entidad;
    let entidadEspacio1OficinaLisa: Entidad;
    let entidadEspacio2OficinaLisa: Entidad;
    let entidadDispositvo1Jacob: Entidad;
    let entidadDispositvo2Jacob: Entidad;
    let entidadDispositvoLisa: Entidad;

    beforeEach(() => {
        em = new ECSManager();

        sistemaJerarquiaEscenario = new SistemaJerarquiaEscenario();
        em.agregarSistema(sistemaJerarquiaEscenario);

        entidadEscenario = em.agregarEntidad();
        em.agregarComponente(entidadEscenario, new EscenarioComponent(1, "escenario", "escenario", 10));
       
        entidadZonaJacob = em.agregarEntidad();
        em.agregarComponente(entidadZonaJacob, new ZonaComponent(1, "Zona Jacob", "Dominio Jacob"));

        entidadZonaLisa = em.agregarEntidad();
        em.agregarComponente(entidadZonaLisa, new ZonaComponent(2, "Zona Lisa", "Dominio Lisa"));
       
        entidadRedJacob = em.agregarEntidad();
        em.agregarComponente(entidadRedJacob, new RedComponent("Red Jacob", ColoresRed.AZUL));

        entidadRedLisa = em.agregarEntidad();
        em.agregarComponente(entidadRedLisa, new RedComponent("Red Lisa", ColoresRed.VERDE));

        entidadPersonaJacob = em.agregarEntidad();
        em.agregarComponente(entidadPersonaJacob, new PersonaComponent("Jacob García", "jacob.garcia@corp.com", NivelConcienciaSeguridad.MEDIA));

        entidadPersonaLisa = em.agregarEntidad();
        em.agregarComponente(entidadPersonaLisa, new PersonaComponent("Lisa Rodríguez", "lisa.rodriguez@corp.com", NivelConcienciaSeguridad.MEDIA));

        entidadOficinaJacob = em.agregarEntidad();
        em.agregarComponente(entidadOficinaJacob, new OficinaComponent(1, "Oficina Jacob"));

        entidadOficinaLisa = em.agregarEntidad();
        em.agregarComponente(entidadOficinaLisa, new OficinaComponent(1, "Oficina Lisa"));

        entidadEspacio1OficinaJacob = em.agregarEntidad();
        em.agregarComponente(entidadEspacio1OficinaJacob, new EspacioComponent(1));

        entidadEspacio2OficinaJacob = em.agregarEntidad();
        em.agregarComponente(entidadEspacio2OficinaJacob, new EspacioComponent(2));

        entidadEspacio1OficinaLisa = em.agregarEntidad();
        em.agregarComponente(entidadEspacio1OficinaLisa, new EspacioComponent(1));

        entidadEspacio2OficinaLisa = em.agregarEntidad();
        em.agregarComponente(entidadEspacio2OficinaLisa, new EspacioComponent(2));
        
        entidadDispositvo1Jacob = em.agregarEntidad();
        em.agregarComponente(
            entidadDispositvo1Jacob,
            new DispositivoComponent(
                "Disp Jacob","so","hw",TipoDispositivo.WORKSTATION,EstadoAtaqueDispositivo.NORMAL,"pc-jacob","jgarcia","j123"
            )
        );

        entidadDispositvo2Jacob = em.agregarEntidad();
        em.agregarComponente(
            entidadDispositvo2Jacob,
            new DispositivoComponent(
                "Disp Jacob 2","so","hw",TipoDispositivo.ROUTER,EstadoAtaqueDispositivo.NORMAL,"router-jacob","jgarcia","j123"
            )
        );

        entidadDispositvoLisa = em.agregarEntidad();
        em.agregarComponente(
            entidadDispositvoLisa,
            new DispositivoComponent(
                "Disp Lisa","so","hw",TipoDispositivo.WORKSTATION,EstadoAtaqueDispositivo.NORMAL,"pc-lisa","lrodriguez","l123"
            )
        );
    });

    describe("Relación Escenario <-> Zonas", () => {
        it("debe agregar, obtener y remover zonas de un escenario", () => {
            // Agregar
            sistemaJerarquiaEscenario.agregarZonaAEscenario(entidadEscenario, entidadZonaJacob);
            sistemaJerarquiaEscenario.agregarZonaAEscenario(entidadEscenario, entidadZonaLisa);

            // Obtener Hijos y Padre
            const zonasEscenario = sistemaJerarquiaEscenario.obtenerZonasDeEscenario(entidadEscenario);

            expect(zonasEscenario).toStrictEqual([entidadZonaJacob, entidadZonaLisa]);

            const escenarioZonaJacob = sistemaJerarquiaEscenario.obtenerEscenarioDeZona(entidadZonaJacob);
            const escenarioZonaLisa = sistemaJerarquiaEscenario.obtenerEscenarioDeZona(entidadZonaLisa);

            expect(escenarioZonaJacob).toBe(entidadEscenario);
            expect(escenarioZonaLisa).toBe(entidadEscenario);

            // Remover 
            sistemaJerarquiaEscenario.removerZonaDeEscenario(entidadEscenario, entidadZonaJacob);
            sistemaJerarquiaEscenario.removerZonaDeEscenario(entidadEscenario, entidadZonaLisa);

            const zonasEscenarioDespues = sistemaJerarquiaEscenario.obtenerZonasDeEscenario(entidadEscenario);

            expect(zonasEscenarioDespues).toStrictEqual([]);
        });
    });

    describe("Relación Zona <-> Redes", () => {
        it("debe agregar, obtener y remover redes de una zona", () => {
            // Agregar
            sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaJacob, entidadRedJacob);
            sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaLisa, entidadRedLisa);

            // Obtener Hijos y Padre
            const redesZonaJacob = sistemaJerarquiaEscenario.obtenerRedesDeZona(entidadZonaJacob);
            const redesZonaLisa = sistemaJerarquiaEscenario.obtenerRedesDeZona(entidadZonaLisa);

            expect(redesZonaJacob).toStrictEqual([entidadRedJacob]);
            expect(redesZonaLisa).toStrictEqual([entidadRedLisa]);

            const zonaRedJacob = sistemaJerarquiaEscenario.obtenerZonaDeRed(entidadRedJacob);
            const zonaRedLisa = sistemaJerarquiaEscenario.obtenerZonaDeRed(entidadRedLisa);

            expect(zonaRedJacob).toBe(entidadZonaJacob);
            expect(zonaRedLisa).toBe(entidadZonaLisa);

            // Remover 
            sistemaJerarquiaEscenario.removerRedDeZona(entidadZonaJacob, entidadRedJacob);
            sistemaJerarquiaEscenario.removerRedDeZona(entidadZonaLisa, entidadRedLisa);

            const redesZonaJacobDespues = sistemaJerarquiaEscenario.obtenerRedesDeZona(entidadZonaJacob);
            const redesZonaLisaDespues = sistemaJerarquiaEscenario.obtenerRedesDeZona(entidadZonaLisa);

            expect(redesZonaJacobDespues).toStrictEqual([]);
            expect(redesZonaLisaDespues).toStrictEqual([]);
        });
    });

    describe("Relación Zona <-> Personas", () => {
        it("debe agregar, obtener y remover personas de una zona", () => {
            // Agregar
            sistemaJerarquiaEscenario.agregarPersonaAZona(entidadZonaJacob, entidadPersonaJacob);
            sistemaJerarquiaEscenario.agregarPersonaAZona(entidadZonaLisa, entidadPersonaLisa);

            // Obtener Hijos y Padre
            const personasZonaJacob = sistemaJerarquiaEscenario.obtenerPersonasDeZona(entidadZonaJacob);
            const personasZonaLisa = sistemaJerarquiaEscenario.obtenerPersonasDeZona(entidadZonaLisa);

            expect(personasZonaJacob).toStrictEqual([entidadPersonaJacob]);
            expect(personasZonaLisa).toStrictEqual([entidadPersonaLisa]);

            const zonaPersonaJacob = sistemaJerarquiaEscenario.obtenerZonaDePersona(entidadPersonaJacob);
            const zonaPersonaLisa = sistemaJerarquiaEscenario.obtenerZonaDePersona(entidadPersonaLisa);

            expect(zonaPersonaJacob).toBe(entidadZonaJacob);
            expect(zonaPersonaLisa).toBe(entidadZonaLisa);

            // Remover 
            sistemaJerarquiaEscenario.removerPersonaDeZona(entidadZonaJacob, entidadPersonaJacob);
            sistemaJerarquiaEscenario.removerPersonaDeZona(entidadZonaLisa, entidadPersonaLisa);

            const personasZonaJacobDespues = sistemaJerarquiaEscenario.obtenerPersonasDeZona(entidadZonaJacob);
            const personasZonaLisaDespues = sistemaJerarquiaEscenario.obtenerPersonasDeZona(entidadZonaLisa);

            expect(personasZonaJacobDespues).toStrictEqual([]);
            expect(personasZonaLisaDespues).toStrictEqual([]);
        });
    });

    describe("Relación Zona <-> Oficinas", () => {
        it("debe agregar, obtener y remover oficinas de una zona", () => {
            // Agregar
            sistemaJerarquiaEscenario.agregarOficinaAZona(entidadZonaJacob, entidadOficinaJacob);
            sistemaJerarquiaEscenario.agregarOficinaAZona(entidadZonaLisa, entidadOficinaLisa);

            // Obtener Hijos y Padre
            const oficinasZonaJacob = sistemaJerarquiaEscenario.obtenerOficinasDeZona(entidadZonaJacob);
            const oficinasZonaLisa = sistemaJerarquiaEscenario.obtenerOficinasDeZona(entidadZonaLisa);

            expect(oficinasZonaJacob).toStrictEqual([entidadOficinaJacob]);
            expect(oficinasZonaLisa).toStrictEqual([entidadOficinaLisa]);

            const zonaOficinaJacob = sistemaJerarquiaEscenario.obtenerZonaDeOficina(entidadOficinaJacob);
            const zonaOficinaLisa = sistemaJerarquiaEscenario.obtenerZonaDeOficina(entidadOficinaLisa);

            expect(zonaOficinaJacob).toBe(entidadZonaJacob);
            expect(zonaOficinaLisa).toBe(entidadZonaLisa);

            // Remover 
            sistemaJerarquiaEscenario.removerOficinaDeZona(entidadZonaJacob, entidadOficinaJacob);
            sistemaJerarquiaEscenario.removerOficinaDeZona(entidadZonaLisa, entidadOficinaLisa);

            const oficinasZonaJacobDespues = sistemaJerarquiaEscenario.obtenerOficinasDeZona(entidadZonaJacob);
            const oficinasZonaLisaDespues = sistemaJerarquiaEscenario.obtenerOficinasDeZona(entidadZonaLisa);

            expect(oficinasZonaJacobDespues).toStrictEqual([]);
            expect(oficinasZonaLisaDespues).toStrictEqual([]);
        });
    });

    describe("Relación Oficina <-> Espacios", () => {
        it("debe agregar, obtener y remover espacios de una oficina", () => {
            // Agregar
            sistemaJerarquiaEscenario.agregarEspacioAOficina(entidadOficinaJacob, entidadEspacio1OficinaJacob);
            sistemaJerarquiaEscenario.agregarEspacioAOficina(entidadOficinaJacob, entidadEspacio2OficinaJacob);
            sistemaJerarquiaEscenario.agregarEspacioAOficina(entidadOficinaLisa, entidadEspacio1OficinaLisa);
            sistemaJerarquiaEscenario.agregarEspacioAOficina(entidadOficinaLisa, entidadEspacio2OficinaLisa);

            // Obtener Hijos y Padre
            const espaciosOficinaJacob = sistemaJerarquiaEscenario.obtenerEspaciosDeOficina(entidadOficinaJacob);
            const espaciosOficinaLisa = sistemaJerarquiaEscenario.obtenerEspaciosDeOficina(entidadOficinaLisa);

            expect(espaciosOficinaJacob).toStrictEqual([entidadEspacio1OficinaJacob, entidadEspacio2OficinaJacob]);
            expect(espaciosOficinaLisa).toStrictEqual([entidadEspacio1OficinaLisa, entidadEspacio2OficinaLisa]);

            const oficinaEspacio1Jacob = sistemaJerarquiaEscenario.obtenerOficinaDeEspacio(entidadEspacio1OficinaJacob);
            const oficinaEspacio2Jacob = sistemaJerarquiaEscenario.obtenerOficinaDeEspacio(entidadEspacio2OficinaJacob);
            const oficinaEspacio1Lisa = sistemaJerarquiaEscenario.obtenerOficinaDeEspacio(entidadEspacio1OficinaLisa);
            const oficinaEspacio2Lisa = sistemaJerarquiaEscenario.obtenerOficinaDeEspacio(entidadEspacio2OficinaLisa);

            expect(oficinaEspacio1Jacob).toBe(entidadOficinaJacob);
            expect(oficinaEspacio2Jacob).toBe(entidadOficinaJacob);
            expect(oficinaEspacio1Lisa).toBe(entidadOficinaLisa);
            expect(oficinaEspacio2Lisa).toBe(entidadOficinaLisa);

            // Remover 
            sistemaJerarquiaEscenario.removerEspacioDeOficina(entidadOficinaJacob, entidadEspacio1OficinaJacob);
            sistemaJerarquiaEscenario.removerEspacioDeOficina(entidadOficinaJacob, entidadEspacio2OficinaJacob);
            sistemaJerarquiaEscenario.removerEspacioDeOficina(entidadOficinaLisa, entidadEspacio1OficinaLisa);
            sistemaJerarquiaEscenario.removerEspacioDeOficina(entidadOficinaLisa, entidadEspacio2OficinaLisa);

            const espaciosOficinaJacobDespues = sistemaJerarquiaEscenario.obtenerEspaciosDeOficina(entidadOficinaJacob);
            const espaciosOficinaLisaDespues = sistemaJerarquiaEscenario.obtenerEspaciosDeOficina(entidadOficinaLisa);

            expect(espaciosOficinaJacobDespues).toStrictEqual([]);
            expect(espaciosOficinaLisaDespues).toStrictEqual([]);
        });
    });

    describe("Relación Espacio <-> Dispositivos", () => {
        it("debe agregar, obtener y remover dispositvos de un espacio", () => {
            // Agregar
            sistemaJerarquiaEscenario.agregarDispositivoAEspacio(entidadEspacio1OficinaJacob, entidadDispositvo1Jacob);
            sistemaJerarquiaEscenario.agregarDispositivoAEspacio(entidadEspacio2OficinaJacob, entidadDispositvo2Jacob);
            sistemaJerarquiaEscenario.agregarDispositivoAEspacio(entidadEspacio1OficinaLisa, entidadDispositvoLisa);

            // Obtener Hijos y Padre
            const dispositivosEspacio1Jacob = sistemaJerarquiaEscenario.obtenerDispositivosDeEspacio(entidadEspacio1OficinaJacob);
            const dispositivosEspacio2Jacob = sistemaJerarquiaEscenario.obtenerDispositivosDeEspacio(entidadEspacio2OficinaJacob);
            const dispositivosEspacio1Lisa = sistemaJerarquiaEscenario.obtenerDispositivosDeEspacio(entidadEspacio1OficinaLisa);

            expect(dispositivosEspacio1Jacob).toStrictEqual([entidadDispositvo1Jacob]);
            expect(dispositivosEspacio2Jacob).toStrictEqual([entidadDispositvo2Jacob]);
            expect(dispositivosEspacio1Lisa).toStrictEqual([entidadDispositvoLisa]);

            const espacioDispositivo1Jacob = sistemaJerarquiaEscenario.obtenerEspacioDeDispositivo(entidadDispositvo1Jacob);
            const espacioDispositivo2Jacob = sistemaJerarquiaEscenario.obtenerEspacioDeDispositivo(entidadDispositvo2Jacob);
            const espacioDispositivoLisa = sistemaJerarquiaEscenario.obtenerEspacioDeDispositivo(entidadDispositvoLisa);

            expect(espacioDispositivo1Jacob).toBe(entidadEspacio1OficinaJacob);
            expect(espacioDispositivo2Jacob).toBe(entidadEspacio2OficinaJacob);
            expect(espacioDispositivoLisa).toBe(entidadEspacio1OficinaLisa);

            // Remover 
            sistemaJerarquiaEscenario.removerDispositivoDeEspacio(entidadEspacio1OficinaJacob, entidadDispositvo1Jacob);
            sistemaJerarquiaEscenario.removerDispositivoDeEspacio(entidadEspacio2OficinaJacob, entidadDispositvo2Jacob);
            sistemaJerarquiaEscenario.removerDispositivoDeEspacio(entidadEspacio1OficinaLisa, entidadDispositvoLisa);

            const dispositivosEspacio1JacobDespues = sistemaJerarquiaEscenario.obtenerDispositivosDeEspacio(entidadEspacio1OficinaJacob);
            const dispositivosEspacio2JacobDespues = sistemaJerarquiaEscenario.obtenerDispositivosDeEspacio(entidadEspacio2OficinaJacob);
            const dispositivosEspacio1LisaDespues = sistemaJerarquiaEscenario.obtenerDispositivosDeEspacio(entidadEspacio1OficinaLisa);

            expect(dispositivosEspacio1JacobDespues).toStrictEqual([]);
            expect(dispositivosEspacio2JacobDespues).toStrictEqual([]);
            expect(dispositivosEspacio1LisaDespues).toStrictEqual([]);
        });
    });

    describe("Relación jerárquica múltiple Zonas <-> Oficinas <-> Espacios <-> Dispositivos", () => {

        beforeEach(() => {
            // Se agregan las entidades jerarquicamente
            // 1. Escenario <-> Zonas
            sistemaJerarquiaEscenario.agregarZonaAEscenario(entidadEscenario, entidadZonaJacob);

            // 2. Zonas <-> Oficinas
            sistemaJerarquiaEscenario.agregarOficinaAZona(entidadZonaJacob, entidadOficinaJacob);

            // 3. Oficinas <-> Espacios
            sistemaJerarquiaEscenario.agregarEspacioAOficina(entidadOficinaJacob, entidadEspacio1OficinaJacob);
            sistemaJerarquiaEscenario.agregarEspacioAOficina(entidadOficinaJacob, entidadEspacio2OficinaJacob);

            // 4. Espacios <-> Dispositivos
            sistemaJerarquiaEscenario.agregarDispositivoAEspacio(entidadEspacio1OficinaJacob, entidadDispositvo1Jacob);
            sistemaJerarquiaEscenario.agregarDispositivoAEspacio(entidadEspacio2OficinaJacob, entidadDispositvo2Jacob);
        }); 

        it("debe poder obtener la zona de un dispositivo", () => {
            const zonaDeDispositivo1 = sistemaJerarquiaEscenario.obtenerZonaDeDispositivo(entidadDispositvo1Jacob);
            const zonaDeDispositivo2 = sistemaJerarquiaEscenario.obtenerZonaDeDispositivo(entidadDispositvo2Jacob);

            expect(zonaDeDispositivo1).toBe(entidadZonaJacob);
            expect(zonaDeDispositivo2).toBe(entidadZonaJacob);
        });

        it("debe poder obtener la oficina de un dispositivo", () => {
            const oficinaDeDispositivo1 = sistemaJerarquiaEscenario.obtenerOficinaDeDispositivo(entidadDispositvo1Jacob);
            const oficinaDeDispositivo2 = sistemaJerarquiaEscenario.obtenerOficinaDeDispositivo(entidadDispositvo2Jacob);

            expect(oficinaDeDispositivo1).toBe(entidadOficinaJacob);
            expect(oficinaDeDispositivo2).toBe(entidadOficinaJacob);
        });

        it("debe poder obtener la zona de un espacio", () => {
            const zonaDeEspacio1 = sistemaJerarquiaEscenario.obtenerZonaDeEspacio(entidadEspacio1OficinaJacob);
            const zonaDeEspacio2 = sistemaJerarquiaEscenario.obtenerZonaDeEspacio(entidadEspacio2OficinaJacob);

            expect(zonaDeEspacio1).toBe(entidadZonaJacob);
            expect(zonaDeEspacio2).toBe(entidadZonaJacob);
        });

        it("debe poder obtener los dispositivos de una oficina", () => {
            const dispositivosDeOficina = sistemaJerarquiaEscenario.obtenerDispositivosDeOficina(entidadOficinaJacob);

            expect(dispositivosDeOficina).toStrictEqual([entidadDispositvo1Jacob, entidadDispositvo2Jacob]);
        });

        it("debe poder obtener los dispositivos de una zona", () => {
            const dispositivosDeZona = sistemaJerarquiaEscenario.obtenerDispositivosDeZona(entidadZonaJacob);

            expect(dispositivosDeZona).toStrictEqual([entidadDispositvo1Jacob, entidadDispositvo2Jacob]);
        });
    });
});
