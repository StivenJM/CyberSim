import { Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Televisor de pared procedural (apagado): marco, pantalla negra mate y soporte
 * de pared. Low-poly; materiales compartidos. Pensado para colgarse en una pared
 * mirando al interior de la sala.
 *
 * Origen en el CENTRO de la cara trasera (punto de montaje): la pantalla mira a
 * +Z y el cuerpo se proyecta hacia +Z. Al colocarlo, ubicar el origen contra la
 * pared a la altura de montaje deseada.
 */

const ANCHO = 1.4; // X (16:9 aprox)
const ALTO = 0.82; // Y
const PROF_MARCO = 0.05; // Z

const matMarco = new MeshStandardMaterial({ color: "#1a1c20", roughness: 0.55, metalness: 0.25 });
// Pantalla apagada: negro azulado muy oscuro, algo reflectante (vidrio).
const matPantalla = new MeshStandardMaterial({ color: "#0a0c10", roughness: 0.18, metalness: 0.5 });
const matSoporte = new MeshStandardMaterial({ color: "#2a2c30", roughness: 0.7, metalness: 0.3 });

export const buildTvModel = (): Group => {
  const g = new Group();

  // Soporte/placa de pared (detrás del marco, pegado a la pared en z≈0).
  const soporte = new Mesh(new RoundedBoxGeometry(0.34, 0.34, 0.03, 2, 0.01), matSoporte);
  soporte.position.set(0, 0, 0.015);
  g.add(soporte);

  // Marco/bisel del televisor, separado de la pared por el soporte.
  const marco = new Mesh(new RoundedBoxGeometry(ANCHO, ALTO, PROF_MARCO, 3, 0.015), matMarco);
  marco.position.set(0, 0, 0.04 + PROF_MARCO / 2);
  g.add(marco);

  // Pantalla (apagada), ligeramente embutida al frente del marco.
  const pantalla = new Mesh(
    new RoundedBoxGeometry(ANCHO - 0.08, ALTO - 0.08, 0.01, 2, 0.006),
    matPantalla,
  );
  pantalla.position.set(0, 0, 0.04 + PROF_MARCO - 0.004);
  g.add(pantalla);

  return g;
};
