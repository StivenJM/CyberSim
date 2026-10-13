export interface CourseAnalysisSection {
  titulo: string;
  contenido: string;
}

export interface CourseAnalysisSummary {
  total_estudiantes: number;
  promedio_intentos: number;
  estudiantes_necesitan_apoyo: number;
}

export interface CourseAnalysisData {
  resumen_ejecutivo: CourseAnalysisSection;
  patrones: CourseAnalysisSection;
  fortalezas: CourseAnalysisSection;
  areas_mejora: CourseAnalysisSection;
  recomendaciones: CourseAnalysisSection;
}

export interface CourseAnalysisResponse {
  id_curso: number;
  fecha_generacion: string;
  resumen: CourseAnalysisSummary;
  analisis: CourseAnalysisData;
}
