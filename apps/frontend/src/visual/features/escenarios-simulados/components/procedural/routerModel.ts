import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Construye un modelo 3D procedural de un router/cablemódem realista pero ligero,
 * inspirado en un equipo tipo Cisco DPC3825: chasis plano y ancho de dos tonos
 * (carcasa satinada + bisel frontal brillante), esquinas redondeadas, rejillas de
 * ventilación en la tapa, línea cromada frontal, hilera de LEDs y antenas.
 *
 * Pensado para PCs de bajo rendimiento:
 * - Geometrías y materiales se reutilizan entre mallas repetidas (rejillas, LEDs, pies).
 * - Pocos segmentos en cilindros/esferas y bordes redondeados con segments=2.
 *
 * El origen está centrado en XZ y la base apoya en y=0, para que el sistema de
 * alturas (DISPOSITIVO_HEIGHTS) lo posicione igual que un glTF. El frente (LEDs)
 * mira hacia +Z.
 */

// --- Materiales compartidos ---

// Carcasa superior: negro satinado.
const matCarcasa = new MeshStandardMaterial({
  color: "#1c1f24",
  roughness: 0.5,
  metalness: 0.3,
});

// Bisel/base frontal: negro brillante (plástico glossy).
const matBisel = new MeshStandardMaterial({
  color: "#141619",
  roughness: 0.22,
  metalness: 0.5,
});

// Rejillas de ventilación: casi negro mate (lectura de hendidura).
const matRejilla = new MeshStandardMaterial({
  color: "#0a0b0d",
  roughness: 0.85,
  metalness: 0.1,
});

// Línea de acento cromada.
const matCromo = new MeshStandardMaterial({
  color: "#c2c6cc",
  roughness: 0.18,
  metalness: 0.95,
});

// Antenas: negro brillante.
const matAntena = new MeshStandardMaterial({
  color: "#16181c",
  roughness: 0.35,
  metalness: 0.4,
});

// LED verde encendido (emisivo, no necesita luces).
const matLed = new MeshStandardMaterial({
  color: "#3bdc5a",
  emissive: "#2fcf4d",
  emissiveIntensity: 1,
  roughness: 0.3,
  metalness: 0,
});

// --- Geometrías compartidas (se reutilizan entre mallas iguales) ---

const geoRejilla = new BoxGeometry(0.0045, 0.01, 0.16);
const geoLed = new BoxGeometry(0.006, 0.006, 0.005);
const geoPie = new RoundedBoxGeometry(0.012, 0.026, 0.06, 2, 0.004);

// Altura de la cara superior de la carcasa (referencia para tapa y antenas).
const TAPA_Y = 0.06;

/**
 * Crea un grupo de rejillas de ventilación (líneas paralelas) centrado en `centroX`.
 */
const crearRejillas = (centroX: number, cantidad: number): Group => {
  const grupo = new Group();
  const espaciado = 0.011;
  const inicio = -((cantidad - 1) * espaciado) / 2;
  for (let i = 0; i < cantidad; i++) {
    // Sobresalen apenas de la tapa para evitar z-fighting con la cara superior.
    const slot = new Mesh(geoRejilla, matRejilla);
    slot.position.set(centroX + inicio + i * espaciado, TAPA_Y - 0.0035, 0);
    grupo.add(slot);
  }
  return grupo;
};

/**
 * Crea una antena (base articulada + mástil + punta redondeada) inclinada hacia afuera.
 */
const crearAntena = (x: number, inclinacion: number): Group => {
  const antena = new Group();

  // Articulación horizontal en la base.
  const base = new Mesh(new CylinderGeometry(0.012, 0.012, 0.022, 10), matAntena);
  base.rotation.z = Math.PI / 2;

  const altura = 0.16;
  const mastil = new Mesh(
    new CylinderGeometry(0.0075, 0.009, altura, 10),
    matAntena
  );
  mastil.position.y = altura / 2 + 0.012;

  const punta = new Mesh(new SphereGeometry(0.011, 8, 6), matAntena);
  punta.position.y = altura + 0.012;

  antena.add(base, mastil, punta);
  antena.position.set(x, TAPA_Y, -0.1);
  antena.rotation.z = inclinacion;
  return antena;
};

export const buildRouterModel = (): Group => {
  const router = new Group();

  // Base/bisel frontal brillante (sobresale un poco = labio inferior).
  const bisel = new Mesh(
    new RoundedBoxGeometry(0.345, 0.018, 0.245, 2, 0.008),
    matBisel
  );
  bisel.position.y = 0.009;

  // Carcasa superior satinada, ligeramente más pequeña.
  const carcasa = new Mesh(
    new RoundedBoxGeometry(0.325, 0.042, 0.225, 2, 0.012),
    matCarcasa
  );
  carcasa.position.y = 0.039;

  router.add(bisel, carcasa);

  // Dos grupos de rejillas de ventilación en la tapa (lados izquierdo y derecho),
  // dejando una franja lisa al centro.
  router.add(crearRejillas(-0.085, 7));
  router.add(crearRejillas(0.085, 7));

  // Línea de acento cromada en la junta tapa/bisel, al frente.
  const cromo = new Mesh(new BoxGeometry(0.3, 0.004, 0.006), matCromo);
  cromo.position.set(0, 0.02, 0.121);
  router.add(cromo);

  // Hilera de LEDs verdes en el frente del bisel.
  const numLeds = 8;
  const espacioLed = 0.02;
  const inicioLed = -((numLeds - 1) * espacioLed) / 2;
  for (let i = 0; i < numLeds; i++) {
    const led = new Mesh(geoLed, matLed);
    led.position.set(inicioLed + i * espacioLed, 0.009, 0.124);
    router.add(led);
  }

  // Pies/aletas laterales (característicos), uno a cada lado.
  for (const lado of [-1, 1]) {
    const pie = new Mesh(geoPie, matBisel);
    pie.position.set(lado * 0.172, 0.013, 0);
    router.add(pie);
  }

  // Dos antenas traseras inclinadas en direcciones opuestas.
  router.add(crearAntena(-0.12, 0.12));
  router.add(crearAntena(0.12, -0.12));

  return router;
};
