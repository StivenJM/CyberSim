export interface ScenarioGenerationRequestDTO {
  prompt?: string;
}

export interface ScenarioGenerationResponseDTO {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  error?: string;
}
