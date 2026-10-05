import type { ECSManager } from "../../core/ECSManager";
import {
  RouterComponent,
  ZonaComponent,
  DispositivoComponent,
  VPNGatewayComponent,
} from "../../components";
import type { Entidad } from "../../core/Componente";

export class ConectividadService {
  constructor(private ecsManager: ECSManager) {}

  public obtenerRedesDeZona(zonaEntidad: Entidad): Entidad[] {
    const componentes = this.ecsManager
      .getComponentes(zonaEntidad)
      ?.get(ZonaComponent);
    return componentes ? componentes.redes : [];
  }

  private obtenerRedesDelDispositivo(entidadDispositivo: Entidad): Entidad[] {
    const disp = this.ecsManager
      .getComponentes(entidadDispositivo)
      ?.get(DispositivoComponent);
    return disp?.redes || [];
  }

  private compartanRed(entidadDisp1: Entidad, entidadDisp2: Entidad): boolean {
    const redesDisp1 = this.obtenerRedesDelDispositivo(entidadDisp1);
    const redesDisp2 = this.obtenerRedesDelDispositivo(entidadDisp2);

    // Verificar si comparten alguna red
    return redesDisp1.some((red1) => redesDisp2.includes(red1));
  }

  /**
   * Verifica si dos dispositivos están conectados (pueden comunicarse)
   * Nueva arquitectura: Los dispositivos tienen referencias a redes (DispositivoComponent.redes)
   *
   * Casos:
   * 1. Ambos en la misma red → Conectados
   * 2. Uno en red, otro externo + router con internet → Conectados
   * 3. Ambos en redes diferentes pero routers con internet → Conectados
   */
  estanConectados(entidadOrigen: Entidad, entidadDestino: Entidad): boolean {
    const redesOrigen = this.obtenerRedesDelDispositivo(entidadOrigen);
    const redesDestino = this.obtenerRedesDelDispositivo(entidadDestino);

    if (redesOrigen.length === 0 || redesDestino.length === 0) {
      return false;
    }

    // Caso 1: Si comparten alguna red, están directamente conectados
    if (this.compartanRed(entidadOrigen, entidadDestino)) {
      return true;
    }

    // Permitir tráfico entre distintas redes de misma zona a través de router
    const routersOrigen =
      this.buscarRoutersConectadoADispositivo(entidadOrigen);
    const routersDestino =
      this.buscarRoutersConectadoADispositivo(entidadDestino);
    // si uno de los dos no tiene routers conectados, no están conectados
    if (routersOrigen.length === 0 || routersDestino.length === 0) {
      return false;
    }

    // Verificar si hay algún router común entre ambos dispositivos
    if (
      routersOrigen.some((routerO) =>
        routersDestino.some((routerD) => routerO.entidad === routerD.entidad)
      )
    ) {
      return true;
    }

    const redesCola: Entidad[] = [...redesOrigen];
    const redesVisitadas = new Set<Entidad>(redesOrigen);

    let i = 0;
    while (i < redesCola.length) {
      const redActual = redesCola[i++];
      const routersEnRed = this.buscarRoutersEnRed(redActual);
      for (const routerEntidad of routersEnRed) {
        const redesDelRouter = this.obtenerRedesDelDispositivo(routerEntidad);
        for (const nuevaRed of redesDelRouter) {
          if (redesDestino.includes(nuevaRed)) {
            return true;
          }
          if (!redesVisitadas.has(nuevaRed)) {
            redesVisitadas.add(nuevaRed);
            redesCola.push(nuevaRed);
          }
        }
      }
    }
    return false;
  }

  buscarRoutersConectadoADispositivo(
    entidadDispositivo: Entidad
  ): Array<{ entidad: Entidad; redesEnComun: Entidad[] }> {
    const routersConectados: Array<{
      entidad: Entidad;
      redesEnComun: Entidad[];
    }> = [];
    const redesDelDispositivo =
      this.obtenerRedesDelDispositivo(entidadDispositivo);

    if (redesDelDispositivo.length === 0) {
      return [];
    }

    this.ecsManager.getEntidades().forEach((container, entidad) => {
      // Considerar tanto routers como VPN gateways como puntos de enrutamiento
      if (
        container.tiene(RouterComponent) ||
        container.tiene(VPNGatewayComponent)
      ) {
        const redesDelRouter = this.obtenerRedesDelDispositivo(entidad);
        // Verificar si el router/VPN tiene alguna red en común con el dispositivo
        const redesEnComun = redesDelDispositivo.filter((redId) =>
          redesDelRouter.includes(redId)
        );

        if (redesEnComun.length > 0) {
          routersConectados.push({ entidad, redesEnComun });
        }
      }
    });

    return routersConectados;
  }
  private buscarRoutersEnRed(redId: Entidad): Entidad[] {
    const routersEnRed: Entidad[] = [];

    this.ecsManager.getEntidades().forEach((container, entidad) => {
      // Considerar tanto routers como VPN gateways
      if (
        container.tiene(RouterComponent) ||
        container.tiene(VPNGatewayComponent)
      ) {
        // Obtener las redes de este router/VPN
        const redesDelRouter = this.obtenerRedesDelDispositivo(entidad);

        // Si el router está conectado a la red que buscamos, lo añadimos
        if (redesDelRouter.includes(redId)) {
          routersEnRed.push(entidad);
        }
      }
    });

    return routersEnRed;
  }

