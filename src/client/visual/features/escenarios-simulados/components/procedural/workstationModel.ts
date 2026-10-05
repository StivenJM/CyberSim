import {
  Box3,
  BoxGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Construye un modelo 3D procedural de una workstation de oficina completa y
 * detallada: monitor panorámico (panel + bisel fino + cuello + base), torre
 * mid-tower con frontal trabajado (botón de encendido con LED, puertos USB,
 * ranura óptica y rejilla de ventilación), teclado con teclas reales y ratón.
 *
 * Reemplaza al antiguo modelo glTF `computadora.gltf` con una versión más rica,
 * coherente con el resto de modelos procedurales (rack, router, switch…).
 *
 * Pensado para PCs de bajo rendimiento:
 * - Geometrías y materiales compartidos entre mallas repetidas.
 * - Las teclas del teclado son un único InstancedMesh (un solo draw call).
 * - Pocos segmentos en cilindros y bordes redondeados con segments bajos.
 *
 * El origen está centrado en XZ y todo apoya en y=0 (sobre el tablero de la
 * mesa, a y=0.71). El frente (pantalla, frontal de la torre, teclado) mira
 * hacia +Z, igual que el resto de modelos; proceduralModels aplica el offset
 * de orientación para alinearlo con la silla.
 */

// --- Materiales compartidos ---

// Carcasa principal: negro satinado (monitor, torre, ratón).
const matCarcasa = new MeshStandardMaterial({
  color: "#1c1f24",
  roughness: 0.5,
  metalness: 0.35,
});

// Plástico frontal/biseles: negro mate más oscuro.
const matBisel = new MeshStandardMaterial({
  color: "#141619",
  roughness: 0.4,
  metalness: 0.25,
});

// Frontal de la torre: negro glossy (panel acrílico).
const matFrontal = new MeshStandardMaterial({
  color: "#101216",
  roughness: 0.22,
  metalness: 0.5,
});

// Rejillas/ranuras: casi negro mate (lectura de hendidura).
const matRejilla = new MeshStandardMaterial({
  color: "#0a0b0d",
  roughness: 0.9,
  metalness: 0.1,
});

// Metal del cuello/base del monitor.
const matMetal = new MeshStandardMaterial({
  color: "#2a2e35",
  roughness: 0.4,
  metalness: 0.7,
});

// Línea/acento cromado.
const matCromo = new MeshStandardMaterial({
  color: "#c2c6cc",
  roughness: 0.18,
  metalness: 0.95,
});

// Pantalla apagada: negro con un acabado ligeramente reflectante (vidrio en reposo).
const matPantalla = new MeshStandardMaterial({
  color: "#070809",
  roughness: 0.25,
  metalness: 0.1,
});

// Teclas del teclado.
const matTecla = new MeshStandardMaterial({
  color: "#2a2e34",
  roughness: 0.7,
  metalness: 0.1,
});

// LED de encendido (azul cian, emisivo).
const matLed = new MeshStandardMaterial({
  color: "#4fd2ff",
  emissive: "#2bb6ff",
  emissiveIntensity: 2.2,
  roughness: 0.3,
  metalness: 0,
});

// --- Geometrías compartidas ---

const geoUsb = new BoxGeometry(0.022, 0.008, 0.004);
const geoPie = new CylinderGeometry(0.012, 0.012, 0.012, 8);

/**
 * Construye el monitor: bisel + panel emisivo (con barra de tareas), carcasa
 * trasera abultada, cuello y base. El conjunto apoya su base en y=0 y la
 * pantalla mira hacia +Z, con una ligera inclinación hacia atrás.
 */
const buildMonitor = (): Group => {
  const monitor = new Group();

  const W = 0.56; // ancho del panel
  const H = 0.34; // alto del panel
  const zBisel = -0.14; // el panel queda hacia el fondo

  // Conjunto pantalla (se inclina ligeramente hacia atrás como un grupo).
  const panel = new Group();

  // Bisel frontal (marco fino).
  const bisel = new Mesh(new RoundedBoxGeometry(W, H, 0.018, 2, 0.01), matBisel);
  panel.add(bisel);

  // Cara de la pantalla, apagada (sobresale apenas del bisel hacia +Z).
  const pantalla = new Mesh(new BoxGeometry(W - 0.04, H - 0.04, 0.004), matPantalla);
  pantalla.position.z = 0.011;
  panel.add(pantalla);

  // Carcasa trasera abultada.
  const trasera = new Mesh(
    new RoundedBoxGeometry(W - 0.12, H - 0.12, 0.05, 2, 0.02),
    matCarcasa
  );
  trasera.position.z = -0.03;
  panel.add(trasera);

  // LED de encendido en el borde inferior del bisel.
  const led = new Mesh(new BoxGeometry(0.012, 0.006, 0.005), matLed);
  led.position.set(W / 2 - 0.05, -H / 2 + 0.012, 0.012);
  panel.add(led);

  // Coloca el panel sobre el cuello e inclínalo hacia atrás.
  panel.position.set(0, 0.20 + H / 2, zBisel);
  panel.rotation.x = -0.07;
  monitor.add(panel);

  // Cuello del soporte.
  const cuello = new Mesh(new BoxGeometry(0.05, 0.20, 0.03), matMetal);
  cuello.position.set(0, 0.11, zBisel - 0.01);
  monitor.add(cuello);

  // Base plana del soporte.
  const base = new Mesh(
    new RoundedBoxGeometry(0.24, 0.014, 0.17, 2, 0.006),
    matMetal
  );
  base.position.set(0, 0.007, zBisel - 0.02);
  monitor.add(base);

  return monitor;
};

/**
 * Construye la torre (mid-tower) de pie sobre la mesa, con frontal detallado.
 * Base en y=0, frontal hacia +Z.
 */
const buildTorre = (): Group => {
  const torre = new Group();

  const W = 0.19; // ancho (X)
  const D = 0.45; // profundidad (Z)
  const Hc = 0.42; // alto
  const frenteZ = D / 2;

  // Cuerpo.
  const cuerpo = new Mesh(new RoundedBoxGeometry(W, Hc, D, 2, 0.01), matCarcasa);
  cuerpo.position.y = Hc / 2 + 0.012;
  torre.add(cuerpo);

  // Panel frontal glossy, ligeramente sobresalido.
  const frontal = new Mesh(new RoundedBoxGeometry(W - 0.02, Hc - 0.02, 0.012, 2, 0.006), matFrontal);
  frontal.position.set(0, Hc / 2 + 0.012, frenteZ);
  torre.add(frontal);

  const fz = frenteZ + 0.008; // plano de detalles, justo delante del frontal
  const yTop = Hc + 0.012;

  // Ranura de unidad óptica (parte alta).
  const optica = new Mesh(new BoxGeometry(W - 0.06, 0.014, 0.004), matRejilla);
  optica.position.set(0, yTop - 0.06, fz);
  torre.add(optica);

  // Botón de encendido + LED.
  const boton = new Mesh(new CylinderGeometry(0.012, 0.012, 0.006, 12), matBisel);
  boton.rotation.x = Math.PI / 2;
  boton.position.set(0, yTop - 0.11, fz);
  torre.add(boton);

  const led = new Mesh(new CylinderGeometry(0.004, 0.004, 0.006, 8), matLed);
  led.rotation.x = Math.PI / 2;
  led.position.set(0.05, yTop - 0.11, fz);
  torre.add(led);

  // Dos puertos USB.
  for (let i = 0; i < 2; i++) {
    const usb = new Mesh(geoUsb, matRejilla);
    usb.position.set(-0.04, yTop - 0.145 - i * 0.014, fz);
    torre.add(usb);
  }

  // Rejilla de ventilación inferior (líneas horizontales).
  for (let i = 0; i < 8; i++) {
    const slot = new Mesh(new BoxGeometry(W - 0.07, 0.006, 0.004), matRejilla);
    slot.position.set(0, 0.10 + i * 0.018, fz);
    torre.add(slot);
  }

  // Acento cromado horizontal bajo la unidad óptica.
  const cromo = new Mesh(new BoxGeometry(W - 0.05, 0.004, 0.005), matCromo);
  cromo.position.set(0, yTop - 0.075, fz);
  torre.add(cromo);

  // Patas.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const pie = new Mesh(geoPie, matBisel);
      pie.position.set(sx * (W / 2 - 0.02), 0.006, sz * (D / 2 - 0.04));
      torre.add(pie);
    }
  }

  return torre;
};

