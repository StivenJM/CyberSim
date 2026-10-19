export interface ScenarioGenerationRequest {
	prompt: string
}

export interface ScenarioGenerationResponse {
	success: boolean
	// biome-ignore lint/suspicious/noExplicitAny: This DTO carries an external scenario payload for normalization.
	data: any
	error?: string
}
