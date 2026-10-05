import { Group } from "three";
import { buildRouterModel } from "./routerModel";
import { buildSwitchModel } from "./switchModel";
import { buildRackModel } from "./rackModel";
import { buildServerRackModel } from "./serverRackModel";
import { buildMesaModel } from "./mesaModel";
import { buildMeetingTableModel } from "./meetingTableModel";
import { buildSofaModel } from "./sofaModel";
import { buildTvModel } from "./tvModel";
import { buildWhiteboardModel } from "./whiteboardModel";
import { buildWorkstationModel } from "./workstationModel";

/**
 * Registro de modelos 3D procedurales (construidos por código en lugar de
 * cargarse desde un archivo glTF).
 *
 * En modelConfig las rutas procedurales usan el prefijo `procedural:` (por
 * ejemplo `procedural:router`), de modo que Model3D pueda distinguirlas de
 * las rutas glTF normales sin cambiar el flujo de ECSSceneRenderer.
 */

export const PROCEDURAL_PREFIX = "procedural:";

// Normaliza el frente de cada modelo a +Z (convención común). Todos se construyen
// ya con el frente a +Z salvo la mesa, cuyo frente (la silla) mira a -Z.
const OFFSET_FRENTE_Y: Record<string, number> = {
  mesa: Math.PI,
};

type ConstructorModelo = () => Group;

const builders: Record<string, ConstructorModelo> = {
  router: buildRouterModel,
  switch: buildSwitchModel,
  rack: buildRackModel,
  serverrack: buildServerRackModel,
  mesa: buildMesaModel,
  meetingtable: buildMeetingTableModel,
  sofa: buildSofaModel,
  tv: buildTvModel,
  whiteboard: buildWhiteboardModel,
  workstation: buildWorkstationModel,
};

// Caché del prototipo: cada modelo se construye una sola vez y luego Model3D
// lo clona por instancia (igual que hace con las escenas glTF).
const cache = new Map<string, Group>();

export const isProceduralPath = (path: string): boolean =>
  path.startsWith(PROCEDURAL_PREFIX);

/**
 * Devuelve el prototipo (Group) de un modelo procedural a partir de su ruta.
 */
export const getProceduralScene = (path: string): Group => {
  const key = path.slice(PROCEDURAL_PREFIX.length);

  let scene = cache.get(key);
  if (!scene) {
    const build = builders[key];
    if (!build) {
      throw new Error(`Modelo procedural desconocido: ${key}`);
    }
    scene = build();
    scene.rotation.y = OFFSET_FRENTE_Y[key] ?? 0;
    scene.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
    cache.set(key, scene);
  }
  return scene;
};
