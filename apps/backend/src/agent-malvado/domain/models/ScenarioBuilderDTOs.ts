export interface ScenarioGenerationRequest {
  prompt: string;
}

export interface ScenarioGenerationResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  error?: string;
}
