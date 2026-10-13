import { useEffect } from "react";

interface UseZonaKeyboardNavOptions {
  /** Navegar a la zona anterior (ArrowLeft). */
  onPrev: () => void;
  /** Navegar a la siguiente zona (ArrowRight). */
  onNext: () => void;
  /** Desactiva el atajo (p. ej. mientras hay un overlay/modal abierto). */
  enabled?: boolean;
}

/**
 * Atajos de teclado para navegar entre zonas de la escena 3D:
 * ArrowLeft → zona anterior, ArrowRight → siguiente zona.
 *
 * Ignora el evento cuando el foco está en un campo de texto o cuando hay
 * modificadores (Ctrl/Cmd/Alt) para no pisar atajos del navegador.
 */
export function useZonaKeyboardNav({
  onPrev,
  onNext,
  enabled = true,
}: UseZonaKeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return;
      }

      e.preventDefault();
      if (e.key === "ArrowLeft") onPrev();
      else onNext();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext, enabled]);
}
