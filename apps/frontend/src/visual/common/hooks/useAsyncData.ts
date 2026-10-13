import { useCallback, useEffect, useState, type DependencyList } from "react";
import { useAsyncState } from "./useAsyncState";

export interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para data reactiva: ejecuta `fetcher` al montar y cuando cambian `deps`,
 * exponiendo `{ data, loading, error, refetch }`.
 *
 * Si `fetcher` devuelve `null` (ej. falta un id aún), no actualiza `data`.
 * Para operaciones imperativas usar `useAsyncState`.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T | null>,
  deps: DependencyList = []
): UseAsyncDataReturn<T> {
  const { loading, error, runAsync } = useAsyncState();
  const [data, setData] = useState<T | null>(null);

   
  const refetch = useCallback(async () => {
    const result = await runAsync(fetcher);
    if (result !== null) setData(result);
  }, [runAsync, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
