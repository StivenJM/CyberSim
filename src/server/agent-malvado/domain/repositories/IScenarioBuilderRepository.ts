import { ScenarioGenerationRequest, ScenarioGenerationResponse } from '../models/ScenarioBuilderDTOs.js';

export interface IScenarioBuilderRepository {
  generate(request: ScenarioGenerationRequest): Promise<ScenarioGenerationResponse>;
}
