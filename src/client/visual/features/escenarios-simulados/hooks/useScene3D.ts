import { useState, useEffect } from "react";

/**
 * Hook personalizado para gestionar el estado de carga de modelos 3D
 */
export const useModel3DLoader = (modelPath: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Simular verificación de que el modelo existe
    const checkModel = async () => {
      try {
        // Aquí podrías agregar lógica adicional de precarga
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    checkModel();
  }, [modelPath]);

  return { isLoading, error };
};

/**
 * Hook para gestionar la configuración de controles de cámara
 */
export const useCameraControls = (
  initialConfig?: Partial<Record<string, unknown>>
) => {
  const [config, setConfig] = useState({
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
    autoRotate: false,
    ...initialConfig,
  });

  const updateConfig = (newConfig: Partial<typeof config>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return { config, updateConfig };
};
