import type { IFeedbackRepository } from "../../domain/repositories/IFeedbackRepository.js";
import type { FeedbackPayload, FeedbackResponse } from "../../domain/models/Feedback.js";

export class N8nFeedbackRepository implements IFeedbackRepository {
  constructor(private readonly webhookUrl: string) {}

  async generateFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data: FeedbackResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al comunicarse con n8n:', error);
      throw new Error(
        'No se pudo generar la retroalimentación. Por favor, intenta de nuevo.'
      );
    }
  }
}
