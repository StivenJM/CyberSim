import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

interface Scene3DCanvasProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Componente contenedor para el Canvas 3D de Three.js
 * Configura el canvas base con propiedades reutilizables
 */
const Scene3DCanvas: React.FC<Scene3DCanvasProps> = ({ children, className }) => {
    return (
        <Canvas
            className={className}
            camera={{
                position: [-3, 4, 5],
                fov: 50,
                near: 0.1,
                far: 1000
            }}
            shadows
            dpr={[1, 2]} // Device pixel ratio para mejor calidad
            style={{ width: '100%', height: '100%', display: 'block' }}
        >
            <Suspense fallback={null}>
                {children}
            </Suspense>
        </Canvas>
    );
};

export default Scene3DCanvas;
