import { authorizedFetch } from '../../../../../shared/http'
import { API_BASE_URL } from '../../../../common/utils/apiConfig'
import type {
	ScenarioGenerationRequestDTO,
	ScenarioGenerationResponseDTO,
} from '../../domain/models/ScenarioBuilderDTOs'
import type { IScenarioBuilderService } from '../../domain/repositories/IScenarioBuilderService'

export class ScenarioBuilderApiService implements IScenarioBuilderService {
	async generateScenario(
		request: ScenarioGenerationRequestDTO,
	): Promise<ScenarioGenerationResponseDTO> {
		try {
			const response = await authorizedFetch(
				`${API_BASE_URL.replace('/api', '')}/api/agent-malvado/generate`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(request),
				},
			)

			if (!response.ok) {
				throw new Error(`API Error: ${response.status}`)
			}

			return await response.json()
		} catch (error: unknown) {
			return {
				success: false,
				data: null,
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch scenario from backend',
			}
		}
	}
}
