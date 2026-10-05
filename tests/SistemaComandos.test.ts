import { ECSManager, Entidad } from "../src/client/ecs/core";
import { SistemaComandos, SistemaJerarquiaEscenario } from "../src/client/ecs/systems";
import { ActivoComponent, DispositivoComponent, RedComponent, RouterComponent, ZonaComponent } from "../src/client/ecs/components";
import { ComandoTerminal, EstadoAtaqueDispositivo, TipoActivo, TipoDispositivo } from "../src/client/shared/types/DeviceEnums";
import { beforeEach, test, describe, expect, it } from "vitest";
import { ColoresRed } from "../src/client/data/colores";
import { FirewallBuilder } from "../src/client/ecs/utils/FirewallBuilder";
import { RedController } from "../src/client/ecs/controllers/RedController";
import { AccionFirewall, DireccionTrafico } from "../src/client/shared/types/FirewallTypes";
import { TipoProtocolo } from "../src/client/shared/types/TrafficEnums";

describe("SistemaComandos", () => {

    let em: ECSManager;
    let sistemaComandos: SistemaComandos;
    let entidadDispJacob: Entidad;
    let activoComponente: ActivoComponent;
    let entidadDispLisa: Entidad;
    let entidadRouterJacob: Entidad;
    let entidadRouterLisa: Entidad;
    let entidadRedJacob: Entidad;
    let entidadRedLisa: Entidad;
    let entidadRedInternet: Entidad;
    let redController: RedController;
    let comando: string;

    beforeEach(() => {
        em = new ECSManager();
        
        sistemaComandos = new SistemaComandos();
        em.agregarSistema(sistemaComandos);

        const sistemaJerarquiaEscenario = new SistemaJerarquiaEscenario(em);
        em.agregarSistema(sistemaJerarquiaEscenario);

        const entidadZonaJacob = em.agregarEntidad();
        em.agregarComponente(entidadZonaJacob,new ZonaComponent(1,"Zona Jacob","Dominio Jacob"));
        
        const entidadZonaLisa = em.agregarEntidad();
        em.agregarComponente(entidadZonaLisa,new ZonaComponent(2,"Zona Lisa","Dominio Lisa"));

        entidadDispJacob = em.agregarEntidad();
        em.agregarComponente(
            entidadDispJacob,
            new DispositivoComponent(
                "Computadora Jacob",
                "Windows",
                "DELL",
                TipoDispositivo.WORKSTATION,
                EstadoAtaqueDispositivo.NORMAL,
                "pc-jacob",
                "jgarcia",
                "j123"
            )
        );

        activoComponente = new ActivoComponent();
        activoComponente.activos.push(
            {
                nombre: "Activo1",
                contenido: "Infor importante",
                tipo: TipoActivo.DOCUMENTO
            },
            {
                nombre: "Activo2",
                contenido: "Infor importante 2",
                tipo: TipoActivo.DOCUMENTO
            },
        );
        em.agregarComponente(entidadDispJacob, activoComponente);

        entidadRouterJacob = em.agregarEntidad();
        em.agregarComponente(
            entidadRouterJacob,
            new DispositivoComponent("router","so","hw",TipoDispositivo.ROUTER,EstadoAtaqueDispositivo.NORMAL,"router","jacob","123")
        );

        entidadDispLisa = em.agregarEntidad();
        em.agregarComponente(
            entidadDispLisa,
            new DispositivoComponent(
                "Computadora Lisa",
                "Windows",
                "DELL",
                TipoDispositivo.WORKSTATION,
                EstadoAtaqueDispositivo.NORMAL,
                "pc-lisa",
                "lrodriguez",
                "l123"
            )
        );

        entidadRouterLisa = em.agregarEntidad();
        em.agregarComponente(
            entidadRouterLisa,
            new DispositivoComponent("router2","so","hw",TipoDispositivo.ROUTER,EstadoAtaqueDispositivo.NORMAL,"router","lisa","123")
        );

        entidadRedJacob = em.agregarEntidad();
        em.agregarComponente(entidadRedJacob, new RedComponent("LAN1", ColoresRed.VERDE));

        const firewallConfigJacob = new FirewallBuilder().build();
        em.agregarComponente(entidadRouterJacob, new RouterComponent(firewallConfigJacob)); 

        entidadRedLisa = em.agregarEntidad();
        em.agregarComponente(entidadRedLisa, new RedComponent("LAN2", ColoresRed.AZUL));

        const firewallConfigLisa = new FirewallBuilder().build();
        em.agregarComponente(entidadRouterLisa, new RouterComponent(firewallConfigLisa));

        entidadRedInternet = em.agregarEntidad();
        em.agregarComponente(entidadRedInternet, new RedComponent("Internet", ColoresRed.ROJO));

        redController = RedController.getInstance(em);
        redController.iniciarController();

        sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaJacob, entidadRedJacob);
        sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaJacob, entidadRedInternet);
        sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaLisa, entidadRedLisa);
        sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaLisa, entidadRedInternet);

        redController.asignarRed(entidadDispJacob, entidadRedJacob);
        redController.asignarRed(entidadRouterJacob, entidadRedJacob);
        redController.asignarRed(entidadRouterJacob, entidadRedInternet);
        redController.asignarRed(entidadRouterLisa, entidadRedInternet);
        redController.asignarRed(entidadRouterLisa, entidadRedLisa);
        redController.asignarRed(entidadDispLisa, entidadRedLisa);

        // Se añaden reglas para el firewall de Jacob
        for (const entidadRed of em.getComponentes(entidadRouterJacob)!.get(DispositivoComponent)!.redes) {
            for (const protocolo of redController.obtenerTodosLosProtocolos()){
                redController.agregarReglaFirewall(
                                    entidadRouterJacob,
                                    entidadRed,
                                    protocolo,
                                    AccionFirewall.PERMITIR,
                                    DireccionTrafico.DESDE
                                ); 
            }
        }
        for (const entidadRed of em.getComponentes(entidadRouterJacob)!.get(DispositivoComponent)!.redes) {
            for (const protocolo of redController.obtenerTodosLosProtocolos()){
                redController.agregarReglaFirewall(
                                    entidadRouterJacob,
                                    entidadRed,
                                    protocolo,
                                    AccionFirewall.PERMITIR,
                                    DireccionTrafico.HACIA
                                 ); 
            }
        }

        // Se añaden reglas para el firewall de Lisa
        for (const entidadRed of em.getComponentes(entidadRouterLisa)!.get(DispositivoComponent)!.redes) {
            for (const protocolo of redController.obtenerTodosLosProtocolos()){
                redController.agregarReglaFirewall(
                                    entidadRouterLisa,
                                    entidadRed,
                                    protocolo,
                                    AccionFirewall.PERMITIR,
                                    DireccionTrafico.DESDE
                                ); 
            }
        }
        for (const entidadRed of em.getComponentes(entidadRouterLisa)!.get(DispositivoComponent)!.redes) {
            for (const protocolo of redController.obtenerTodosLosProtocolos()){
                redController.agregarReglaFirewall(
                                    entidadRouterLisa,
                                    entidadRed,
                                    protocolo,
                                    AccionFirewall.PERMITIR,
                                    DireccionTrafico.HACIA
                                 ); 
            }
        }
    });

    test("ejecución de comando vacío", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        comando = "";

        let respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe("");

        comando = " ";

        respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe("");
    });

    test("ejecución de comando no válido", () => {
        const mensajeAyuda = "Parece que el comando ingresado no existe o tiene un formato inválido. Ingresa 'h' para ver todos los comandos disponibles."

        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        comando = "asdgf";

        let respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(mensajeAyuda);

        comando = "asdgf asjdb";

        respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(mensajeAyuda);
    });

    test("ejecución comando 'h'", () => {
        const comandosDisponibles = Object.values(ComandoTerminal); 

        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);
        
        comando = ComandoTerminal.H; 

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).contains("Comandos disponibles:\n");
        comandosDisponibles.forEach((c) => {
            expect(respuesta.texto).contains(c+"\t");
        });
    });

    test("ejecución comando 'ls'", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        comando = ComandoTerminal.LS;

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        activoComponente.activos.forEach((a) => {
            expect(respuesta.texto).contains(a.nombre+"\n");
        });
    });

    test("ejecución comando 'cat'", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        comando = "cat Activo1";

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(activoComponente.activos[0].contenido);
    });

    test("ejecución comando 'cat' con archivo que no existe", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        const archivoInexistente = "archivo_inexistente";
        comando = "cat "+archivoInexistente;

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(`Error: cat: No existe el archivo '${archivoInexistente}'`);
    });

    test("ejecución comando 'ssh'", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

        comando = "ssh jgarcia@pc-jacob j123"; // En el frontend se controla el ingreso de la contraseña como tercer argumento del comando

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(`¡Bienvenido de nuevo jgarcia!\nEscribe 'h' para ver todos los comandos disponibles.\n`);
    });

    test("ejecución comando 'ssh' con equipo inexistente", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

        comando = "ssh jgarcia@pc-aaaa j123";

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispLisa);
        expect(respuesta.texto).toBe(`Error: ssh: No se ha encontrado el dispositivo 'pc-aaaa'.`);
    });

    describe("ejecución comando 'ssh' con bloqueo del protocolo en firewall", () => {
        it("debe rechazar la conexión si el firewall del equipo Destino tiene bloqueado el protocolo HACIA su Red Interna", () => {
            redController.agregarReglaFirewall(
                entidadRouterJacob,
                entidadRedJacob,
                TipoProtocolo.SSH,
                AccionFirewall.DENEGAR,
                DireccionTrafico.HACIA
            );

            sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

            comando = "ssh jgarcia@pc-jacob j123";

            const respuesta = sistemaComandos.ejecutarComando(comando);

            expect(respuesta.entidadActual).toBe(entidadDispLisa);
            expect(respuesta.texto).toBe(`Error: ssh: Conectar con dispositivo 'pc-jacob': Conexión rechazada.`);
        });

        it("debe rechazar la conexión si el firewall del equipo Destino tiene bloqueado el protocolo DESDE el Internet", () => {
            redController.agregarReglaFirewall(
                entidadRouterJacob,
                entidadRedInternet,
                TipoProtocolo.SSH,
                AccionFirewall.DENEGAR,
                DireccionTrafico.DESDE
            );

            sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

            comando = "ssh jgarcia@pc-jacob j123";

            const respuesta = sistemaComandos.ejecutarComando(comando);

            expect(respuesta.entidadActual).toBe(entidadDispLisa);
            expect(respuesta.texto).toBe(`Error: ssh: Conectar con dispositivo 'pc-jacob': Conexión rechazada.`);
        });

        it("debe rechazar la conexión si el firewall del equipo Origen tiene bloqueado el protocolo HACIA el Internet", () => {
            redController.agregarReglaFirewall(
                entidadRouterLisa,
                entidadRedInternet,
                TipoProtocolo.SSH,
                AccionFirewall.DENEGAR,
                DireccionTrafico.HACIA
            );

            sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

            comando = "ssh jgarcia@pc-jacob j123";

            const respuesta = sistemaComandos.ejecutarComando(comando);

            expect(respuesta.entidadActual).toBe(entidadDispLisa);
            expect(respuesta.texto).toBe(`Error: ssh: Conectar con dispositivo 'pc-jacob': Conexión rechazada.`);
        });

        it("debe rechazar la conexión si el firewall del equipo Origen tiene bloqueado el protocolo DESDE su Red Interna", () => {
            redController.agregarReglaFirewall(
                entidadRouterLisa,
                entidadRedLisa,
                TipoProtocolo.SSH,
                AccionFirewall.DENEGAR,
                DireccionTrafico.DESDE
            );

            sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

            comando = "ssh jgarcia@pc-jacob j123";

            const respuesta = sistemaComandos.ejecutarComando(comando);

            expect(respuesta.entidadActual).toBe(entidadDispLisa);
            expect(respuesta.texto).toBe(`Error: ssh: Conectar con dispositivo 'pc-jacob': Conexión rechazada.`);
        });
    });

    test("ejecución comando 'ssh' con usuario inexistente", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

        comando = "ssh abcdfg@pc-jacob j123";

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispLisa);
        expect(respuesta.texto).toBe(`Error: ssh: No existe el usuario 'abcdfg' en el dispositivo 'pc-jacob'.`);
    });

    test("ejecución comando 'ssh' con contraseña incorrecta", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

        comando = "ssh jgarcia@pc-jacob j7777";

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispLisa);
        expect(respuesta.texto).toBe(`Error: ssh: Contraseña incorrecta para el usuario 'jgarcia'.`);
    });
});
