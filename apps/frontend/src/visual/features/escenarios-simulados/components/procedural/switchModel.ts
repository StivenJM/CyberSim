import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Construye un modelo 3D procedural de un switch realista pero ligero, inspirado
 * en un MikroTik CRS309-1G-8S+IN: carcasa blanca plana y ancha, hilera de 8
 * puertos SFP+ con sus LEDs, puerto RJ45 (PoE), consola DB9, botón de reset,
 * LEDs USER/PWR y disipador (aletas) en la parte trasera de la tapa.
 *
 * Pensado para PCs de bajo rendimiento:
 * - Geometrías y materiales se reutilizan entre mallas repetidas (puertos, LEDs, aletas).
 * - Solo primitivas simples y bordes redondeados con segments=2.
 *
 * El origen está centrado en XZ y la base apoya en y=0. El frente (puertos) mira hacia +Z.
 */

// --- Materiales compartidos ---

// Carcasa: metal pintado blanco.
const matCuerpo = new MeshStandardMaterial({
  color: "#e9eaec",
  roughness: 0.55,
  metalness: 0.25,
});

// Puertos: plástico/metal oscuro.
const matPuerto = new MeshStandardMaterial({
  color: "#26282c",
  roughness: 0.6,
  metalness: 0.4,
});

// Conectores metálicos (jaula SFP, consola DB9).
const matMetal = new MeshStandardMaterial({
  color: "#b9bdc4",
  roughness: 0.25,
  metalness: 0.9,
});

// Aletas del disipador (gris claro, ligeramente metálico).
const matAleta = new MeshStandardMaterial({
  color: "#d8dadd",
  roughness: 0.4,
  metalness: 0.5,
});

// Rejilla de ventilación frontal (oscura).
const matRejilla = new MeshStandardMaterial({
  color: "#3a3c40",
  roughness: 0.8,
  metalness: 0.2,
});

const matLedVerde = new MeshStandardMaterial({
  color: "#3bdc5a",
  emissive: "#2fcf4d",
  emissiveIntensity: 1,
  roughness: 0.3,
  metalness: 0,
});

const matLedAzul = new MeshStandardMaterial({
  color: "#4aa8ff",
  emissive: "#3a90ff",
  emissiveIntensity: 1,
  roughness: 0.3,
  metalness: 0,
});

// --- Geometrías compartidas ---

const geoSfp = new BoxGeometry(0.03, 0.018, 0.01);
const geoLed = new BoxGeometry(0.004, 0.004, 0.004);
const geoAleta = new BoxGeometry(0.004, 0.012, 0.05);

// Dimensiones del chasis.
const ANCHO = 0.44;
const ALTO = 0.045;
const PROF = 0.24;
const FRENTE_Z = PROF / 2; // 0.12

export const buildSwitchModel = (): Group => {
  const sw = new Group();

  // Chasis blanco plano con esquinas redondeadas.
  const chasis = new Mesh(
    new RoundedBoxGeometry(ANCHO, ALTO, PROF, 2, 0.006),
    matCuerpo
  );
  chasis.position.y = ALTO / 2;
  sw.add(chasis);

  // Hilera de 8 puertos SFP+ con un LED verde sobre cada uno.
  const numPuertos = 8;
  const espacio = 0.038;
  const centroPuertos = -0.06; // desplazados a la izquierda (deja sitio a RJ45/consola/LEDs)
  const inicio = centroPuertos - ((numPuertos - 1) * espacio) / 2;
  for (let i = 0; i < numPuertos; i++) {
    const x = inicio + i * espacio;

    const cage = new Mesh(geoSfp, matPuerto);
    cage.position.set(x, 0.014, FRENTE_Z - 0.002);
    sw.add(cage);

    const led = new Mesh(geoLed, matLedVerde);
    led.position.set(x, 0.03, FRENTE_Z + 0.002);
    sw.add(led);
  }

  // Rejilla de ventilación frontal sobre los puertos (franja oscura).
  const rejilla = new Mesh(
    new BoxGeometry(numPuertos * espacio, 0.006, 0.005),
    matRejilla
  );
  rejilla.position.set(centroPuertos, 0.038, FRENTE_Z + 0.0015);
  sw.add(rejilla);

  // Puerto RJ45 (PoE/BOOT) con LED.
  const rj45 = new Mesh(new BoxGeometry(0.028, 0.024, 0.012), matMetal);
  rj45.position.set(0.115, 0.016, FRENTE_Z - 0.003);
  sw.add(rj45);
  const ledRj45 = new Mesh(geoLed, matLedVerde);
  ledRj45.position.set(0.115, 0.031, FRENTE_Z + 0.002);
  sw.add(ledRj45);

  // Consola DB9 (conector metálico ancho).
  const consola = new Mesh(new BoxGeometry(0.032, 0.014, 0.012), matMetal);
  consola.position.set(0.158, 0.018, FRENTE_Z - 0.003);
  sw.add(consola);

  // Botón de reset + LEDs USER (verde) y PWR (azul).
  const reset = new Mesh(new BoxGeometry(0.005, 0.005, 0.005), matPuerto);
  reset.position.set(0.188, 0.022, FRENTE_Z + 0.001);
  sw.add(reset);

  const ledUser = new Mesh(geoLed, matLedVerde);
  ledUser.position.set(0.204, 0.026, FRENTE_Z + 0.002);
  sw.add(ledUser);

  const ledPwr = new Mesh(geoLed, matLedAzul);
  ledPwr.position.set(0.204, 0.016, FRENTE_Z + 0.002);
  sw.add(ledPwr);

  // Disipador: hilera de aletas en la parte trasera de la tapa.
  const numAletas = 18;
  const espacioAleta = 0.018;
  const inicioAleta = -((numAletas - 1) * espacioAleta) / 2;
  for (let i = 0; i < numAletas; i++) {
    // Embebidas un poco en la tapa para evitar z-fighting con la cara superior.
    const aleta = new Mesh(geoAleta, matAleta);
    aleta.position.set(inicioAleta + i * espacioAleta, ALTO + 0.001, -0.07);
    sw.add(aleta);
  }

  return sw;
};
