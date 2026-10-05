import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';

/**
 * Componente que maneja el resize de la ventana y actualiza la cámara correctamente
 * Previene problemas de aspect ratio y perspectiva distorsionada
 */
const ResizeHandler = () => {
    const { camera, gl, size } = useThree();

    useEffect(() => {
        const handleResize = () => {
            const container = gl.domElement.parentElement;
            if (!container) return;

            const width = container.clientWidth;
            const height = container.clientHeight;

            if (width === 0 || height === 0) return;

            if (camera instanceof PerspectiveCamera) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }

            gl.setSize(width, height, false);
        };

        // Delay inicial para que el layout flex/CSS se estabilice
        const initTimeout = window.setTimeout(handleResize, 100);

        // ResizeObserver para detectar cambios en el contenedor
        const container = gl.domElement.parentElement;
        let resizeObserver: ResizeObserver | null = null;
        if (container) {
            resizeObserver = new ResizeObserver(() => {
                handleResize();
            });
            resizeObserver.observe(container);
        }

        return () => {
            clearTimeout(initTimeout);
            resizeObserver?.disconnect();
        };
    }, [camera, gl, size]);

    return null;
};

export default ResizeHandler;
