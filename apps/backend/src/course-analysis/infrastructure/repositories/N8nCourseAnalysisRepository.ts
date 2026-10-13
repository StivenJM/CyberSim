import type { ICourseAnalysisRepository } from "../../domain/repositories/ICourseAnalysisRepository.js";
import type { CourseAnalysisPayload, CourseAnalysisResponse } from "../../domain/models/CourseAnalysis.js";

export class N8nCourseAnalysisRepository implements ICourseAnalysisRepository {
  constructor(private readonly webhookUrl: string) {}

  async generateAnalysis(payload: CourseAnalysisPayload): Promise<CourseAnalysisResponse> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data: CourseAnalysisResponse = await response.json();
      
      // Validación básica de la estructura
      if (!data.analisis || !data.resumen) {
        throw new Error('La respuesta de N8N no tiene la estructura esperada');
      }

      return data;
    } catch (error) {
      console.error('Error al comunicarse con N8N para análisis de curso:', error);
      if (error instanceof Error) {
        throw new Error(`No se pudo generar el análisis del curso: ${error.message}`);
      }
      throw new Error('No se pudo generar el análisis del curso. Por favor, intenta de nuevo.');
    }
  }
}
