import React, { useRef, useMemo, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { Group, Mesh, Material, MeshStandardMaterial, Box3, Vector3 } from 'three';
import RadialMenu from './RadialMenu';
import { getProceduralScene, isProceduralPath } from './procedural/proceduralModels';

interface Model3DProps {
    modelPath: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    onClick?: () => void;
    onContextMenu?: () => void;
    onHover?: () => void;
    onHoverEnd?: () => void;
    isSelected?: boolean;
    enableHover?: boolean;
    showMenu?: boolean;
    menuOptions?: Array<{
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
        color?: string;
        to?: string;
    }>;
    onMenuClose?: () => void;
    onNavigate?: (path: string) => void;
    /** Dispositivo no accesible (zona no interactiva): el menú muestra un aviso inerte. */
    blocked?: boolean;
    blockedMessage?: string;
}

/**
 * Vista presentacional de un modelo 3D ya resuelto (glTF o procedural).
 * Recibe la escena (Group) y se encarga del render, hover, anillo de
 * selección y menú radial. No sabe de dónde vino la escena.
 */
const Model3DView: React.FC<Model3DProps & { scene: Group }> = React.memo(({
    scene,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    onClick,
    onContextMenu,
    onHover,
    onHoverEnd,
    isSelected = false,
    enableHover = true,
    showMenu = false,
    menuOptions = [],
    onMenuClose,
    onNavigate,
    blocked = false,
    blockedMessage
}) => {
    const groupRef = useRef<Group>(null);
    const [hovered, setHovered] = useState(false);

    const clonedScene = useMemo(() => {
        const cloned = scene.clone(true);

        // Solo clonar materiales si enableHover está activo
        if (enableHover) {
            cloned.traverse((child) => {
                const mesh = child as Mesh;
                if (mesh.isMesh && mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material = mesh.material.map(mat => mat.clone());
                    } else {
                        mesh.material = (mesh.material as Material).clone();
                    }
                }
            });
        }

        return cloned;
    }, [scene, enableHover]);

    const modelSize = useMemo(() => {
        const box = new Box3().setFromObject(scene);
        const size = new Vector3();
        box.getSize(size);
        // Usar el máximo entre ancho y profundidad
        return Math.max(size.x, size.z);
    }, [scene]);

    // Aplicar brillo aumentado cuando está en hover
    useMemo(() => {
        // Solo aplicar efecto si enableHover está habilitado
        if (!enableHover) return;

        clonedScene.traverse((child) => {
            const mesh = child as Mesh;
            if (mesh.isMesh && mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

                materials.forEach(mat => {
                    if ('emissiveIntensity' in mat) {
                        const stdMat = mat as MeshStandardMaterial;
                        if (hovered) {
                            if (!stdMat.userData.originalEmissive) {
                                stdMat.userData.originalEmissive = stdMat.emissive.clone();
                                stdMat.userData.originalEmissiveIntensity = stdMat.emissiveIntensity;
                            }
                            stdMat.emissive.setRGB(0.05, 0.05, 0.05);
                            stdMat.emissiveIntensity = 0.15;
                            stdMat.needsUpdate = true; // Asegurar actualización del material
                        } else {
                            if (stdMat.userData.originalEmissive) {
                                stdMat.emissive.copy(stdMat.userData.originalEmissive);
                                stdMat.emissiveIntensity = stdMat.userData.originalEmissiveIntensity ?? 0;
                                stdMat.needsUpdate = true; // Asegurar actualización del material
                            }
                        }
                    }
                });
            }
        });
    }, [clonedScene, hovered, enableHover]);

    const scaleValue = typeof scale === 'number' ? scale : Math.max(...scale);
    const baseRadius = modelSize / 2; // Radio base del modelo
    const ringInnerRadius = (baseRadius + 0.07) * scaleValue; // Un poco más grande que el modelo
    const ringOuterRadius = (baseRadius + 0.15) * scaleValue; // Grosor del anillo

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation}
            scale={scale}
            onClick={(e) => {
                e.stopPropagation();
                if (onContextMenu) {
                    onContextMenu();
                } else {
                    onClick?.();
                }
            }}
            onContextMenu={(e) => {
                e.stopPropagation();
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                if (enableHover) {
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                    onHover?.();
                }
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                if (enableHover) {
                    setHovered(false);
                    document.body.style.cursor = 'auto';
                    onHoverEnd?.();
                }
            }}
        >
            <primitive object={clonedScene} />

            {showMenu && (menuOptions.length > 0 || blocked) && (
                <Html
                    position={[0, 0, 0]}
                    center
                    occlude={false}
                    zIndexRange={[100, 0]}
                    style={{ pointerEvents: 'none' }}
                >
                    <div style={{ pointerEvents: 'all' }}>
                        <RadialMenu
                            onClose={() => onMenuClose?.()}
                            options={menuOptions}
                            onNavigate={onNavigate}
                            blocked={blocked}
                            blockedMessage={blockedMessage}
                        />
                    </div>
                </Html>
            )}

            {isSelected && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[ringInnerRadius, ringOuterRadius, 32]} />
                    <meshBasicMaterial
                        color="#0088ff"
                        transparent
                        opacity={0.4}
                    />
                </mesh>
            )}
        </group>
    );
});

Model3DView.displayName = 'Model3DView';

/**
 * Carga una escena desde un archivo glTF.
 */
const GLTFModel3D: React.FC<Model3DProps> = (props) => {
    const { scene } = useGLTF(props.modelPath);
    return <Model3DView {...props} scene={scene} />;
};

/**
 * Obtiene una escena construida proceduralmente desde el registro.
 */
const ProceduralModel3D: React.FC<Model3DProps> = (props) => {
    const scene = getProceduralScene(props.modelPath);
    return <Model3DView {...props} scene={scene} />;
};

/**
 * Selecciona el origen del modelo según la ruta: las rutas con prefijo
 * `procedural:` se construyen por código; el resto se cargan como glTF.
 */
const Model3D: React.FC<Model3DProps> = React.memo((props) => {
    return isProceduralPath(props.modelPath)
        ? <ProceduralModel3D {...props} />
        : <GLTFModel3D {...props} />;
});

Model3D.displayName = 'Model3D';

export default Model3D;
