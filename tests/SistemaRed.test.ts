import { describe, test, expect, beforeEach } from "vitest";
import { ECSManager, Entidad } from "../src/client/ecs/core";
import { SistemaRed } from "../src/client/ecs/systems";
import {
  EstadoAtaqueDispositivo,
  TipoActivo,
  TipoDispositivo,
  TipoProteccionVPN,
} from "../src/client/shared/types/DeviceEnums";
import {
  ActivoComponent,
  DispositivoComponent,
  RouterComponent,
  RedComponent,
  ClienteVPNComponent,
  VPNGatewayComponent,
} from "../src/client/ecs/components";
import { TipoProtocolo } from "../src/client/shared/types/TrafficEnums";
import { FirewallBuilder } from "../src/client/ecs/utils/FirewallBuilder";
import { PerfilClienteVPN, PerfilVPNGateway } from "../src/client/shared/types/EscenarioTypes";

describe("SistemaRed", () => {
  let em: ECSManager;
  let sistemaRed: SistemaRed;
  let entidadDisp1: Entidad;
  let entidadDisp2: Entidad;
  let entidadRouter: Entidad;
  let entidadRed1: Entidad;
  let entidadVPNGateway: Entidad;

  beforeEach(() => {
    em = new ECSManager();
    sistemaRed = new SistemaRed();
    em.agregarSistema(sistemaRed);

    const nombreDisp1 = "dispo1";
    entidadDisp1 = em.agregarEntidad();
    em.agregarComponente(
      entidadDisp1,
      new DispositivoComponent(
        nombreDisp1,
        "so",
        "hw",
        TipoDispositivo.WORKSTATION,
        EstadoAtaqueDispositivo.NORMAL,
        "",
        "",
        ""
      )
    );
    const activoComponente = new ActivoComponent();
    activoComponente.activos.push({
      nombre: "Activo1",
      contenido: "Infor importante",
      tipo: TipoActivo.DOCUMENTO
    });
    em.agregarComponente(entidadDisp1, activoComponente);
    em.agregarComponente(entidadDisp1, new ClienteVPNComponent());

    entidadVPNGateway = em.agregarEntidad();
    em.agregarComponente(entidadVPNGateway, new VPNGatewayComponent());

    const nombreDisp2 = "dispo2";
    entidadDisp2 = em.agregarEntidad();
    em.agregarComponente(
      entidadDisp2,
      new DispositivoComponent(
        nombreDisp2,
        "so",
        "hw",
        TipoDispositivo.WORKSTATION,
        EstadoAtaqueDispositivo.NORMAL,
        "",
        "",
        ""
      )
    );
    const activoComponente2 = new ActivoComponent(); // El segundo dispositivo no tiene activos
    em.agregarComponente(entidadDisp2, activoComponente2);

    entidadRouter = em.agregarEntidad();
    em.agregarComponente(
      entidadRouter,
      new DispositivoComponent(
        "router1",
        "Cisco",
        "hw",
        TipoDispositivo.ROUTER,
        EstadoAtaqueDispositivo.NORMAL,
        "",
        "",
        ""
      )
    );

    entidadRed1 = em.agregarEntidad();
    em.agregarComponente(entidadRed1, new RedComponent("LAN1", "#00DD00"));

    const firewallConfig = new FirewallBuilder().build();
    em.agregarComponente(entidadRouter, new RouterComponent(firewallConfig));

    sistemaRed.asignarRed(entidadDisp1, entidadRed1);
    sistemaRed.asignarRed(entidadDisp2, entidadRed1);
    sistemaRed.asignarRed(entidadRouter, entidadRed1);
    sistemaRed.asignarRed(entidadVPNGateway, entidadRed1);
  });

  test("se pueden enviar activos entre dispositivos de la misma red", () => {
    const activosDisp1 = em.getComponentes(entidadDisp1)!.get(ActivoComponent)!.activos;
    const activosDisp2 = em.getComponentes(entidadDisp2)!.get(ActivoComponent)!.activos;

    sistemaRed.enviarTrafico(
      entidadDisp1,
      entidadDisp2,
      TipoProtocolo.FTP,
      activosDisp1[0].nombre
    );

    expect(activosDisp2.includes(activosDisp1[0])).toBe(true);
  });

  test("se pueden remover redes de dispositivos", () => {
      const redesDisp1 = em.getComponentes(entidadDisp1)!.get(DispositivoComponent)!.redes;

      expect(redesDisp1.includes(entidadRed1)).toBe(true);

      sistemaRed.removerRed(entidadDisp1, entidadRed1);

      const redesDisp1Despues = em.getComponentes(entidadDisp1)!.get(DispositivoComponent)!.redes;

      expect(redesDisp1Despues.includes(entidadRed1)).toBe(false);
  });

  test("se pueden agregar y remover perfiles de clientes VPN", () => {
    const perfilClienteVPN = {
        proteccion: TipoProteccionVPN.A,
        dominioRemoto: "off-site",
        hostRemoto: "PC Lisa"
    } as PerfilClienteVPN;

    const perfilesClienteVPNAntes = em.getComponentes(entidadDisp1)!.get(ClienteVPNComponent)!.perfilesClienteVPN;

    expect(perfilesClienteVPNAntes.includes(perfilClienteVPN)).toBe(false);

    sistemaRed.agregarPerfilClienteVPN(entidadDisp1, perfilClienteVPN);

    const perfilesClienteVPNDespues1 = em.getComponentes(entidadDisp1)!.get(ClienteVPNComponent)!.perfilesClienteVPN;

    expect(perfilesClienteVPNDespues1.includes(perfilClienteVPN)).toBe(true);

    sistemaRed.removerPerfilClienteVPN(entidadDisp1, 0);

    const perfilesClienteVPNDespues2 = em.getComponentes(entidadDisp1)!.get(ClienteVPNComponent)!.perfilesClienteVPN;

    expect(perfilesClienteVPNDespues2.includes(perfilClienteVPN)).toBe(false);

  });

  test("se pueden agregar y remover perfiles de VPN Gateway", () => {
    const perfilVPNGateway = {
        lanLocal: "LA1",
        hostLan: "PC Jacob",
        proteccion: TipoProteccionVPN.A,
        dominioRemoto: "off-site",
        hostRemoto: "PC Lisa"
    } as PerfilVPNGateway;

    const perfilesVPNGatewayAntes = em.getComponentes(entidadVPNGateway)!.get(VPNGatewayComponent)!.perfilesVPNGateway;

    expect(perfilesVPNGatewayAntes.includes(perfilVPNGateway)).toBe(false);

    sistemaRed.agregarPerfilVPNGateway(entidadVPNGateway, perfilVPNGateway);

    const perfilesVPNGatewayDespues1 = em.getComponentes(entidadVPNGateway)!.get(VPNGatewayComponent)!.perfilesVPNGateway;

    expect(perfilesVPNGatewayDespues1.includes(perfilVPNGateway)).toBe(true);

    sistemaRed.removerPerfilVPNGateway(entidadVPNGateway, 0);

    const perfilesVPNGatewayDespues2 = em.getComponentes(entidadVPNGateway)!.get(VPNGatewayComponent)!.perfilesVPNGateway;

    expect(perfilesVPNGatewayDespues2.includes(perfilVPNGateway)).toBe(false);

  }); 
});
