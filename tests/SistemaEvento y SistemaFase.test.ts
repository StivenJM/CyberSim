import { describe, beforeEach, test, expect, it } from "vitest";
import { ECSManager, Entidad } from "../src/client/ecs/core";
import { SistemaActivo, SistemaEvento, SistemaFase, SistemaJerarquiaEscenario, SistemaPresupuesto, SistemaRed, SistemaTiempo } from "../src/client/ecs/systems";
import { EstadoAtaqueDispositivo, TipoActivo, TipoAtaque, TipoDispositivo, TipoEvento, TipoProteccionVPN } from "../src/client/shared/types/DeviceEnums";
import { AccionesRealizables, ObjetosManejables } from "../src/client/shared/types/AccionesEnums";
import { ActivoComponent, AtaqueComponent, ClienteVPNComponent, DispositivoComponent, EscenarioComponent, EventoComponent, FaseComponent, RedComponent, RouterComponent, VPNGatewayComponent, WorkstationComponent, ZonaComponent } from "../src/client/ecs/components";
import { PlantillasCorreoPhishing } from "../src/client/data/plantillas/Plantillas";
import { FirewallBuilder } from "../src/client/ecs/utils/FirewallBuilder";
import { RedController } from "../src/client/ecs/controllers/RedController";
import { EscenarioController } from "../src/client/ecs/controllers/EscenarioController";
import { TipoProtocolo } from "../src/client/shared/types/TrafficEnums";
import { PerfilClienteVPN, PerfilVPNGateway } from "../src/client/shared/types/EscenarioTypes";
import { ColoresRed } from "../src/client/data/colores";
import { APPS } from "../src/client/data/apps";
import { FirewallConfigService } from "../src/client/ecs/systems/red";
import { AccionFirewall, DireccionTrafico } from "../src/client/shared/types/FirewallTypes";

