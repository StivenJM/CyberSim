import type {
  ModelConfig,
  LightConfig,
  ControlsConfig,
  EnvironmentConfig,
} from "../types/Scene3DTypes";

/**
 * Configuraciones por defecto para la escena 3D
 */

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  path: "/assets/models/computadora.gltf",
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
};

export const ESCRITORIO_CONFIG: ModelConfig = {
  path: "/assets/models/escritorio.gltf",
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
};

export const DEFAULT_LIGHT_CONFIG: LightConfig = {
  // Ambiente base bajo: la luz principal (con sombras) y un ambiente extra
  // tematizado los aporta SceneDressing según el escenario.
  ambientIntensity: 0.3,
  directionalIntensity: 0.8,
  directionalPosition: [5, 5, 5],
  enableShadows: true,
};

export const DEFAULT_CONTROLS_CONFIG: ControlsConfig = {
  enableZoom: true,
  enablePan: true,
  enableRotate: true,
  autoRotate: false,
  autoRotateSpeed: 2,
  minDistance: 2,
  maxDistance: 25,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI / 2,
};

export const DEFAULT_ENVIRONMENT_CONFIG: EnvironmentConfig = {
  showGrid: false,
  showAxes: false,
  gridSize: 10,
  gridDivisions: 10,
};
