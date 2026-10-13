import type { ICourseAnalysisRepository } from "../../domain/repositories/ICourseAnalysisRepository.js";
import type { ICourseAnalysisPersistenceRepository } from "../../domain/repositories/ICourseAnalysisPersistenceRepository.js";
import type { CourseAnalysisPayload, CourseAnalysisResponse } from "../../domain/models/CourseAnalysis.js";

export class GenerateCourseAnalysisUseCase {
  constructor(
    private readonly courseAnalysisRepository: ICourseAnalysisRepository,
    private readonly courseAnalysisPersistenceRepository: ICourseAnalysisPersistenceRepository
  ) {}

  async execute(payload: CourseAnalysisPayload): Promise<CourseAnalysisResponse> {
    if (!payload.id_curso || typeof payload.id_curso !== 'number') {
      throw new Error('id_curso debe ser un número válido');
    }

    if (payload.id_curso <= 0) {
      throw new Error('id_curso debe ser mayor que 0');
    }

    if (!payload.id_profesor || typeof payload.id_profesor !== 'number') {
      throw new Error('id_profesor es requerido y debe ser un número válido');
    }

    // Opcional: Podríamos verificar en BD si ya existe uno reciente aquí.
    // Por simplicidad del POC, generaremos y guardaremos siempre. (Podría modificarse en el futuro)
    
    // Generar el análisis llamando a N8N
    const analysis = await this.courseAnalysisRepository.generateAnalysis(payload);

    // Guardar en la base de datos
    await this.courseAnalysisPersistenceRepository.save(payload.id_profesor, analysis);

    return analysis;
  }
}