describe("SistemaEvento y SistemaFase", () => {

    let em: ECSManager;
    let sistemaEvento: SistemaEvento;
    let entidadDispJacob: Entidad;
    let entidadVpnGateway: Entidad;
    let entidadDispLisa: Entidad;
    let sistemaPresupuesto: SistemaPresupuesto;
    let sistemaFase: SistemaFase;
    let entidadEscenario: Entidad;
    let fases: FaseComponent[];
    let activoComponenteJacob: ActivoComponent;
    let activoComponenteLisa: ActivoComponent;
    let eventos: EventoComponent[];
    let redController: RedController;
    let sistemaActivo: SistemaActivo;
    let escenarioController: EscenarioController;
    let ataques: AtaqueComponent[];
    let entidadRedJacob: Entidad;
    let entidadRouterJacob: Entidad;
    let entidadRouterLisa: Entidad;
    let entidadRedLisa: Entidad;
    let entidadRedInternet: Entidad;

    beforeEach(() => {
        em = new ECSManager();

        sistemaFase = new SistemaFase();
        em.agregarSistema(sistemaFase);
        sistemaFase.iniciarEscuchaDeEvento();

        sistemaEvento = new SistemaEvento();
        em.agregarSistema(sistemaEvento); 

        sistemaPresupuesto = new SistemaPresupuesto();
        em.agregarSistema(sistemaPresupuesto);

        const sistemaRed = new SistemaRed();
        em.agregarSistema(sistemaRed);

        sistemaActivo = new SistemaActivo();
        em.agregarSistema(sistemaActivo);

        const sistemaJerarquiaEscenario = new SistemaJerarquiaEscenario(em);
        em.agregarSistema(sistemaJerarquiaEscenario);

        redController = RedController.getInstance(em);
        redController.iniciarController();

        entidadEscenario = em.agregarEntidad();
        em.agregarComponente(entidadEscenario, new EscenarioComponent(1, "escenario", "escenario", 10));  

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
        em.agregarComponente(entidadDispJacob, new WorkstationComponent());

        activoComponenteJacob = new ActivoComponent();
        activoComponenteJacob.activos.push(
            {
                nombre: "Activo1",
                contenido: "Infor importante",
                tipo: TipoActivo.DOCUMENTO
            },
            {
                nombre: "Activo2",
                contenido: "La contraseña secreta es 123",
                tipo: TipoActivo.DOCUMENTO,
                firma: "Firma Activo2"
            },
            {
                nombre: "Firma Activo2",
                contenido: "La contraseña secreta es 123",
                tipo: TipoActivo.FIRMA_DIGITAL,
                propietario: "Jacob"
            },
            {
                nombre: "Clave_Publica_Jacob",
                tipo: TipoActivo.CLAVE_PUBLICA,
                propietario: "Jacob"
            },
        );
        em.agregarComponente(entidadDispJacob, activoComponenteJacob);

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
        activoComponenteLisa = new ActivoComponent();
        em.agregarComponente(entidadDispLisa, activoComponenteLisa);

        em.agregarComponente(entidadDispLisa, new ClienteVPNComponent()); // Perfil de Cliente VPN en la PC de Lisa

        entidadRouterJacob = em.agregarEntidad();
        em.agregarComponente(
          entidadRouterJacob,
          new DispositivoComponent(
            "router1",
            "Cisco",
            "hw",
            TipoDispositivo.ROUTER,
            EstadoAtaqueDispositivo.NORMAL,
            "router1",
            "admin",
            "1234"
          )
        );

        entidadRouterLisa = em.agregarEntidad();
        em.agregarComponente(
          entidadRouterLisa,
          new DispositivoComponent(
            "router2",
            "Cisco",
            "hw",
            TipoDispositivo.ROUTER,
            EstadoAtaqueDispositivo.NORMAL,
            "router2",
            "admin",
            "1234"
          )
        );

        entidadVpnGateway = em.agregarEntidad();  // Dispositivo VPN Gateway en el lado de Jacob
        em.agregarComponente(
            entidadVpnGateway,
            new DispositivoComponent(
                "vpnGateway",
                "Cisco",
                "hw",
                TipoDispositivo.VPN,
                EstadoAtaqueDispositivo.NORMAL,
                "vpn1",
                "",
                ""
            )
        );
        em.agregarComponente(entidadVpnGateway, new VPNGatewayComponent());

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

        sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaJacob, entidadRedJacob);
        sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaJacob, entidadRedInternet);
        sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaLisa, entidadRedLisa);
        sistemaJerarquiaEscenario.agregarRedAZona(entidadZonaLisa, entidadRedInternet);

        redController.asignarRed(entidadDispJacob, entidadRedJacob);
        redController.asignarRed(entidadVpnGateway, entidadRedJacob);
        redController.asignarRed(entidadVpnGateway, entidadRedInternet);
        redController.asignarRed(entidadRouterJacob, entidadRedJacob);
        redController.asignarRed(entidadRouterJacob, entidadRedInternet);
        redController.asignarRed(entidadRouterLisa, entidadRedInternet);
        redController.asignarRed(entidadRouterLisa, entidadRedLisa);
        redController.asignarRed(entidadDispLisa, entidadRedLisa);

        // Se añaden reglas para el firewall de Jacob
        for (const entidadRed of em.getComponentes(entidadRouterJacob)!.get(DispositivoComponent)!.redes) {
            for (const protocolo of FirewallConfigService.obtenerTodosLosProtocolos()){
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
            for (const protocolo of FirewallConfigService.obtenerTodosLosProtocolos()){
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
            for (const protocolo of FirewallConfigService.obtenerTodosLosProtocolos()){
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
            for (const protocolo of FirewallConfigService.obtenerTodosLosProtocolos()){
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

    test("Verificación de condición de mitigación Exitosa: Configuraciones de Workstation", () => {
        ataques = [
            new AtaqueComponent(
              "ataque troyano",
              5,
              TipoAtaque.INFECCION_TROYANO,
              "Computadora Jacob",
              "Un dispositivo está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
              1,
              {
                accion: AccionesRealizables.CLICK,
                objeto: ObjetosManejables.CONFIG_WORKSTATION,
                val: [ // Estas 2 por defecto son falsas, por lo que se quiere verificar que se han activado (puesto en true)
                   {
                     nombreConfig: "Actualizaciones automáticas de antivirus", 
                     activado: true,
                   },
                   {
                     nombreConfig: "Antivirus gestionado",
                     activado: true,
                   }
                ],
              },
            ),
        ];


        sistemaPresupuesto.toggleConfiguracionWorkstation(entidadDispJacob, "Actualizaciones automáticas de antivirus");
        sistemaPresupuesto.toggleConfiguracionWorkstation(entidadDispJacob, "Antivirus gestionado");

        sistemaEvento.ejecutarAtaque(entidadDispJacob, ataques[0]);

        const estadoAtaqueDispositivo = em.getEntidades().get(entidadDispJacob)?.get(DispositivoComponent)?.estadoAtaque;

        expect(estadoAtaqueDispositivo).toBe(EstadoAtaqueDispositivo.NORMAL);
    });

    test("Verificación de condición de mitigación Fallida: Configuraciones de Workstation", () => {
        ataques = [
            new AtaqueComponent(
              "ataque troyano",
              5,
              TipoAtaque.INFECCION_TROYANO,
              "Computadora Jacob",
              "Un dispositivo está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
              1,
              {
                accion: AccionesRealizables.CLICK,
                objeto: ObjetosManejables.CONFIG_WORKSTATION,
                val: [ // Estas 2 por defecto son falsas, por lo que se quiere verificar que se han activado (puesto en true)
                   {
                     nombreConfig: "Actualizaciones automáticas de antivirus", 
                     activado: true,
                   },
                   {
                     nombreConfig: "Antivirus gestionado",
                     activado: true,
                   }
                ],
              },
            ),
        ];

        // No se activan las configuraciones esperadas //

        sistemaEvento.ejecutarAtaque(entidadDispJacob, ataques[0]);

        const estadoAtaqueDispositivo = em.getEntidades().get(entidadDispJacob)?.get(DispositivoComponent)?.estadoAtaque;

        expect(estadoAtaqueDispositivo).toBe(EstadoAtaqueDispositivo.COMPROMETIDO);
    });

    test("Verificación de condición de mitigación Exitosa: Configuraciones de Firewall", () => {
        ataques = [
            new AtaqueComponent(
              "ataque troyano",
              1,
              TipoAtaque.INFECCION_TROYANO,
              "router1",
              "Un router está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
              1,
              {
                accion: AccionesRealizables.CLICK,
                objeto: ObjetosManejables.CONFIG_FIREWALL,
                val: [
                  {
                    nombreRed: "LAN1",
                    accion: AccionFirewall.DENEGAR,
                    direccion: DireccionTrafico.HACIA,
                    protocolo: TipoProtocolo.SSH,
                  },
                  {
                    nombreRed: "LAN1",
                    accion: AccionFirewall.DENEGAR,
                    direccion: DireccionTrafico.HACIA,
                    protocolo: TipoProtocolo.FTP,
                  },
                ],
              },
            ),
        ];

        // Modificamos las reglas 
        redController.agregarReglaFirewall(
            entidadRouterJacob,
            entidadRedJacob,
            TipoProtocolo.SSH,
            AccionFirewall.DENEGAR,
            DireccionTrafico.HACIA
        );

        redController.agregarReglaFirewall(
            entidadRouterJacob,
            entidadRedJacob,
            TipoProtocolo.FTP,
            AccionFirewall.DENEGAR,
            DireccionTrafico.HACIA
        );

        sistemaEvento.ejecutarAtaque(entidadRouterJacob, ataques[0]);

        const estadoAtaqueDispositivo = em.getComponentes(entidadRouterJacob)?.get(DispositivoComponent)?.estadoAtaque;

        expect(estadoAtaqueDispositivo).toBe(EstadoAtaqueDispositivo.NORMAL);
    });

    test("Verificación de condición de mitigación Fallida: Configuraciones de Firewall", () => {
        ataques = [
            new AtaqueComponent(
              "ataque troyano",
              1,
              TipoAtaque.INFECCION_TROYANO,
              "router1",
              "Un router está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
              1,
              {
                accion: AccionesRealizables.CLICK,
                objeto: ObjetosManejables.CONFIG_FIREWALL,
                val: [
                  {
                    nombreRed: "LAN1",
                    accion: AccionFirewall.DENEGAR,
                    direccion: DireccionTrafico.HACIA,
                    protocolo: TipoProtocolo.SSH,
                  },
                  {
                    nombreRed: "LAN1",
                    accion: AccionFirewall.DENEGAR,
                    direccion: DireccionTrafico.HACIA,
                    protocolo: TipoProtocolo.FTP,
                  },
                ],
              },
            ),
        ];

        // No modificamos todas las reglas (o ninguna). 
        redController.agregarReglaFirewall(
            entidadRouterJacob,
            entidadRedJacob,
            TipoProtocolo.SSH,
            AccionFirewall.DENEGAR,
            DireccionTrafico.HACIA
        );

        sistemaEvento.ejecutarAtaque(entidadRouterJacob, ataques[0]);

        const estadoAtaqueDispositivo = em.getComponentes(entidadRouterJacob)?.get(DispositivoComponent)?.estadoAtaque;

        expect(estadoAtaqueDispositivo).toBe(EstadoAtaqueDispositivo.COMPROMETIDO);
    });

    test("Verificación de ejecución de evento Exitoso: Envío de correo", () => {
        eventos = [
            new EventoComponent(
                "envio de correo",
                TipoEvento.ENVIO_CORREO,
                1,
                "envio de correo phishing",
                1,
                {
                    dispositivoEmisor: "Computadora Lisa",
                    destinatario: "jacob.garcia@corp.com",
                    asunto: PlantillasCorreoPhishing[0].asunto,
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion:
                "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "envio de correo",
                  completado: false,
                },
              ],
            },
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;

        // Se envía el correo
        em.registrarAccion(
            AccionesRealizables.ENVIO,
            ObjetosManejables.CORREO,
            undefined,
            {
                dispositivoEmisor: "Computadora Lisa",
                destinatario: "jacob.garcia@corp.com",
                asunto: PlantillasCorreoPhishing[0].asunto,
            }
        );

        sistemaEvento.ejecutarEvento(eventos[0]);
 
        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true); // Como para este caso sólo hay una fase con un objetivo, seleccionamos directamente todo con el primer índice
    });

    test("Verificación de ejecución de evento Exitoso: Envío de activo", () => {
        eventos = [
            new EventoComponent(
                "envio de activo",
                TipoEvento.ENVIO_ACTIVO,
                1,
                "envio de activo a otra pc",
                1,
                {
                    nombreActivo: "Activo1",
                    dispositivoEmisor: "Computadora Jacob",
                    dispositivoReceptor: "Computadora Lisa",
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion:
                "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "envio de activo",
                  completado: false,
                },
              ],
            },
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;        

        sistemaEvento.ejecutarEvento(eventos[0]);

        const activosEnOtraPc = em.getEntidades().get(entidadDispLisa)!.get(ActivoComponent)!.activos;
 
        expect(activosEnOtraPc[0].nombre).toBe("Activo1");
    });

    describe("Verificación de ejecución de evento Fallido: Envío de activo", () => {
        beforeEach(() => {
            eventos = [
                new EventoComponent(
                    "envio de activo",
                    TipoEvento.ENVIO_ACTIVO,
                    1,
                    "envio de activo a otra pc",
                    1,
                    {
                        nombreActivo: "Activo1",
                        dispositivoEmisor: "Computadora Jacob",
                        dispositivoReceptor: "Computadora Lisa",
                    }
                ),
            ];

            fases = [
                {
                  id: 1,
                  nombre: "Fase 1: Prueba",
                  descripcion:
                    "Prueba",
                  faseActual: true,
                  completada: false,
                  objetivos: [ 
                    {
                      descripcion: "envio de activo",
                      completado: false,
                    },
                  ],
                },
            ];

            sistemaFase.eventosEscenario = eventos;

            em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;        
        });

        it("no debe enviar el activo si el dispositivo receptor no tiene el componente de activos", () => {
            em.removerComponente(entidadDispLisa, ActivoComponent);
            
            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Activo no enviado: Computadora Lisa no tiene componente de activos.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("no debe enviar el activo si el dispositivo emisor no tiene el componente de activos", () => {
            em.removerComponente(entidadDispJacob, ActivoComponent);
            
            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Activo no enviado: Computadora Jacob no tiene componente de activos.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("no debe enviar el activo si el dispositivo emisor no tiene el activo esperado", () => { 
            em.getComponentes(entidadDispJacob)!.get(ActivoComponent)!.activos = [];

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Activo no enviado: Computadora Jacob no tiene el activo: Activo1.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("no debe enviar el activo si el dispositivo receptor ya tiene el activo esperado", () => { 
            em.getComponentes(entidadDispLisa)!.get(ActivoComponent)!.activos.push(
                                                                        {
                                                                            nombre: "Activo1",
                                                                            contenido: "Infor importante",
                                                                            tipo: TipoActivo.DOCUMENTO
                                                                        }
                                                                    );
            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Activo no enviado: Computadora Lisa ya contiene el activo: Activo1.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("no debe enviar el activo si un firewall del Emisor tiene bloqueadas las conexiones FTP, DESDE su Red Interna", () => {
            redController.agregarReglaFirewall(
                entidadRouterJacob,
                entidadRedJacob,
                TipoProtocolo.FTP,
                AccionFirewall.DENEGAR,
                DireccionTrafico.DESDE
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Activo no enviado: un firewall ha rechazado la conexión entre Computadora Jacob y Computadora Lisa.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("no debe enviar el activo si un firewall del Emisor tiene bloqueadas las conexiones FTP, HACIA el Internet", () => {
            redController.agregarReglaFirewall(
                entidadRouterJacob,
                entidadRedInternet,
                TipoProtocolo.FTP,
                AccionFirewall.DENEGAR,
                DireccionTrafico.HACIA
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Activo no enviado: un firewall ha rechazado la conexión entre Computadora Jacob y Computadora Lisa.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("no debe enviar el activo si un firewall del Receptor tiene bloqueadas las conexiones FTP, DESDE el Internet", () => {
            redController.agregarReglaFirewall(
                entidadRouterLisa,
                entidadRedInternet,
                TipoProtocolo.FTP,
                AccionFirewall.DENEGAR,
                DireccionTrafico.DESDE
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Activo no enviado: un firewall ha rechazado la conexión entre Computadora Jacob y Computadora Lisa.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("no debe enviar el activo si un firewall del Receptor tiene bloqueadas las conexiones FTP, HACIA su Red Interna", () => {
            redController.agregarReglaFirewall(
                entidadRouterLisa,
                entidadRedLisa,
                TipoProtocolo.FTP,
                AccionFirewall.DENEGAR,
                DireccionTrafico.HACIA
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Activo no enviado: un firewall ha rechazado la conexión entre Computadora Jacob y Computadora Lisa.");

            expect(logResultanteDeRechazo).toBeDefined();
        });
    });

    test("Verificación de ejecución de evento Exitoso: Verificación de firma", () => {
        eventos = [
            new EventoComponent(
                "verificación de firma",
                TipoEvento.VERIFICACION_FIRMA,
                1,
                "verificación de firma digital",
                1,
                {
                    nombreDocumento: "Activo2",
                    nombreFirma: "Firma Activo2",
                    nombreClave: "Clave_Publica_Jacob",
                    veredicto: true,
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion: "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "verificación de firma",
                  completado: false,
                },
              ],
            }
        ];

        sistemaFase.eventosEscenario = eventos;

        // em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.eventos = eventos;
        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;

        escenarioController = EscenarioController.getInstance(em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent), em);
        escenarioController.iniciarEscuchaDeEventos();

        // Simulamos el registro de un veredicto luego de comprobar la firma y la clave pública contra el documento
        em.getSistema(SistemaActivo)!.registrarVeredictoFirma({
            nombreDocumento: "Activo2",
            nombreFirma: "Firma Activo2",
            nombreClave: "Clave_Publica_Jacob",
            veredicto: true
        });

        em.getSistema(SistemaEvento)!.ejecutarEvento(eventos[0]);

        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true);

        EscenarioController.reset();
    });

    test("Verificación de ejecución de evento Exitoso: Tráfico de red Permitido", () => {
        eventos = [
            new EventoComponent(
                "trafico de red",
                TipoEvento.TRAFICO_RED,
                1,
                "envío de trafico de red",
                1,
                {
                    // Para el evento de TRAFICO_RED, el protocolo puede ser cualquiera y sólo con los atributos
                    // que se ven aquí, ya que sólo es una simulación de que el tráfico ha circulado entre los dos 
                    // dispositivos definidos aquí, sin necesidad de enviar un payload real. Para los casos en los 
                    // que se necesite enviar un payload real, se puede consultar el switch de TipoProtocolo definido 
                    // en la función enviarTrafico de SistemaRed. (Tomar en cuenta que para cuando se quiere enviar con 
                    // un payload real, se deben utilizar las funciones respectivas para ello [FTP y VPN_GATEWAY son, de 
                    // momento, los únicos protocolos que están disponibles para eso]. Esto se puede hacer directo con el evento 
                    // de TRAFICO_RED si se desea, pero para esos 2 protocolos ya se tienen sus eventos propios: ENVIO_ACTIVO 
                    // para FTP y CONEXION_VPN para VPN_GATEWAY)
                    dispositivoOrigen: "Computadora Jacob",
                    dispositivoDestino: "Computadora Lisa",
                    protocolo: TipoProtocolo.TELNET, 
                    // Este parámetro debe ser true cuando se quiere que el paso del tráfico sea un objetivo definido en el escenario.
                    // Por lo que, cuando sea true, también se debe definir su respectivo objetivo en las fases.
                    esObjetivo: true, 
                    debeSerBloqueado: false
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion: "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "trafico de red",
                  completado: false,
                },
              ],
            }
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases; 

        sistemaEvento.ejecutarEvento(eventos[0]);
 
        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true);
    });

    test("Verificación de ejecución de evento Exitoso: Tráfico de red Bloqueado", () => {
        eventos = [
            new EventoComponent(
                "trafico de red",
                TipoEvento.TRAFICO_RED,
                1,
                "envío de trafico de red",
                1,
                {
                    dispositivoOrigen: "Computadora Jacob",
                    dispositivoDestino: "Computadora Lisa",
                    protocolo: TipoProtocolo.TELNET, 
                    esObjetivo: true, 
                    debeSerBloqueado: true
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion: "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "trafico de red",
                  completado: false,
                },
              ],
            }
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases; 

        // Dado que se espera que el tráfico enviado sea bloqueado, se necesita modificar la regla en el firewall correspondiente 
        // del router que está conectado con el dispositivo de destino. Importante: la dirección de ley debe ser HACIA, ya que se 
        // supone que se está bloqueando el tráfico Hacia la red del dispositivo destino; y evidentemente, la acción debe ser Denegar, 
        // con el mismo protocolo.
        redController.agregarReglaFirewall(
            entidadRouterLisa,
            entidadRedLisa,
            TipoProtocolo.TELNET,
            AccionFirewall.DENEGAR,
            DireccionTrafico.HACIA
        );

        sistemaEvento.ejecutarEvento(eventos[0]);
 
        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true);
    });

    test("Verificación de ejecución de evento Exitoso: Conexión VPN", () => {
        eventos = [
            new EventoComponent(
                "conexion vpn",
                TipoEvento.CONEXION_VPN,
                1,
                "establecer conexion vpn",
                1,
                {
                    gateway: {
                        lanLocal: "LAN1",
                        hostLan: "Computadora Jacob",
                        proteccion: TipoProteccionVPN.EA,
                        dominioRemoto: "Dominio Lisa",
                        hostRemoto: "Computadora Lisa"
                    },
                    cliente: {
                        proteccion: TipoProteccionVPN.EA,
                        dominioRemoto: "Dominio Jacob",
                        hostRemoto: "Computadora Jacob"
                    }
                }
            ),
        ];

        fases = [
            new FaseComponent(
              1,
              "Fase 1: Prueba",
              "Prueba",
              true,
              false,
              [ 
                {
                  descripcion: "conexion vpn",
                  completado: false,
                },
              ],
            )
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;

        // Simulamos la adición de perfiles de Cliente VPN (PC de Lisa) y VPN Gateway (dispositivo VPN en el lado de Jacob)
        redController.agregarPerfilClienteVPN(
            entidadDispLisa,
            {
                proteccion: TipoProteccionVPN.EA,
                dominioRemoto: "Dominio Jacob",
                hostRemoto: "Computadora Jacob"
            } as PerfilClienteVPN
        );

        redController.agregarPerfilVPNGateway(
            entidadVpnGateway, 
            {
                lanLocal: "LAN1",
                hostLan: "Computadora Jacob",
                proteccion: TipoProteccionVPN.EA,
                dominioRemoto: "Dominio Lisa",
                hostRemoto: "Computadora Lisa" 
            } as PerfilVPNGateway
        );

        sistemaEvento.ejecutarEvento(eventos[0]);

        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true);
    });

    describe("Verificación de ejecución de evento Fallido: Conexión VPN", () => {

        beforeEach(() => {
            eventos = [
                new EventoComponent(
                    "conexion vpn",
                    TipoEvento.CONEXION_VPN,
                    1,
                    "establecer conexion vpn",
                    1,
                    {
                        gateway: {
                            lanLocal: "LAN1",
                            hostLan: "Computadora Jacob",
                            proteccion: TipoProteccionVPN.EA,
                            dominioRemoto: "Dominio Lisa",
                            hostRemoto: "Computadora Lisa"
                        },
                        cliente: {
                            proteccion: TipoProteccionVPN.EA,
                            dominioRemoto: "Dominio Jacob",
                            hostRemoto: "Computadora Jacob"
                        }
                    }
                ),
            ];

            fases = [
                new FaseComponent(
                  1,
                  "Fase 1: Prueba",
                  "Prueba",
                  true,
                  false,
                  [ 
                    {
                      descripcion: "conexion vpn",
                      completado: false,
                    },
                  ],
                )
            ];

            sistemaFase.eventosEscenario = eventos;

            em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;

        });

        it("debe rechazar la conexión si el cliente no tiene perfiles definidos", () => {
            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Conexión VPN rechazada: No existen perfiles de conexión VPN definidos en Computadora Lisa.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("debe rechazar la conexión si el cliente no tiene definido el perfil esperado", () => {
            redController.agregarPerfilClienteVPN(
                entidadDispLisa,
                {
                    proteccion: TipoProteccionVPN.B,
                    dominioRemoto: "Dominio Jacob",
                    hostRemoto: "Computadora Jacob"
                } as PerfilClienteVPN
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Conexión VPN rechazada: Computadora Lisa no cuenta con un permiso para establecer una conexión VPN con Computadora Jacob.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("debe rechazar la conexión si el gateway no tiene perfiles definidos", () => {
            redController.agregarPerfilClienteVPN(
                entidadDispLisa,
                {
                    proteccion: TipoProteccionVPN.EA,
                    dominioRemoto: "Dominio Jacob",
                    hostRemoto: "Computadora Jacob"
                } as PerfilClienteVPN
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Conexión VPN rechazada: No existen perfiles de conexión VPN definidos en vpnGateway.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("debe rechazar la conexión si el gateway no tiene definido el perfil esperado", () => {
            redController.agregarPerfilClienteVPN(
                entidadDispLisa,
                {
                    proteccion: TipoProteccionVPN.EA,
                    dominioRemoto: "Dominio Jacob",
                    hostRemoto: "Computadora Jacob"
                } as PerfilClienteVPN
            );

            redController.agregarPerfilVPNGateway(
                entidadVpnGateway, 
                {
                    lanLocal: "LAN1",
                    hostLan: "Computadora Jacob",
                    proteccion: TipoProteccionVPN.B,
                    dominioRemoto: "Dominio Lisa",
                    hostRemoto: "Computadora Lisa" 
                } as PerfilVPNGateway
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Conexión VPN rechazada: vpnGateway no cuenta con un permiso para permitir una conexión VPN entre Computadora Lisa y Computadora Jacob.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("debe rechazar la conexión si un firewall del cliente tiene bloqueada la salida de conexiones VPN, DESDE su Red Interna", () => {
            redController.agregarPerfilClienteVPN(
                entidadDispLisa,
                {
                    proteccion: TipoProteccionVPN.EA,
                    dominioRemoto: "Dominio Jacob",
                    hostRemoto: "Computadora Jacob"
                } as PerfilClienteVPN
            );

            redController.agregarPerfilVPNGateway(
                entidadVpnGateway, 
                {
                    lanLocal: "LAN1",
                    hostLan: "Computadora Jacob",
                    proteccion: TipoProteccionVPN.EA,
                    dominioRemoto: "Dominio Lisa",
                    hostRemoto: "Computadora Lisa" 
                } as PerfilVPNGateway
            );

            redController.agregarReglaFirewall(
                entidadRouterLisa,
                entidadRedLisa,
                TipoProtocolo.VPN_GATEWAY,
                AccionFirewall.DENEGAR,
                DireccionTrafico.DESDE
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Conexión VPN rechazada: un firewall de Computadora Lisa tiene bloqueada la salida de conexiones VPN.");

            expect(logResultanteDeRechazo).toBeDefined();
        });

        it("debe rechazar la conexión si un firewall del cliente tiene bloqueada la salida de conexiones VPN, HACIA el Internet", () => {
            redController.agregarPerfilClienteVPN(
                entidadDispLisa,
                {
                    proteccion: TipoProteccionVPN.EA,
                    dominioRemoto: "Dominio Jacob",
                    hostRemoto: "Computadora Jacob"
                } as PerfilClienteVPN
            );

            redController.agregarPerfilVPNGateway(
                entidadVpnGateway, 
                {
                    lanLocal: "LAN1",
                    hostLan: "Computadora Jacob",
                    proteccion: TipoProteccionVPN.EA,
                    dominioRemoto: "Dominio Lisa",
                    hostRemoto: "Computadora Lisa" 
                } as PerfilVPNGateway
            );

            redController.agregarReglaFirewall(
                entidadRouterLisa,
                entidadRedInternet,
                TipoProtocolo.VPN_GATEWAY,
                AccionFirewall.DENEGAR,
                DireccionTrafico.HACIA
            );

            sistemaEvento.ejecutarEvento(eventos[0]);

            const logsEscenario = em.getComponentes(entidadEscenario)?.get(EscenarioComponent)?.logsGenerales;
            const logResultanteDeRechazo = logsEscenario?.find((log) => log.mensaje == "Conexión VPN rechazada: un firewall de Computadora Lisa tiene bloqueada la salida de conexiones VPN.");

            expect(logResultanteDeRechazo).toBeDefined();
        });
    });

    test("Verificación de ejecución de evento Exitoso: Verificación de Acción de jugador", () => {
        eventos = [
            new EventoComponent(
                "verificación de acción",
                TipoEvento.VERIFICACION_ACCION_JUGADOR,
                1,
                "verificación de acción de jugador",
                1,
                {
                    // El evento de VERIFICACION_ACCION_JUGADOR debe definir los parámetros a evaluar igual 
                    // al formato de un registro del registro de acciones del ECSManager; es decir: accion,
                    // objeto, tiempo y val. El tiempo es opcional al igual que val, pero en val se pueden definir 
                    // más parámetros según la acción y/u objeto que se quiera evaluar. Por ejemplo, en este caso se 
                    // quiere verificar que el jugador ha ejecutado una aplicación en la simulación, y en val se le pasa
                    // el nombre de la aplicación. Por lo cual, en val se definirá según sea el caso, dando más flexibilidad
                    // para el uso de este evento. De igual forma, dependiendo de la acción y/u objeto a verificar, puede ser
                    // necesario colocar un endpoint específico en el frontend para registrar la acción. 
                    accion: AccionesRealizables.EJECUTAR,
                    objeto: ObjetosManejables.APLICACION,
                    val: {
                        nombreAplicacion: APPS[0].nombre
                    }
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion: "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "verificación de acción",
                  completado: false,
                },
              ],
            }
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases; 

        // Simulamos la acción de que el jugador ha ejecutado la aplicación
        em.registrarAccion(
            AccionesRealizables.EJECUTAR,
            ObjetosManejables.APLICACION,
            undefined,
            { 
                nombreAplicacion: APPS[0].nombre
            }
        );

        sistemaEvento.ejecutarEvento(eventos[0]);

        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true);
    });

    test("Verificación de ejecución de evento Exitoso: Fase Completada", () => {
        eventos = [
            new EventoComponent(
                "verificación de acción",
                TipoEvento.VERIFICACION_ACCION_JUGADOR,
                1,
                "verificación de acción de jugador",
                1,
                {
                    accion: AccionesRealizables.EJECUTAR,
                    objeto: ObjetosManejables.APLICACION,
                    val: {
                        nombreAplicacion: APPS[0].nombre
                    }
                }
            ),
            new EventoComponent(
                "completación de fase",
                TipoEvento.COMPLETACION_FASE, // Para este evento no se necesita de info adicional, ya que solo es una señal de que, al ejecutarse este evento, se completa la fase actual
                12,
                "completación de una fase",
                1
            ),
        ];

        fases = [
            new FaseComponent(
              1,
              "Fase 1: Prueba",
              "Prueba",
              true,
              false,
              [ // Para el evento de tipo COMPLETACION_FASE, no se necesita definirlo en los objetivos de las fases 
                {
                    descripcion: "verificación de acción",
                    completado: false
                },
              ],
            ),
            new FaseComponent(
              2,
              "Fase 2: Prueba 2",
              "Prueba 2",
              false,
              false,
              [],
            )
        ];

        sistemaFase.eventosEscenario = eventos;

        // em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.eventos = eventos;  
        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;  

        escenarioController = EscenarioController.getInstance(em.getComponentes(entidadEscenario)?.get(EscenarioComponent), em); 
        escenarioController.iniciarEscuchaDeEventos();

        const fasesAntesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;

        // Se verifica que las fases estén con sus valores por defecto
        expect(fasesAntesDeEjecutarEvento[0].completada).toBe(false);
        expect(fasesAntesDeEjecutarEvento[0].faseActual).toBe(true);
        expect(fasesAntesDeEjecutarEvento[1].faseActual).toBe(false);

        // Simulamos la acción para el primer evento
        em.registrarAccion(
            AccionesRealizables.EJECUTAR,
            ObjetosManejables.APLICACION,
            undefined,
            { 
                nombreAplicacion: APPS[0].nombre
            }
        );

        // Ejecución del primer evento
        sistemaEvento.ejecutarEvento(eventos[0]);
        // Ejecución del segundo evento (Completación de fase)
        sistemaEvento.ejecutarEvento(eventos[1]);

        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;

        // Ahora se espera que la primera fase esté completada y que ya no sea la fase actual; por lo que la segunda fase es la que debe ser la actual
        expect(fasesDespuesDeEjecutarEvento[0].completada).toBe(true);
        expect(fasesDespuesDeEjecutarEvento[0].faseActual).toBe(false);
        expect(fasesDespuesDeEjecutarEvento[1].faseActual).toBe(true);

        EscenarioController.reset();
    });

    test("Verificación de ejecución de evento Exitoso: Escenario Completado", () => {
        eventos = [ 
            new EventoComponent(
                "completación de escenario",
                TipoEvento.COMPLETACION_ESCENARIO, // Para este evento no se necesita de info adicional, ya que solo es una señal de que, al ejecutarse, se completa el escenario
                1,
                "completación del escenario",
                1
            ),
        ];

        sistemaFase.eventosEscenario = eventos;

        escenarioController = EscenarioController.getInstance(em.getComponentes(entidadEscenario)?.get(EscenarioComponent), em); 
        escenarioController.iniciarEscuchaDeEventos();
        escenarioController.ejecutarTiempo();
        escenarioController.iniciarTiempo();

        expect(em.getSistema(SistemaTiempo)?.intervalo).not.toBeNull();

        sistemaEvento.ejecutarEvento(eventos[0]);

        // Al completar el escenario, se espera que el tiempo se haya destruido por completo
        expect(em.getSistema(SistemaTiempo)?.intervalo).toBeNull();

        EscenarioController.reset();
    });
});
