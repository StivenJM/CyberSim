import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Mesa de reunión procedural: tablero alargado con base central y sillas a ambos
 * lados. Pensada para salas de reuniones decorativas. Low-poly: geometrías y
 * materiales compartidos. Origen centrado en XZ, base en y=0; el lado largo va
 * sobre el eje X.
 */

const LARGO = 2.6; // X
const ANCHO = 1.1; // Z
const TABLERO_Y = 0.74;

const matTablero = new MeshStandardMaterial({ color: "#6b5640", roughness: 0.5, metalness: 0.1 });
const matMetal = new MeshStandardMaterial({ color: "#2b2f35", roughness: 0.4, metalness: 0.7 });
const matTela = new MeshStandardMaterial({ color: "#34495e", roughness: 0.9, metalness: 0 });

const geoAsiento = new RoundedBoxGeometry(0.42, 0.07, 0.42, 2, 0.02);
const geoRespaldo = new RoundedBoxGeometry(0.4, 0.42, 0.06, 2, 0.02);
const geoPataSilla = new BoxGeometry(0.04, 0.45, 0.04);

const buildSilla = (): Group => {
  const s = new Group();
  const asiento = new Mesh(geoAsiento, matTela);
  asiento.position.y = 0.45;
  s.add(asiento);
  const respaldo = new Mesh(geoRespaldo, matTela);
  respaldo.position.set(0, 0.68, -0.18);
  s.add(respaldo);
  for (const dx of [-0.17, 0.17]) for (const dz of [-0.17, 0.17]) {
    const p = new Mesh(geoPataSilla, matMetal);
    p.position.set(dx, 0.225, dz);
    s.add(p);
  }
  return s;
};

export const buildMeetingTableModel = (): Group => {
  const g = new Group();

  // Tablero.
  const tablero = new Mesh(new RoundedBoxGeometry(LARGO, 0.06, ANCHO, 4, 0.03), matTablero);
  tablero.position.y = TABLERO_Y;
  g.add(tablero);

  // Dos bases tipo trineo.
  for (const x of [-LARGO / 2 + 0.4, LARGO / 2 - 0.4]) {
    const col = new Mesh(new BoxGeometry(0.1, TABLERO_Y - 0.06, 0.1), matMetal);
    col.position.set(x, (TABLERO_Y - 0.06) / 2, 0);
    g.add(col);
    const pie = new Mesh(new BoxGeometry(0.12, 0.05, ANCHO - 0.2), matMetal);
    pie.position.set(x, 0.025, 0);
    g.add(pie);
  }

  // Sillas: 3 por lado largo, mirando al centro.
  const n = 3;
  for (let i = 0; i < n; i++) {
    const x = -LARGO / 2 + LARGO * ((i + 1) / (n + 1));
    const frente = buildSilla();           // lado +Z (mira hacia -Z, al centro)
    frente.position.set(x, 0, ANCHO / 2 + 0.35);
    frente.rotation.y = Math.PI;
    g.add(frente);
    const atras = buildSilla();            // lado -Z (mira hacia +Z)
    atras.position.set(x, 0, -ANCHO / 2 - 0.35);
    g.add(atras);
  }

  return g;
};
