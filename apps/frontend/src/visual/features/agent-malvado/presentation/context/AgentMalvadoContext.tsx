import { createContext, useContext, useState, type ReactNode } from 'react';
import { useAsyncState } from '../../../../common/hooks/useAsyncState';
import { GenerateScenarioUseCase } from '../../application/useCases/GenerateScenarioUseCase';
import { ScenarioBuilderApiService } from '../../infrastructure/services/ScenarioBuilderApiService';

interface AgentMalvadoContextProps {
  isGenerating: boolean;
  generatedScenario: Record<string, unknown> | null;
  error: string | null;
  generateDynamicLevel: (prompt?: string) => Promise<void>;
  clearScenario: () => void;
}

const AgentMalvadoContext = createContext<AgentMalvadoContextProps | undefined>(undefined);

export const AgentMalvadoProvider = ({ children }: { children: ReactNode }) => {
  const { loading: isGenerating, error, runAsync, setError } = useAsyncState();
  const [generatedScenario, setGeneratedScenario] = useState<Record<string, unknown> | null>(null);

  const generateDynamicLevel = async (customPrompt?: string) => {
    setGeneratedScenario(null);

    const result = await runAsync(async () => {
      const apiService = new ScenarioBuilderApiService();
      const useCase = new GenerateScenarioUseCase(apiService);
      return useCase.execute({ prompt: customPrompt });
    });

    if (result) {
      if (result.success && result.data) {
        setGeneratedScenario(result.data[0] || result.data);
      } else {
        setError(result.error || 'Fallo desconocido de la IA malvada');
      }
    }
  };

  const clearScenario = () => {
    setGeneratedScenario(null);
    setError(null);
  };

  return (
    <AgentMalvadoContext.Provider value={{ isGenerating, generatedScenario, error, generateDynamicLevel, clearScenario }}>
      {children}
    </AgentMalvadoContext.Provider>
  );
};

export const useAgentMalvado = (): AgentMalvadoContextProps => {
  const context = useContext(AgentMalvadoContext);
  if (!context) {
    throw new Error('useAgentMalvado debe usarse dentro de un AgentMalvadoProvider');
  }
  return context;
};