/**
 * Construye el teclado: base inclinada + rejilla de teclas (un único
 * InstancedMesh) + barra espaciadora. Apoya en y=0, mirando hacia +Z.
 */
const buildTeclado = (): Group => {
  const teclado = new Group();

  const W = 0.40;
  const D = 0.135;

  // Base.
  const base = new Mesh(new RoundedBoxGeometry(W, 0.016, D, 2, 0.006), matBisel);
  base.position.y = 0.008;
  teclado.add(base);

  // Rejilla de teclas como InstancedMesh (un solo draw call).
  const cols = 14;
  const rows = 5;
  const pitchX = 0.0255;
  const pitchZ = 0.02;
  const geoTecla = new RoundedBoxGeometry(0.019, 0.008, 0.015, 1, 0.003);
  const teclas = new InstancedMesh(geoTecla, matTecla, cols * rows);
  const dummy = new Object3D();
  const x0 = -((cols - 1) * pitchX) / 2;
  const z0 = -((rows - 1) * pitchZ) / 2 - 0.012; // deja sitio a la espaciadora al frente
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dummy.position.set(x0 + c * pitchX, 0.020, z0 + r * pitchZ);
      dummy.updateMatrix();
      teclas.setMatrixAt(idx++, dummy.matrix);
    }
  }
  teclas.instanceMatrix.needsUpdate = true;
  teclado.add(teclas);

  // Barra espaciadora al frente.
  const espacio = new Mesh(new RoundedBoxGeometry(0.16, 0.008, 0.015, 1, 0.003), matTecla);
  espacio.position.set(0, 0.020, D / 2 - 0.022);
  teclado.add(espacio);

  return teclado;
};

