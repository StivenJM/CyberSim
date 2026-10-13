import { useEffect, useState } from 'react';
import { preloadAllModels } from '../../features/escenarios-simulados/config/modelConfig';

/**
 * Componente que precarga todos los modelos 3D una sola vez al inicio de la app
 * Exporta un hook para verificar si los modelos están listos
 */

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const useModelsReady = () => {
    const [isReady, setIsReady] = useState(modelsLoaded);

    useEffect(() => {
        if (modelsLoaded) {
            setIsReady(true);
            return;
        }

        if (!loadingPromise) {
            loadingPromise = preloadAllModels().then(() => {
                modelsLoaded = true;
            });
        }

        loadingPromise.then(() => {
            setIsReady(true);
        });
    }, []);

    return isReady;
};

/**
 * Componente invisible que inicia la precarga de modelos
 * Colocar una vez en el nivel superior de la app
 */
const ModelPreloader: React.FC = () => {
    useEffect(() => {
        if (!modelsLoaded && !loadingPromise) {
            loadingPromise = preloadAllModels().then(() => {
                modelsLoaded = true;
            });
        }
    }, []);

    return null;
};

export default ModelPreloader;
