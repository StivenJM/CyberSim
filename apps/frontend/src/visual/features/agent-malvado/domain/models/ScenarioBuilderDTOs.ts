export interface ScenarioGenerationRequestDTO {
	prompt?: string
}

export interface ScenarioGenerationResponseDTO {
	success: boolean
	// biome-ignore lint/suspicious/noExplicitAny: This DTO carries an external scenario payload for normalization.
	data: any
	error?: string
}
