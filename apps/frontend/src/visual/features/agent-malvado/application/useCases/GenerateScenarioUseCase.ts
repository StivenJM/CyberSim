import type {
	ScenarioGenerationRequestDTO,
	ScenarioGenerationResponseDTO,
} from '../../domain/models/ScenarioBuilderDTOs'
import type { IScenarioBuilderService } from '../../domain/repositories/IScenarioBuilderService'

export class GenerateScenarioUseCase {
	constructor(
		private readonly scenarioBuilderService: IScenarioBuilderService,
	) {}

	async execute(params?: {
		prompt?: string
	}): Promise<ScenarioGenerationResponseDTO> {
		const request: ScenarioGenerationRequestDTO = {
			prompt: params?.prompt,
		}
		return await this.scenarioBuilderService.generateScenario(request)
	}
}
