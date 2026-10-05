import type { FeedbackResponse } from '../models/Feedback.js';

export interface IFeedbackPersistenceRepository {
  save(idEstudiante: number, slugEscenario: string, feedback: FeedbackResponse, numIntentos: number): Promise<void>;
  debeHabilitar(idEstudiante: number, slugEscenario: string, intentosActuales: number): Promise<boolean>;
  getNumIntentosAlGenerar(idEstudiante: number, slugEscenario: string): Promise<number | null>;
  getLatestFeedback(idEstudiante: number, slugEscenario: string): Promise<FeedbackResponse | null>;
}
