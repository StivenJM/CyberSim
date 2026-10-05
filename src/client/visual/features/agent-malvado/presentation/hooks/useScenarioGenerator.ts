import { useState } from 'react';
import { GenerateScenarioUseCase } from '../../application/useCases/GenerateScenarioUseCase';
import { ScenarioBuilderApiService } from '../../infrastructure/services/ScenarioBuilderApiService';

export const useScenarioGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioData, setScenarioData] = useState<Record<string, unknown> | null>(null);

  const generateScenario = async (customPrompt?: string) => {
    setLoading(true);
    setError(null);
    try {
      const apiService = new ScenarioBuilderApiService();
      const useCase = new GenerateScenarioUseCase(apiService);
      const result = await useCase.execute({ prompt: customPrompt });

      if (result.success && result.data) {
        setScenarioData(result.data);
      } else {
        setError(result.error || 'Failed to generate scenario');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, scenarioData, generateScenario };
};
