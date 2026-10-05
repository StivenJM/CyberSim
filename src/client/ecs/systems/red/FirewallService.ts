import { RouterComponent, DispositivoComponent } from "../../components";
import { DireccionTrafico, AccionFirewall } from "../../../shared/types/FirewallTypes";
import type { TipoProtocolo } from "../../../shared/types/TrafficEnums";
import type { ConectividadService } from "./ConectividadService";
import type { Entidad } from "../../core";
import type { ECSManager } from "../../core/ECSManager";

/**
 * Servicio para validar tráfico a través del firewall
 * Valida basándose en bloqueosFirewall: Map<Entidad, Reglas[]>
 * donde la Entidad es la red
 */
export class FirewallService {
  constructor(
    private conectividadService: ConectividadService,
    private ecsManager: ECSManager
  ) {}

  /**
   * Valida si el tráfico pasa los firewalls de todos los routers en la ruta
   *
   * LÓGICA DEL FIREWALL:
   * - Si configuras "internet ENTRANTE bloqueado" → bloqueas tráfico que VIENE DE internet
   * - Si configuras "internet SALIENTE bloqueado" → bloqueas tráfico que VA HACIA internet
   * - Si configuras "lan1 ENTRANTE bloqueado" → bloqueas tráfico que VIENE DE lan1
   * - Si configuras "lan1 SALIENTE bloqueado" → bloqueas tráfico que VA HACIA lan1
   */
  validarFirewall(
    entidadOrigen: Entidad,
    entidadDestino: Entidad,
    protocolo: TipoProtocolo
  ): { permitido: boolean; entidadRouter?: Entidad } {
    const rutaRoutersEntidades = this.conectividadService.obtenerRutaRouters(
      entidadOrigen,
      entidadDestino
    );

    if (rutaRoutersEntidades === null) {
      return { permitido: false };
    }

    if (rutaRoutersEntidades.length === 0) {
      return { permitido: true };
    }

    // Obtener las redes de origen y destino
    const redesOrigen =
      this.conectividadService["obtenerRedesDelDispositivo"](entidadOrigen);
    const redesDestino =
      this.conectividadService["obtenerRedesDelDispositivo"](entidadDestino);

    // 2. Iterar sobre cada router en la ruta
    for (let i = 0; i < rutaRoutersEntidades.length; i++) {
      const entidadRouterActual = rutaRoutersEntidades[i];

      const routerContainer =
        this.ecsManager.getComponentes(entidadRouterActual);
      const routerComponente = routerContainer?.get(RouterComponent);
      const dispositivoComponente = routerContainer?.get(DispositivoComponent);

      if (!routerComponente || !dispositivoComponente) continue;

      // 3. Determinar desde qué red viene el tráfico y hacia qué red va
      let redDesdeViene: Entidad[] = []; // Red desde donde viene el tráfico
      let redHaciaVa: Entidad[] = []; // Red hacia donde va el tráfico

      if (i === 0) {
        // Primer router: viene desde la red de origen
        redDesdeViene = redesOrigen;
        // Va hacia las otras redes del router (no origen)
        redHaciaVa = dispositivoComponente.redes.filter(
          (r) => !redesOrigen.includes(r)
        );
      } else if (i === rutaRoutersEntidades.length - 1) {
        // Último router: va hacia la red de destino
        redHaciaVa = redesDestino;
        // Viene desde las otras redes del router (no destino)
        redDesdeViene = dispositivoComponente.redes.filter(
          (r) => !redesDestino.includes(r)
        );
      } else {
        // Routers intermedios: determinar entrada/salida basándose en router anterior
        const entidadRouterAnterior = rutaRoutersEntidades[i - 1];
        const routerAnterior = this.ecsManager
          .getComponentes(entidadRouterAnterior)
          ?.get(DispositivoComponent);

        if (routerAnterior) {
          // Encuentra la red compartida con el router anterior (por donde viene)
          redDesdeViene = dispositivoComponente.redes.filter((r) =>
            routerAnterior.redes.includes(r)
          );
          // Las otras redes son hacia donde va
          redHaciaVa = dispositivoComponente.redes.filter(
            (r) => !redDesdeViene.includes(r)
          );
        } else {
          // Si no hay router anterior, evaluar todas las redes
          redDesdeViene = dispositivoComponente.redes;
          redHaciaVa = dispositivoComponente.redes;
        }
      }

      // 4. Verificar reglas ENTRANTES en las redes desde donde VIENE el tráfico
      // Si la red tiene "ENTRANTE bloqueado" = bloquea lo que viene de esa red
      const permitidoDesdeOrigen = this.evaluarFirewallDeRouter(
        routerComponente,
        redDesdeViene,
        protocolo,
        DireccionTrafico.DESDE
      );

      if (!permitidoDesdeOrigen) {
        return { permitido: false, entidadRouter: entidadRouterActual };
      }

      // 5. Verificar reglas SALIENTES en las redes hacia donde VA el tráfico
      // Si la red tiene "SALIENTE bloqueado" = bloquea lo que va hacia esa red
      const permitidoHaciaDestino = this.evaluarFirewallDeRouter(
        routerComponente,
        redHaciaVa,
        protocolo,
        DireccionTrafico.HACIA
      );

      if (!permitidoHaciaDestino) {
        return { permitido: false, entidadRouter: entidadRouterActual };
      }
    }

    // 6. Todos los routers permiten el tráfico
    return { permitido: true };
  }

  /**
   * Evalúa el firewall de un router para las redes especificadas
   * Retorna false si alguna regla DENIEGA el tráfico
   * Retorna true si no hay reglas o si alguna regla PERMITE el tráfico
   */
  private evaluarFirewallDeRouter(
    router: RouterComponent,
    redes: Entidad[],
    protocolo: TipoProtocolo,
    direccionTrafico: DireccionTrafico
  ): boolean {
    // Revisar si hay reglas de bloqueo para alguna de las redes
    for (const red of redes) {
      const reglasRed = router.bloqueosFirewall.get(red);

      if (!reglasRed || reglasRed.length === 0) {
        // No hay reglas para esta red, continuar con la siguiente
        continue;
      }

      // Buscar reglas que apliquen al protocolo y dirección
      for (const regla of reglasRed) {
        if (regla.protocolo !== protocolo) {
          continue;
        }

        // Verificar si la dirección coincide
        const direccionCoincide =
          regla.direccion === direccionTrafico ||
          regla.direccion === DireccionTrafico.AMBAS ||
          direccionTrafico === DireccionTrafico.AMBAS;

        if (direccionCoincide) {
          // Si hay una regla que aplica, usar su acción
          const permitir = regla.accion === AccionFirewall.PERMITIR;
          return permitir;
        }
      }
    }
    // Si no hay reglas específicas que apliquen, permitir por defecto
    return true;
  }
}
