import React from 'react';
import { Environment, Lightformer } from '@react-three/drei';

interface LightsProps {
    ambientIntensity?: number;
    directionalIntensity?: number;
    directionalPosition?: [number, number, number];
    enableShadows?: boolean;
}

/**
 * Iluminación base de la escena (agnóstica al tema): luz ambiente suave,
 * hemisférica e iluminación basada en imagen (IBL) generada por código con
 * Lightformers — sin descargar HDRIs externos. La IBL es lo que da reflejos
 * creíbles al vidrio y al metal; sin ella los materiales se ven de arcilla gris.
 *
 * La luz principal direccional (con sombras y tinte por escenario) la aporta
 * SceneDressing, que conoce los límites del edificio y el tema de la zona.
 */
const Lights: React.FC<LightsProps> = ({
    ambientIntensity = 0.45,
}) => {
    return (
        <>
            <ambientLight intensity={ambientIntensity} />
            <hemisphereLight args={['#ffffff', '#5b5f66', 0.4]} position={[0, 1, 0]} />

            {/* IBL procedural: un "estudio" de luces que solo alimenta el mapa de
                entorno (no se ven en la escena). Da reflejos a vidrio y metal. */}
            <Environment resolution={256} frames={1} background={false}>
                <Lightformer intensity={1.2} form="rect" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 20, 1]} color="#fdf3e3" />
                <Lightformer intensity={0.8} form="rect" position={[6, 3, 6]} rotation={[0, -Math.PI / 4, 0]} scale={[10, 8, 1]} color="#dfe9f2" />
                <Lightformer intensity={0.6} form="rect" position={[-6, 3, -4]} rotation={[0, Math.PI / 3, 0]} scale={[10, 8, 1]} color="#c8d4e0" />
                <Lightformer intensity={0.4} form="ring" position={[0, 4, -8]} scale={[6, 6, 1]} color="#ffffff" />
            </Environment>
        </>
    );
};

export default Lights;