  /*buscarRouterConDispositivo(
    entidadDispositivo: Entidad
  ): { router: RouterComponent; zonaId: Entidad } | null {
    // 1. Obtener las redes del dispositivo
    const redesDelDispositivo =
      this.obtenerRedesDelDispositivo(entidadDispositivo);
    if (redesDelDispositivo.length === 0) return null;

    // 2. Encontrar la zona que contiene alguna de estas redes
    for (const [zonaEntidad, container] of this.ecsManager.getEntidades()) {
      const zona = container.get(ZonaComponent);
      if (!zona) continue;

      // Obtener las redes de esta zona usando SistemaRelaciones
      const redesZona = this.obtenerRedesDeZona(zonaEntidad);

      const zonaContieneDispositivo = redesZona.some((redId) =>
        redesDelDispositivo.includes(redId)
      );
      if (!zonaContieneDispositivo) continue;

      // 3. Buscar el router en esta zona DENTRO DE LA ZONA

      for (const [
        routerEntidad,
        routerContainer,
      ] of this.ecsManager.getEntidades()) {
        const router = routerContainer.get(RouterComponent);
        if (!router) continue;

        // Verificar si este router tiene redes de esta zona
        const redesRouter = this.obtenerRedesDelDispositivo(routerEntidad);
        const routerConectadoAlDispositivo = redesRouter.some((redRouterID) =>
          redesDelDispositivo.includes(redRouterID)
        );
        if (routerConectadoAlDispositivo) {
          return { router, zonaId: zonaEntidad };
        }
      }
    }

    return null;
  }*/

  /*obtenerRoutersDeRed(
    entidadDisp1: Entidad,
    entidadDisp2: Entidad
  ): RouterComponent[] {
    const routersAplicables: RouterComponent[] = [];

    if (this.compartanRed(entidadDisp1, entidadDisp2)) {
      const routerInfo = this.buscarRouterConDispositivo(entidadDisp1);
      if (routerInfo) {
        routersAplicables.push(routerInfo.router);
      }
      return routersAplicables;
    }

    const routerDisp1Info = this.buscarRouterConDispositivo(entidadDisp1);
    const routerDisp2Info = this.buscarRouterConDispositivo(entidadDisp2);

    if (routerDisp1Info) {
      routersAplicables.push(routerDisp1Info.router);
    }
    if (routerDisp2Info) {
      const esMismoRouter =
        routerDisp1Info && routerDisp1Info.router === routerDisp2Info.router;

      if (!esMismoRouter) {
        routersAplicables.push(routerDisp2Info.router);
      }
    }

    return routersAplicables;
  }*/

  obtenerRutaRouters(
    entidadOrigen: Entidad,
    entidadDestino: Entidad
  ): Entidad[] | null {
    const redesOrigen = this.obtenerRedesDelDispositivo(entidadOrigen);
    const redesDestino = this.obtenerRedesDelDispositivo(entidadDestino);

    if (redesOrigen.length === 0 || redesDestino.length === 0) {
      return null;
    }

    // Caso de la misma red (No hay routers intermedios, el tráfico es local)
    if (this.compartanRed(entidadOrigen, entidadDestino)) {
      return [];
    }

    // Mapa de Red -> { redPrevia, routerQueConecta } para reconstruir la ruta.
    const mapaRuta = new Map<
      Entidad,
      { redPrevia: Entidad | null; router: Entidad }
    >();
    const redesCola: Entidad[] = [...redesOrigen];
    const redesVisitadas = new Set<Entidad>(redesOrigen);

    // Inicializar el mapa para las redes de origen
    redesOrigen.forEach((red) =>
      mapaRuta.set(red, { redPrevia: null, router: -1 })
    ); // Usar -1 o null para router inicial

    while (redesCola.length > 0) {
      const redActual = redesCola.shift()!;

      const routersEnRed = this.buscarRoutersEnRed(redActual);

      for (const routerEntidad of routersEnRed) {
        const redesDelRouter = this.obtenerRedesDelDispositivo(routerEntidad);

        for (const nuevaRed of redesDelRouter) {
          if (redesDestino.includes(nuevaRed)) {
            // Registrar la conexión final
            mapaRuta.set(nuevaRed, {
              redPrevia: redActual,
              router: routerEntidad,
            });
            return this.reconstruirRutaRouters(entidadDestino, mapaRuta);
          }

          if (!redesVisitadas.has(nuevaRed)) {
            redesVisitadas.add(nuevaRed);
            mapaRuta.set(nuevaRed, {
              redPrevia: redActual,
              router: routerEntidad,
            });
            redesCola.push(nuevaRed);
          }
        }
      }
    }

    return null; // No hay ruta
  }
  reconstruirRutaRouters(
    entidadDestino: Entidad,
    mapaRuta: Map<Entidad, { redPrevia: Entidad | null; router: Entidad }>
  ): Entidad[] {
    const redesDestino = this.obtenerRedesDelDispositivo(entidadDestino);

    // 1. Encontrar el punto de partida en el mapa (cualquier red destino que esté en el mapa)
    let redActual = redesDestino.find((red) => mapaRuta.has(red))!;
    const rutaRouters: Entidad[] = [];
    const routersAgregados = new Set<Entidad>(); // Para evitar duplicados (p. ej., R1 -> Internet -> R1)

    // 2. Reconstruir la ruta hacia atrás
    while (mapaRuta.get(redActual)?.redPrevia !== null) {
      const info = mapaRuta.get(redActual)!;

      // Agregar el router que llevó a esta red
      if (!routersAgregados.has(info.router)) {
        rutaRouters.unshift(info.router); // Añadir al inicio para mantener el orden (Origen -> Destino)
        routersAgregados.add(info.router);
      }

      redActual = info.redPrevia!;
    }

    return rutaRouters;
  }
}
