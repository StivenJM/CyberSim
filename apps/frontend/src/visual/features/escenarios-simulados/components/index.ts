export { default as Escena3D } from "./Escena3D";
export { default as Scene3DCanvas } from "./Scene3DCanvas";
export { default as Model3D } from "./Model3D";
export { preloadModel } from "./Model3DUtils";
export { default as CameraControls } from "./CameraControls";
export { default as Lights } from "./Lights";
export { default as Environment } from "./Environment";
export { default as Controles3D } from "./Controles3D";
export { default as ModalResultadoFase } from "./ModalResultadoFase";

export {
  DEFAULT_MODEL_CONFIG,
  DEFAULT_LIGHT_CONFIG,
  DEFAULT_CONTROLS_CONFIG,
  DEFAULT_ENVIRONMENT_CONFIG,
} from "../config/scene3DConfig";

export type {
  CameraConfig,
  LightConfig,
  ModelConfig,
  ControlsConfig,
  EnvironmentConfig,
} from "../types/Scene3DTypes";

export { useModel3DLoader, useCameraControls } from "../hooks/useScene3D";
