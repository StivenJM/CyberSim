import { useAsyncState } from '../../../common/hooks/useAsyncState';
import type { CourseAnalysisResponse } from '../types/courseAnalysis.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UseGenerateCourseAnalysisResult {
  generateAnalysis: (idCurso: number, idProfesor: number) => Promise<{ success: boolean; analysis?: CourseAnalysisResponse; error?: string }>;
  checkLatestAnalysis: (idCurso: number) => Promise<{ success: boolean; analysis?: CourseAnalysisResponse }>;
  loading: boolean;
  error: string | null;
}

export function useGenerateCourseAnalysis(): UseGenerateCourseAnalysisResult {
  const { loading, error, runAsync } = useAsyncState();

  const generateAnalysis = async (idCurso: number, idProfesor: number) => {
    const result = await runAsync(async () => {
      const response = await fetch(`${API_BASE_URL}/course-analysis/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_curso: idCurso, id_profesor: idProfesor }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false as const, error: data.error || 'Error al generar el análisis' };
      }

      if (data.success && data.data) {
        return { success: true as const, analysis: data.data as CourseAnalysisResponse };
      }

      return { success: false as const, error: 'Respuesta inválida del servidor' };
    });

    return result ?? { success: false as const, error: 'Error de conexión con el servidor' };
  };

  const checkLatestAnalysis = async (idCurso: number) => {
    const result = await runAsync(async () => {
      const response = await fetch(`${API_BASE_URL}/course-analysis/latest/${idCurso}`);
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        return { success: true as const, analysis: data.data as CourseAnalysisResponse };
      }
      return { success: false as const };
    });

    return result ?? { success: false as const };
  };

  return { generateAnalysis, checkLatestAnalysis, loading, error };
}
