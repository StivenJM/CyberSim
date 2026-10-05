/**
 * Convierte segundos a formato "HH:MM:SS".
 *
 * @param totalSeconds número de segundos (puede ser float; si es negativo se preserva el signo)
 * @returns string en formato "HH:MM:SS" (horas puede tener más de 2 dígitos si corresponde)
 */
export function formatearTiempo(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || isNaN(totalSeconds)) {
    throw new TypeError("totalSeconds debe ser un número finito");
  }

  const sign = totalSeconds < 0 ? "-" : "";
  const absSeconds = Math.floor(Math.abs(totalSeconds));

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    const hh = String(hours).padStart(2, "0");
    return `${sign}${hh}:${mm}:${ss}`;
  }

  return `${sign}${mm}:${ss}`;
}
