import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Construye un rack de servidores de centro de datos (estilo gabinete 42U):
 * alto y profundo, con paneles laterales, panel trasero, rejilla de techo y una
 * pila de unidades de servidor con tiras de LEDs de actividad (verde/azul/ámbar)
 * para que se lea como equipo encendido. Más alto y poblado que el rack de red
 * (rackModel), para llenar las salas técnicas y darles densidad real.
 *
 * Pensado para PCs de bajo rendimiento: geometrías y materiales compartidos entre
 * las unidades repetidas, primitivas simples y pocos segmentos. El frente (las
 * unidades) mira hacia +Z; la base apoya en y=0.
 */

export const SERVER_RACK_ALTO = 2.0;
const ANCHO = 0.6;
const PROF = 0.8;
const FRENTE_Z = PROF / 2;

// --- Materiales compartidos ---

const matFrame = new MeshStandardMaterial({ color: "#191b1f", roughness: 0.5, metalness: 0.6 });
const matSide = new MeshStandardMaterial({ color: "#202327", roughness: 0.55, metalness: 0.5 });
const matUnit = new MeshStandardMaterial({ color: "#141619", roughness: 0.6, metalness: 0.4 });
const matVent = new MeshStandardMaterial({ color: "#0a0b0d", roughness: 0.85, metalness: 0.1 });

const matLedGreen = new MeshStandardMaterial({ color: "#3bdc5a", emissive: "#2fcf4d", emissiveIntensity: 2.2, roughness: 0.3, metalness: 0 });
const matLedBlue = new MeshStandardMaterial({ color: "#4aa8ff", emissive: "#3a90ff", emissiveIntensity: 2.2, roughness: 0.3, metalness: 0 });
const matLedAmber = new MeshStandardMaterial({ color: "#ffb648", emissive: "#ff9f1a", emissiveIntensity: 2.0, roughness: 0.3, metalness: 0 });

// Tiras de LEDs por unidad: alterna color según el índice para un look multicolor.
const ledMats = [matLedGreen, matLedBlue, matLedGreen, matLedAmber];

// --- Geometrías compartidas ---

const geoUnit = new BoxGeometry(ANCHO - 0.08, 0.12, PROF - 0.12);
const geoStrip = new BoxGeometry(ANCHO - 0.24, 0.016, 0.006);

export const buildServerRackModel = (): Group => {
  const rack = new Group();

  // Plinto (base de pie).
  const plinto = new Mesh(new RoundedBoxGeometry(ANCHO, 0.06, PROF, 2, 0.008), matFrame);
  plinto.position.y = 0.03;
  rack.add(plinto);

  // Paneles laterales.
  for (const s of [-1, 1]) {
    const lado = new Mesh(new BoxGeometry(0.04, SERVER_RACK_ALTO, PROF), matSide);
    lado.position.set(s * (ANCHO / 2 - 0.02), SERVER_RACK_ALTO / 2, 0);
    rack.add(lado);
  }

  // Panel trasero.
  const trasero = new Mesh(new BoxGeometry(ANCHO, SERVER_RACK_ALTO, 0.03), matFrame);
  trasero.position.set(0, SERVER_RACK_ALTO / 2, -PROF / 2 + 0.015);
  rack.add(trasero);

  // Techo con rejilla de ventilación.
  const techo = new Mesh(new BoxGeometry(ANCHO, 0.06, PROF), matFrame);
  techo.position.y = SERVER_RACK_ALTO - 0.03;
  rack.add(techo);
  const rejTecho = new Mesh(new BoxGeometry(ANCHO - 0.12, 0.008, PROF - 0.22), matVent);
  rejTecho.position.y = SERVER_RACK_ALTO + 0.005;
  rack.add(rejTecho);

  // Pila de unidades de servidor, cada una con su tira de LEDs de actividad.
  // 2 mallas por unidad para mantener acotados los draw calls al apilar muchos
  // racks en un datacenter denso.
  const n = 8;
  const yBottom = 0.18;
  const yTop = SERVER_RACK_ALTO - 0.18;
  const gap = (yTop - yBottom) / (n - 1);
  for (let i = 0; i < n; i++) {
    const y = yBottom + i * gap;

    const unidad = new Mesh(geoUnit, matUnit);
    unidad.position.set(0, y, 0.02);
    rack.add(unidad);

    const tira = new Mesh(geoStrip, ledMats[i % ledMats.length]);
    tira.position.set(-0.02, y + 0.025, FRENTE_Z - 0.05);
    rack.add(tira);
  }

  return rack;
};
