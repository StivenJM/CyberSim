import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Construye un modelo 3D procedural de un puesto de oficina: escritorio moderno
 * (tablero + patas + cajonera) y una silla de oficina ergonómica.
 *
 * El tablero queda a y=TABLERO_Y (0.71), igual que MUEBLE_SURFACE_HEIGHTS.MESA,
 * para que los dispositivos (workstation) se apoyen encima.
 *
 * Pensado para PCs de bajo rendimiento: pocas mallas, geometrías/materiales
 * compartidos y bordes redondeados con segments bajos. El frente (donde está la
 * silla) mira hacia -Z en el espacio local del modelo.
 */

// Altura de la superficie del tablero.
const TABLERO_Y = 0.71;
const ANCHO = 1.5; // eje X (lado largo)
const FONDO = 0.75; // eje Z

// --- Materiales compartidos ---

const matTablero = new MeshStandardMaterial({
  color: "#3a3f46",
  roughness: 0.6,
  metalness: 0.2,
});

const matMetal = new MeshStandardMaterial({
  color: "#1c1f24",
  roughness: 0.45,
  metalness: 0.6,
});

const matCajonera = new MeshStandardMaterial({
  color: "#2f343b",
  roughness: 0.6,
  metalness: 0.25,
});

const matTirador = new MeshStandardMaterial({
  color: "#b9bdc4",
  roughness: 0.25,
  metalness: 0.9,
});

// Tapizado de la silla (tela mate).
const matTela = new MeshStandardMaterial({
  color: "#26292f",
  roughness: 0.9,
  metalness: 0,
});

// Plástico/base de la silla.
const matBase = new MeshStandardMaterial({
  color: "#15171b",
  roughness: 0.5,
  metalness: 0.4,
});

// Geometrías compartidas.
const geoPata = new BoxGeometry(0.08, 0.67, 0.08);
const geoCajon = new BoxGeometry(0.32, 0.17, 0.02);
const geoTirador = new BoxGeometry(0.12, 0.012, 0.02);

/**
 * Construye una silla de oficina (asiento, respaldo, brazos, columna y base de
 * 5 patas con ruedas). Mira hacia +Z (de frente al escritorio).
 */
const buildSilla = (): Group => {
  const silla = new Group();

  const asientoY = 0.46;

  // Asiento.
  const asiento = new Mesh(
    new RoundedBoxGeometry(0.46, 0.08, 0.46, 3, 0.03),
    matTela
  );
  asiento.position.set(0, asientoY, 0);
  silla.add(asiento);

  // Respaldo, ligeramente reclinado hacia atrás (-Z).
  const respaldo = new Mesh(
    new RoundedBoxGeometry(0.42, 0.5, 0.07, 3, 0.03),
    matTela
  );
  respaldo.position.set(0, asientoY + 0.28, -0.21);
  respaldo.rotation.x = -0.12;
  silla.add(respaldo);

  // Apoyabrazos.
  for (const lado of [-1, 1]) {
    const brazo = new Mesh(new RoundedBoxGeometry(0.05, 0.04, 0.28, 2, 0.02), matBase);
    brazo.position.set(lado * 0.255, asientoY + 0.13, 0.02);
    silla.add(brazo);

    const soporteBrazo = new Mesh(new BoxGeometry(0.03, 0.13, 0.03), matBase);
    soporteBrazo.position.set(lado * 0.255, asientoY + 0.06, 0.05);
    silla.add(soporteBrazo);
  }

  // Columna de gas.
  const columna = new Mesh(new CylinderGeometry(0.028, 0.032, 0.34, 12), matBase);
  columna.position.y = asientoY - 0.21;
  silla.add(columna);

  // Base de 5 patas con ruedas.
  const hub = new Mesh(new CylinderGeometry(0.05, 0.05, 0.05, 12), matBase);
  hub.position.y = 0.07;
  silla.add(hub);

  const radio = 0.26;
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const px = Math.cos(ang) * radio;
    const pz = Math.sin(ang) * radio;

    const pata = new Mesh(new BoxGeometry(0.26, 0.025, 0.04), matBase);
    pata.position.set(px / 2, 0.05, pz / 2);
    pata.rotation.y = -ang;
    silla.add(pata);

    const rueda = new Mesh(new CylinderGeometry(0.03, 0.03, 0.025, 10), matBase);
    rueda.rotation.x = Math.PI / 2;
    rueda.position.set(px, 0.03, pz);
    silla.add(rueda);
  }

  return silla;
};

export const buildMesaModel = (): Group => {
  const mesa = new Group();

  // Tablero.
  const tablero = new Mesh(
    new RoundedBoxGeometry(ANCHO, 0.04, FONDO, 4, 0.012),
    matTablero
  );
  tablero.position.y = TABLERO_Y - 0.02;
  mesa.add(tablero);

  // Patas metálicas en el lado izquierdo (el derecho lo sostiene la cajonera).
  for (const z of [-0.32, 0.32]) {
    const pata = new Mesh(geoPata, matMetal);
    pata.position.set(-0.68, 0.335, z);
    mesa.add(pata);
  }

  // Panel modesty trasero.
  const panel = new Mesh(new BoxGeometry(1.4, 0.28, 0.025), matMetal);
  panel.position.set(0, 0.52, 0.34);
  mesa.add(panel);

  // Cajonera (lado derecho).
  const cajonera = new Mesh(
    new RoundedBoxGeometry(0.36, 0.64, 0.64, 2, 0.01),
    matCajonera
  );
  cajonera.position.set(0.52, 0.35, 0); // tapa a ~0.67, toca el tablero
  mesa.add(cajonera);

  // Frentes de cajón + tiradores (cara frontal, hacia -Z).
  for (let i = 0; i < 3; i++) {
    const y = 0.2 + i * 0.2;

    const cajon = new Mesh(geoCajon, matCajonera);
    cajon.position.set(0.52, y, -0.33);
    mesa.add(cajon);

    const tirador = new Mesh(geoTirador, matTirador);
    tirador.position.set(0.52, y + 0.05, -0.345);
    mesa.add(tirador);
  }

  // Silla de oficina, frente al escritorio (lado -Z), mirando hacia el tablero.
  const silla = buildSilla();
  silla.position.set(0, 0, -0.72);
  mesa.add(silla);

  return mesa;
};
