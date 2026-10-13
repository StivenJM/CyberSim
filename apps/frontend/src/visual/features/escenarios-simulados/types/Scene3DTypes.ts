/**
 * Tipos para la configuración de escenas 3D
 */

export interface CameraConfig {
  position: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

export interface LightConfig {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  enableShadows: boolean;
}

export interface ModelConfig {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number | [number, number, number];
}

export interface ControlsConfig {
  enableZoom: boolean;
  enablePan: boolean;
  enableRotate: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

export interface EnvironmentConfig {
  showGrid: boolean;
  showAxes: boolean;
  gridSize: number;
  gridDivisions: number;
}
