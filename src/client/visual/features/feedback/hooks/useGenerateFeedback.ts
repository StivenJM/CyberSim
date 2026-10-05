import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { useAsyncState } from "../../../common/hooks";
import type { FeedbackData } from '../types/feedback.types';

interface FeedbackAPIResponse {
  success: boolean;
  data: FeedbackData;
}

export const useGenerateFeedback = () => {
  const { loading, runAsync } = useAsyncState();

  const generateFeedback = (
    idEstudiante: number,
    slugEscenario: string
  ): Promise<{ feedback: FeedbackData } | null> =>
    runAsync(async () => {
      const response = await fetch(`${API_BASE_URL}/feedback/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: idEstudiante,
          slug_escenario: slugEscenario,
        }),
      });

      if (!response.ok) throw new Error("Error al generar retroalimentación");

      const result: FeedbackAPIResponse = await response.json();
      if (!result.success) throw new Error("Error al generar retroalimentación");

      return { feedback: result.data };
    });

  return { generateFeedback, loading };
};
