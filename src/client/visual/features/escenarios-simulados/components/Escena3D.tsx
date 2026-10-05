import React, { useEffect } from 'react';
import styles from '../styles/Escena3D.module.css';
import Scene3DCanvas from './Scene3DCanvas';
import CameraControls from './CameraControls';
import Lights from './Lights';
import Environment from './Environment';
import ResizeHandler from './ResizeHandler';
import {
    DEFAULT_LIGHT_CONFIG,
    DEFAULT_CONTROLS_CONFIG,
    DEFAULT_ENVIRONMENT_CONFIG,
} from '../config/scene3DConfig';
import ECSSceneRenderer from './ECSSceneRenderer';
import CameraZoomEffect from './CameraZoomEffect';
import OfficeWalls from './OfficeWalls';
import SceneDressing from './SceneDressing';
import SceneProps from './SceneProps';
import ZoneToast from './ZoneToast';
import Controles3D from './Controles3D';
import { useECSSceneContext } from '../context/ECSSceneContext';
import { useScreenTransition } from '../../../common/contexts/ScreenTransitionContext';
import { useModelsReady } from '../../../common/components/ModelPreloader';

/**
 * Componente principal de la escena 3D
 * Orquesta la visualización 3D del escenario usando ECS con luces y controles 
 */
const Escena3D: React.FC = () => {
    const {
        zonasDisponibles,
        zonaActual,
        showZoneToast,
        zoneToastName,
        hideZoneToast
    } = useECSSceneContext();
    const { isZooming, desktopMode } = useScreenTransition();

    const modelsReady = useModelsReady();
    const [isReady, setIsReady] = React.useState(false);

    // Activar fade-in cuando los modelos estén listos
    useEffect(() => {
        if (modelsReady) {
            // Pequeño delay para transición suave
            setTimeout(() => setIsReady(true), 150);
        }
    }, [modelsReady]);

    return (
        <section
            className={styles.vista3D}
            aria-label="Vista 3D de la escena"
            data-tour="escena-3d"
        >
            {zonasDisponibles.length > 1 && zonaActual !== null && (
                <>
                    <ZoneToast
                        zoneName={zoneToastName}
                        show={showZoneToast}
                        onHide={hideZoneToast}
                    />
                    <Controles3D />
                </>
            )}
            <Scene3DCanvas className={`${styles.canvas} ${isReady ? styles.ready : ''}`}>
                <ResizeHandler />
                <Lights
                    ambientIntensity={DEFAULT_LIGHT_CONFIG.ambientIntensity}
                    directionalIntensity={DEFAULT_LIGHT_CONFIG.directionalIntensity}
                    directionalPosition={DEFAULT_LIGHT_CONFIG.directionalPosition}
                    enableShadows={DEFAULT_LIGHT_CONFIG.enableShadows}
                />
                <ECSSceneRenderer />
                <CameraZoomEffect />
                <OfficeWalls />
                <SceneDressing />
                <SceneProps />
                <CameraControls
                    enabled={!isZooming && !desktopMode}
                    enableZoom={DEFAULT_CONTROLS_CONFIG.enableZoom}
                    enablePan={DEFAULT_CONTROLS_CONFIG.enablePan}
                    enableRotate={DEFAULT_CONTROLS_CONFIG.enableRotate}
                    autoRotate={DEFAULT_CONTROLS_CONFIG.autoRotate}
                    autoRotateSpeed={DEFAULT_CONTROLS_CONFIG.autoRotateSpeed}
                    minDistance={DEFAULT_CONTROLS_CONFIG.minDistance}
                    maxDistance={DEFAULT_CONTROLS_CONFIG.maxDistance}
                    minPolarAngle={DEFAULT_CONTROLS_CONFIG.minPolarAngle}
                    maxPolarAngle={DEFAULT_CONTROLS_CONFIG.maxPolarAngle}
                />
                <Environment
                    showGrid={DEFAULT_ENVIRONMENT_CONFIG.showGrid}
                    showAxes={DEFAULT_ENVIRONMENT_CONFIG.showAxes}
                    gridSize={DEFAULT_ENVIRONMENT_CONFIG.gridSize}
                    gridDivisions={DEFAULT_ENVIRONMENT_CONFIG.gridDivisions}
                />
            </Scene3DCanvas>
        </section>
    );
};

export default Escena3D;