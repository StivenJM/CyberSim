import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import type { FeedbackData } from '../types/feedback.types';

interface FeedbackStatusResponse {
  success: boolean;
  habilitado: boolean;
  intentos_actuales: number;
  intentos_al_generar: number | null;
  ultima_retroalimentacion: FeedbackData | null;
}

export function useFeedback(
  idEstudiante: number | null,
  slugEscenario: string | null
) {
  const [habilitado, setHabilitado] = useState(true);
  const [loading, setLoading] = useState(true);
  const [ultimaRetroalimentacion, setUltimaRetroalimentacion] = useState<FeedbackData | null>(null);

  const checkStatus = useCallback(async () => {
    if (!idEstudiante || !slugEscenario) {
      setHabilitado(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/feedback/check-status?id_estudiante=${idEstudiante}&slug_escenario=${slugEscenario}`
      );

      if (response.ok) {
        const data: FeedbackStatusResponse = await response.json();
        setHabilitado(data.habilitado);
        setUltimaRetroalimentacion(data.ultima_retroalimentacion || null);
      } else {
        setHabilitado(true);
      }
    } catch (error) {
      console.error("Error al verificar estado de feedback:", error);
      setHabilitado(true);
    } finally {
      setLoading(false);
    }
  }, [idEstudiante, slugEscenario]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    habilitado,
    loading,
    refetch: checkStatus,
    ultimaRetroalimentacion
  };
}
