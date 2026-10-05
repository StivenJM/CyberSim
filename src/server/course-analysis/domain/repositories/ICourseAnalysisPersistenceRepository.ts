import type { CourseAnalysisResponse } from '../models/CourseAnalysis.js';

export interface ICourseAnalysisPersistenceRepository {
  save(idProfesor: number, analysis: CourseAnalysisResponse): Promise<void>;
  findLatestByCurso(idCurso: number): Promise<CourseAnalysisResponse | null>;
}
