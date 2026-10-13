/**
 * PRNG determinista (mulberry32) y helpers de muestreo.
 *
 * Pensado para decorado generado en el frontend: dada una misma semilla siempre
 * produce la misma secuencia, de modo que la colocación de props sea estable
 * entre renders y solo cambie si cambia el dato que sembró la semilla (p. ej. el
 * id de la oficina). No usa Math.random, así que nunca "salta" en cada frame.
 */

/** Generador mulberry32: rápido, sin estado global y reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mezcla un entero pequeño y secuencial (ids 1, 2, 3…) en una semilla bien
 * distribuida, para que oficinas contiguas no produzcan secuencias parecidas.
 */
export const seedFromId = (id: number): number =>
  Math.imul(id ^ 0x9e3779b9, 0x85ebca6b) >>> 0;

/** Entero uniforme en [min, max] (ambos inclusive). */
export const rngInt = (rng: () => number, min: number, max: number): number =>
  min + Math.floor(rng() * (max - min + 1));

/** Real uniforme en [min, max). */
export const rngRange = (rng: () => number, min: number, max: number): number =>
  min + rng() * (max - min);

/** Elemento uniforme de un array no vacío. */
export const pick = <T>(rng: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)];
