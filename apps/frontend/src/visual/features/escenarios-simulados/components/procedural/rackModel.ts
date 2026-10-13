import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Construye un modelo 3D procedural de un gabinete/rack de red de pie, realista
 * pero ligero: gabinete metálico oscuro alto (más que una mesa), con plinto,
 * puerta frontal ventilada, manija, LED de estado y tapa superior donde se apoya
 * el equipo (router/switch/VPN).
 *
 * La tapa queda a y=TOPE_Y; los dispositivos de red usan esa misma altura en
 * DISPOSITIVO_HEIGHTS para apoyarse encima.
 *
 * Pensado para PCs de bajo rendimiento: pocas mallas, geometrías/materiales
 * compartidos y bordes redondeados con segments=2. El frente (puerta) mira hacia +Z.
 */

// Altura de la tapa (donde se apoya el dispositivo). Más alto que una mesa (~0.71).
export const RACK_TOPE_Y = 1.1;
const ANCHO = 0.6;
const PROF = 0.55;
const FRENTE_Z = PROF / 2; // 0.275

// --- Materiales compartidos ---

const matCuerpo = new MeshStandardMaterial({
  color: "#23262b",
  roughness: 0.5,
  metalness: 0.45,
});

const matBase = new MeshStandardMaterial({
  color: "#16181c",
  roughness: 0.4,
  metalness: 0.5,
});

const matTapa = new MeshStandardMaterial({
  color: "#2b2f35",
  roughness: 0.45,
  metalness: 0.4,
});

// Puerta frontal: negro brillante.
const matPuerta = new MeshStandardMaterial({
  color: "#16181c",
  roughness: 0.25,
  metalness: 0.5,
});

// Ranuras de ventilación de la puerta (hendidura oscura).
const matRejilla = new MeshStandardMaterial({
  color: "#08090b",
  roughness: 0.85,
  metalness: 0.1,
});

// Manija metálica.
const matCromo = new MeshStandardMaterial({
  color: "#b9bdc4",
  roughness: 0.2,
  metalness: 0.95,
});

const matLed = new MeshStandardMaterial({
  color: "#3bdc5a",
  emissive: "#2fcf4d",
  emissiveIntensity: 1,
  roughness: 0.3,
  metalness: 0,
});

// Geometría compartida para las ranuras de la puerta.
const geoRejilla = new BoxGeometry(0.44, 0.006, 0.004);

export const buildRackModel = (): Group => {
  const rack = new Group();

  // Plinto (base de pie).
  const plinto = new Mesh(new RoundedBoxGeometry(0.56, 0.04, 0.51, 2, 0.006), matBase);
  plinto.position.y = 0.02;
  rack.add(plinto);

  // Cuerpo principal (se solapa un poco con plinto y tapa para evitar z-fighting).
  const cuerpo = new Mesh(
    new RoundedBoxGeometry(ANCHO, 1.04, PROF, 2, 0.014),
    matCuerpo
  );
  cuerpo.position.y = 0.555; // 0.035 .. 1.075
  rack.add(cuerpo);

  // Tapa superior: el dispositivo se apoya en y=RACK_TOPE_Y.
  const tapa = new Mesh(
    new RoundedBoxGeometry(ANCHO, 0.04, PROF, 2, 0.008),
    matTapa
  );
  tapa.position.y = RACK_TOPE_Y - 0.02; // 1.06 .. 1.10
  rack.add(tapa);

  // Puerta frontal (ligeramente sobresalida).
  const puerta = new Mesh(new BoxGeometry(0.5, 0.92, 0.012), matPuerta);
  puerta.position.set(0, 0.55, FRENTE_Z + 0.003);
  rack.add(puerta);

  // Ranuras de ventilación horizontales a lo largo de la puerta.
  const numRanuras = 16;
  const espacio = 0.05;
  const inicio = 0.55 - ((numRanuras - 1) * espacio) / 2;
  for (let i = 0; i < numRanuras; i++) {
    const ranura = new Mesh(geoRejilla, matRejilla);
    ranura.position.set(0, inicio + i * espacio, FRENTE_Z + 0.009);
    rack.add(ranura);
  }

  // Manija vertical en el borde derecho de la puerta.
  const manija = new Mesh(new BoxGeometry(0.01, 0.5, 0.016), matCromo);
  manija.position.set(0.25, 0.55, FRENTE_Z + 0.013);
  rack.add(manija);

  // LED de estado cerca de la parte superior de la puerta.
  const led = new Mesh(new BoxGeometry(0.012, 0.012, 0.005), matLed);
  led.position.set(-0.2, 0.97, FRENTE_Z + 0.013);
  rack.add(led);

  return rack;
};
