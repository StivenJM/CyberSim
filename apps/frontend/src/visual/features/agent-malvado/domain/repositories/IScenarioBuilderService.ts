import type { ScenarioGenerationRequestDTO, ScenarioGenerationResponseDTO } from '../models/ScenarioBuilderDTOs';

export interface IScenarioBuilderService {
  generateScenario(request: ScenarioGenerationRequestDTO): Promise<ScenarioGenerationResponseDTO>;
}
