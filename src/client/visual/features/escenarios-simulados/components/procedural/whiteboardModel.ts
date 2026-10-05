import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Pizarra/rotafolio procedural de pie: panel blanco con marco y dos patas en A.
 * Para aulas y salas de reunión. Low-poly, materiales compartidos. Origen
 * centrado en XZ, base en y=0. La superficie de escritura mira hacia +Z.
 */

const ANCHO = 1.5; // X
const PANEL_Y = 1.35; // centro del panel

const matMarco = new MeshStandardMaterial({ color: "#9aa0a6", roughness: 0.4, metalness: 0.6 });
const matPanel = new MeshStandardMaterial({ color: "#f3f5f7", roughness: 0.35, metalness: 0 });
const matPata = new MeshStandardMaterial({ color: "#6b7075", roughness: 0.4, metalness: 0.6 });

export const buildWhiteboardModel = (): Group => {
  const g = new Group();

  // Marco.
  const marco = new Mesh(new RoundedBoxGeometry(ANCHO, 0.95, 0.05, 2, 0.02), matMarco);
  marco.position.set(0, PANEL_Y, 0);
  g.add(marco);

  // Panel de escritura (ligeramente al frente).
  const panel = new Mesh(new BoxGeometry(ANCHO - 0.1, 0.85, 0.02), matPanel);
  panel.position.set(0, PANEL_Y, 0.03);
  g.add(panel);

  // Bandeja de marcadores.
  const bandeja = new Mesh(new BoxGeometry(ANCHO - 0.2, 0.04, 0.08), matMarco);
  bandeja.position.set(0, PANEL_Y - 0.5, 0.05);
  g.add(bandeja);

  // Patas en A (dos a cada lado).
  for (const s of [-1, 1]) {
    const pata = new Mesh(new BoxGeometry(0.04, PANEL_Y - 0.45, 0.04), matPata);
    pata.position.set(s * (ANCHO / 2 - 0.12), (PANEL_Y - 0.45) / 2, -0.06);
    pata.rotation.x = 0.12;
    g.add(pata);
  }
  // Travesaño entre patas.
  const cruz = new Mesh(new BoxGeometry(ANCHO - 0.2, 0.04, 0.04), matPata);
  cruz.position.set(0, 0.5, -0.1);
  g.add(cruz);

  return g;
};
