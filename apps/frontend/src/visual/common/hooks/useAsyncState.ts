import { useCallback, useState } from "react";

export interface UseAsyncStateReturn {
  loading: boolean;
  error: string | null;
  runAsync: <T>(fn: () => Promise<T>) => Promise<T | null>;
  setError: (error: string | null) => void;
}

/**
 * Primitivo compartido para operaciones async imperativas.
 *
 * `runAsync(fn)` ejecuta `fn`, maneja `loading` y captura cualquier excepción
 * exponiéndola como `error`. Devuelve el resultado de `fn` o `null` si falló.
 *
 * Pensado para hooks de mutación (login, crear grupo, generar feedback, etc.)
 * que antes duplicaban el patrón `setLoading / try / catch / finally`.
 */
export function useAsyncState(): UseAsyncStateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAsync = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, runAsync, setError };
}
