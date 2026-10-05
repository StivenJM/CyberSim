import { Mueble, TipoDispositivo } from "../../../../shared/types/DeviceEnums";
import { preloadModel } from "../components/Model3DUtils";
import { isProceduralPath } from "../components/procedural/proceduralModels";
import { RACK_TOPE_Y } from "../components/procedural/rackModel";

/**
 * Configuración centralizada de modelos 3D y sus propiedades
 * Sigue el principio de Single Responsibility Pattern (SRP)
 */

/**
 * Mapea tipos de muebles a rutas de modelos 3D
 */
export const MUEBLE_MODELS: Record<string, string> = {
  [Mueble.MESA]: "procedural:mesa",
  [Mueble.RACK]: "procedural:rack",
};

/**
 * Mapea tipos de dispositivos a rutas de modelos 3D
 */
export const DISPOSITIVO_MODELS: Record<string, string> = {
  [TipoDispositivo.WORKSTATION]: "procedural:workstation",
  [TipoDispositivo.ROUTER]: "procedural:router",
  [TipoDispositivo.SWITCH]: "procedural:switch",
  [TipoDispositivo.VPN]: "procedural:switch",
};

/**
 * Precarga todos los modelos 3D para mejorar el rendimiento
 * Llamar esta función al inicio de la aplicación
 */
export const preloadAllModels = async () => {
  const allPaths = [
    ...Object.values(MUEBLE_MODELS),
    ...Object.values(DISPOSITIVO_MODELS),
  ].filter((path) => path && !isProceduralPath(path)); // Solo glTF (los procedurales no se precargan)

  // Precargar todos los modelos en paralelo
  await Promise.all(allPaths.map((path) => preloadModel(path)));
};

/**
 * Ajuste fino (eje Y) por tipo de dispositivo, SOBRE la superficie del mueble
 * en el que se apoya. Normalmente 0: los modelos tienen su base en y=0 y se
 * apoyan en la superficie del mueble (ver MUEBLE_SURFACE_HEIGHTS). La altura del
 * dispositivo la define el mueble, no su tipo, para no acoplar (un router puede
 * ir en mesa, rack o piso).
 */
export const DISPOSITIVO_HEIGHTS: Record<string, number> = {
  [TipoDispositivo.WORKSTATION]: 0,
  [TipoDispositivo.ROUTER]: 0,
  [TipoDispositivo.SWITCH]: 0,
  [TipoDispositivo.VPN]: 0,
};

/**
 * Altura (eje Y) de la base del modelo del mueble (apoya en el piso).
 */
export const MUEBLE_HEIGHTS: Record<string, number> = {
  [Mueble.MESA]: 0,
  [Mueble.RACK]: 0,
  [Mueble.LIBRE]: 0,
};

/**
 * Altura (eje Y) de la SUPERFICIE de cada mueble: dónde se apoyan los
 * dispositivos colocados sobre él. La mesa tiene su tablero a ~0.71 y el rack
 * (gabinete de pie) su tapa a RACK_TOPE_Y; "libre" es el piso.
 */
export const MUEBLE_SURFACE_HEIGHTS: Record<string, number> = {
  [Mueble.MESA]: 0.71,
  [Mueble.RACK]: RACK_TOPE_Y,
  [Mueble.LIBRE]: 0,
};

/**
 * Obtiene el modelo 3D para un tipo de mueble
 */
export const getMuebleModel = (tipo: string): string => {
  return MUEBLE_MODELS[tipo] || "";
};

export const getModelo = (objeto: unknown): string => {
  const o = objeto as { tipo?: string; mueble?: string };
  if (o.tipo && o.tipo in DISPOSITIVO_MODELS) {
    return getDispositivoModel(o.tipo);
  } else if (o.tipo === "espacio") {
    const mueble = o.mueble ?? "";
    return getMuebleModel(mueble);
  } else {
    return "";
  }
};

/**
 * Obtiene el modelo 3D para un tipo de dispositivo
 */
export const getDispositivoModel = (tipo: string): string => {
  return DISPOSITIVO_MODELS[tipo] || DISPOSITIVO_MODELS[TipoDispositivo.OTRO];
};

/**
 * Obtiene la altura (Y) para un tipo de dispositivo
 */
export const getDispositivoHeight = (tipo: string): number => {
  return DISPOSITIVO_HEIGHTS[tipo] ?? 0;
};

/**
 * Obtiene la altura (Y) de la superficie de un mueble (dónde se apoyan los
 * dispositivos colocados sobre él).
 */
export const getMuebleSurfaceHeight = (tipo: string): number => {
  return MUEBLE_SURFACE_HEIGHTS[tipo] ?? 0;
};

/**
 * Obtiene la altura (Y) para un tipo de mueble
 */
export const getMuebleHeight = (tipo: string): number => {
  return MUEBLE_HEIGHTS[tipo] ?? 0;
};
