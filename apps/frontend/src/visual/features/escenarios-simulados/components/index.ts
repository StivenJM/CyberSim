export {
	DEFAULT_CONTROLS_CONFIG,
	DEFAULT_ENVIRONMENT_CONFIG,
	DEFAULT_LIGHT_CONFIG,
	DEFAULT_MODEL_CONFIG,
} from '../config/scene3DConfig'
export { useCameraControls, useModel3DLoader } from '../hooks/useScene3D'
export type {
	CameraConfig,
	ControlsConfig,
	EnvironmentConfig,
	LightConfig,
	ModelConfig,
} from '../types/Scene3DTypes'
export { default as CameraControls } from './CameraControls'
export { default as Controles3D } from './Controles3D'
export { default as Environment } from './Environment'
export { default as Escena3D } from './Escena3D'
export { default as Lights } from './Lights'
export { default as ModalResultadoFase } from './ModalResultadoFase'
export { default as Model3D } from './Model3D'
export { preloadModel } from './Model3DUtils'
export { default as Scene3DCanvas } from './Scene3DCanvas'
