import { Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Sofá procedural de 3 plazas: base tapizada, respaldo con cojines, apoyabrazos
 * envolventes, cojines de asiento mullidos y patas. Para salas de estar / casa.
 * Low-poly con bordes redondeados; materiales compartidos.
 * Origen centrado en XZ, base en y=0. El frente (asiento) mira hacia +Z.
 */

const ANCHO = 1.9; // X
const FONDO = 0.9; // Z

const matTela = new MeshStandardMaterial({ color: "#6f7c8c", roughness: 0.95, metalness: 0 });
const matCojin = new MeshStandardMaterial({ color: "#8c98a6", roughness: 0.97, metalness: 0 });
const matPata = new MeshStandardMaterial({ color: "#3a2c22", roughness: 0.5, metalness: 0.25 });

// Geometría de las 3 plazas (compartida entre asiento y respaldo).
const PLAZAS = 2;
const HUECO_BRAZOS = 0.42; // espacio total ocupado por ambos apoyabrazos
const SEP = 0.015; // separación entre cojines
const ANCHO_COJIN = (ANCHO - HUECO_BRAZOS - SEP * (PLAZAS - 1)) / PLAZAS;
const X_COJIN = (i: number) => -ANCHO / 2 + HUECO_BRAZOS / 2 + ANCHO_COJIN / 2 + i * (ANCHO_COJIN + SEP);

export const buildSofaModel = (): Group => {
  const g = new Group();

  // Base/asiento estructural (plinto tapizado bajo los cojines).
  const base = new Mesh(new RoundedBoxGeometry(ANCHO, 0.32, FONDO, 4, 0.08), matTela);
  base.position.set(0, 0.3, 0);
  g.add(base);

  // Respaldo estructural (hacia -Z), más grueso y alto.
  const respaldo = new Mesh(new RoundedBoxGeometry(ANCHO, 0.62, 0.24, 4, 0.08), matTela);
  respaldo.position.set(0, 0.62, -FONDO / 2 + 0.12);
  g.add(respaldo);

  // Apoyabrazos envolventes (más altos que el asiento, redondeados).
  for (const s of [-1, 1]) {
    const brazo = new Mesh(new RoundedBoxGeometry(0.22, 0.42, FONDO, 4, 0.09), matTela);
    brazo.position.set(s * (ANCHO / 2 - 0.11), 0.5, 0);
    g.add(brazo);
  }

  // Cojines de asiento (mullidos, ligeramente desbordados al frente).
  for (let i = 0; i < PLAZAS; i++) {
    const cojin = new Mesh(new RoundedBoxGeometry(ANCHO_COJIN, 0.18, FONDO - 0.22, 4, 0.07), matCojin);
    cojin.position.set(X_COJIN(i), 0.55, 0.06);
    g.add(cojin);
  }

  // Cojines de respaldo (apoyados sobre el asiento, inclinados al frente).
  for (let i = 0; i < PLAZAS; i++) {
    const cojin = new Mesh(new RoundedBoxGeometry(ANCHO_COJIN, 0.42, 0.16, 4, 0.07), matCojin);
    cojin.position.set(X_COJIN(i), 0.74, -FONDO / 2 + 0.26);
    cojin.rotation.x = -0.12;
    g.add(cojin);
  }

  // Patas troncocónicas low-poly.
  for (const dx of [-ANCHO / 2 + 0.13, ANCHO / 2 - 0.13]) for (const dz of [-FONDO / 2 + 0.13, FONDO / 2 - 0.13]) {
    const pata = new Mesh(new RoundedBoxGeometry(0.08, 0.16, 0.08, 2, 0.025), matPata);
    pata.position.set(dx, 0.08, dz);
    g.add(pata);
  }

  return g;
};