/**
 * Construye un ratón con cuerpo redondeado, rueda y línea de separación.
 * Apoya en y=0, frente (rueda) hacia +Z.
 */
const buildRaton = (): Group => {
  const raton = new Group();

  const cuerpo = new Mesh(new RoundedBoxGeometry(0.052, 0.026, 0.088, 3, 0.013), matCarcasa);
  cuerpo.position.y = 0.014;
  raton.add(cuerpo);

  // Rueda de desplazamiento.
  const rueda = new Mesh(new CylinderGeometry(0.006, 0.006, 0.008, 8), matBisel);
  rueda.rotation.z = Math.PI / 2;
  rueda.position.set(0, 0.028, 0.03);
  raton.add(rueda);

  // Línea de separación de botones.
  const linea = new Mesh(new BoxGeometry(0.001, 0.004, 0.04), matRejilla);
  linea.position.set(0, 0.027, 0.018);
  raton.add(linea);

  return raton;
};

export const buildWorkstationModel = (): Group => {
  const ws = new Group();

  const monitor = buildMonitor();
  ws.add(monitor);

  const torre = buildTorre();
  torre.position.set(0.42, 0, -0.06);
  ws.add(torre);

  const teclado = buildTeclado();
  teclado.position.set(-0.02, 0, 0.14);
  ws.add(teclado);

  const raton = buildRaton();
  raton.position.set(0.27, 0, 0.13);
  ws.add(raton);

  // Centra la huella XZ en el origen (torre y teclado están descentrados), para
  // que el conjunto quede balanceado sobre el tablero.
  const box = new Box3().setFromObject(ws);
  const offsetX = (box.min.x + box.max.x) / 2;
  const offsetZ = (box.min.z + box.max.z) / 2;
  for (const child of ws.children) {
    child.position.x -= offsetX;
    child.position.z -= offsetZ;
  }

  return ws;
};
