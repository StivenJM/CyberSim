export interface FeedbackResponse {
  analisis: string;
  fortaleza: string;
  area_mejora: string;
  consejo: string;
}

export interface FeedbackPayload {
  id_estudiante: number;
  slug_escenario: string;
}
