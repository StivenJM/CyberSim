import { IScenarioBuilderRepository } from '../../domain/repositories/IScenarioBuilderRepository.js';
import { ScenarioGenerationRequest, ScenarioGenerationResponse } from '../../domain/models/ScenarioBuilderDTOs.js';

export class N8nWebhookRepository implements IScenarioBuilderRepository {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async generate(request: ScenarioGenerationRequest): Promise<ScenarioGenerationResponse> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: request.prompt }),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      return {
        success: true,
        data: responseData,
      };
    } catch (unknownError: unknown) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      return {
        success: false,
        data: null,
        error: error.message || 'Unknown error occurred during webhook call',
      };
    }
  }
}
