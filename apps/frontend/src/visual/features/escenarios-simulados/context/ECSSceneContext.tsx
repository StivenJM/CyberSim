import { createContext, type ReactNode, useContext } from 'react';
import { useECSScene } from '../hooks/useECSScene';

const ECSSceneContext = createContext<ReturnType<typeof useECSScene> | null>(null);

export const ECSSceneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const ecsScene = useECSScene();

    return (
        <ECSSceneContext.Provider value={ecsScene}>
            {children}
        </ECSSceneContext.Provider>
    );
};

export const useECSSceneContext = () => {
    const context = useContext(ECSSceneContext);
    if (!context) {
        throw new Error('useECSSceneContext debe usarse dentro de ECSSceneProvider');
    }
    return context;
};