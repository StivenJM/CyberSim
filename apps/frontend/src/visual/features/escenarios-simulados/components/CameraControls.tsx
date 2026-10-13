import React, { useRef, useEffect, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Quaternion } from 'three';
import { useECSSceneContext } from '../context/ECSSceneContext';

// Distancia final de la cámara al inspeccionar un dispositivo (router/switch).
// Valor pequeño = mucho zoom.
const INSPECT_DISTANCE = 1.2;
// Distancia mínima permitida mientras se inspecciona, para que el usuario pueda
// orbitar/acercarse alrededor del dispositivo sin ser expulsado por minDistance.
const INSPECT_MIN_DISTANCE = 0.5;
// Altura sobre la base del dispositivo a la que apunta la cámara (centro del cuerpo).
const INSPECT_LOOK_HEIGHT = 0.08;
// Velocidad de la animación de zoom (mayor = más rápido).
const INSPECT_SPEED = 2.2;

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface CameraControlsProps {
    enabled?: boolean;
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    minDistance?: number;
    maxDistance?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
}

const CameraControls: React.FC<CameraControlsProps> = ({
    enabled = true,
    enableZoom = true,
    enablePan = true,
    enableRotate = true,
    autoRotate = false,
    autoRotateSpeed = 2,
    minDistance = 2,
    maxDistance = 10,
    minPolarAngle = 0,
    maxPolarAngle = Math.PI / 2,
}) => {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera } = useThree();
    const { zoomCommand, clearZoomCommand, focusTarget, clearFocusTarget, inspectTarget } = useECSSceneContext();

    // Enfocado: desde que empieza el acercamiento hasta que se vuelve a la vista
    // general. Mientras dure, se baja minDistance para poder orbitar de cerca.
    const [inspectActive, setInspectActive] = useState(false);
    // Animando: solo durante el vuelo de cámara (in/out). Deshabilita OrbitControls
    // para que la interpolación no pelee con los controles.
    const [isAnimating, setIsAnimating] = useState(false);

    // Estado de la animación de inspección (en refs para no re-renderizar por frame).
    const inspectPhase = useRef<'idle' | 'in' | 'out'>('idle');
    const inspectProgress = useRef(0);
    const startPos = useRef(new Vector3());
    const startQuat = useRef(new Quaternion());
    const startLookAt = useRef(new Vector3());
    const endPos = useRef(new Vector3());
    const endLookAt = useRef(new Vector3());
    // Vista general guardada al iniciar la inspección, para restaurarla al salir.
    const savedPos = useRef<Vector3 | null>(null);
    const savedQuat = useRef<Quaternion | null>(null);
    const savedTarget = useRef(new Vector3());

    useEffect(() => {
        if (!zoomCommand || !controlsRef.current) return;
        const controls = controlsRef.current;
        const direction = new Vector3().subVectors(camera.position, controls.target).normalize();
        const step = zoomCommand === 'in' ? -1.5 : 1.5;
        const newPos = camera.position.clone().addScaledVector(direction, step);
        const dist = newPos.distanceTo(controls.target);
        if (dist >= minDistance && dist <= maxDistance) {
            camera.position.copy(newPos);
            controls.update();
        }
        clearZoomCommand();
    }, [zoomCommand, clearZoomCommand, camera, minDistance, maxDistance]);

    useEffect(() => {
        if (!focusTarget || !controlsRef.current) return;
        const controls = controlsRef.current;
        const target = new Vector3(focusTarget[0], focusTarget[1], focusTarget[2]);
        const offset = camera.position.clone().sub(controls.target);
        controls.target.copy(target);
        camera.position.copy(target).add(offset);
        controls.update();
        clearFocusTarget();
    }, [focusTarget, clearFocusTarget, camera]);

    // Prepara la animación de zoom al cambiar el dispositivo inspeccionado.
    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;

        if (inspectTarget) {
            // Guarda la vista general la primera vez que se entra en inspección.
            if (!savedPos.current) {
                savedPos.current = camera.position.clone();
                savedQuat.current = camera.quaternion.clone();
                savedTarget.current.copy(controls.target);
            }

            const objetivo = new Vector3(
                inspectTarget[0],
                inspectTarget[1] + INSPECT_LOOK_HEIGHT,
                inspectTarget[2]
            );
            // Mantener el ángulo de visión actual: la cámara se acerca por el
            // mismo lado desde el que ya está mirando.
            const direccion = camera.position.clone().sub(objetivo).normalize();

            startPos.current.copy(camera.position);
            startLookAt.current.copy(controls.target);
            endPos.current.copy(objetivo).addScaledVector(direccion, INSPECT_DISTANCE);
            endLookAt.current.copy(objetivo);
            inspectProgress.current = 0;
            inspectPhase.current = 'in';
            setInspectActive(true);
            setIsAnimating(true);
        } else if (savedPos.current) {
            // Volver a la vista general.
            startPos.current.copy(camera.position);
            startQuat.current.copy(camera.quaternion);
            inspectProgress.current = 0;
            inspectPhase.current = 'out';
            setIsAnimating(true);
        }
    }, [inspectTarget, camera]);

    useFrame((_, rawDelta) => {
        if (inspectPhase.current === 'idle') return;
        const controls = controlsRef.current;
        if (!controls) return;

        const delta = Math.min(rawDelta, 0.1);
        inspectProgress.current = Math.min(inspectProgress.current + delta * INSPECT_SPEED, 1);
        const t = easeInOutCubic(inspectProgress.current);

        if (inspectPhase.current === 'in') {
            camera.position.lerpVectors(startPos.current, endPos.current, t);
            camera.lookAt(new Vector3().lerpVectors(startLookAt.current, endLookAt.current, t));
            if (inspectProgress.current >= 1) {
                // Centrar la órbita en el dispositivo y devolver el control al
                // usuario, que ya puede orbitar/acercarse alrededor de él.
                controls.target.copy(endLookAt.current);
                controls.update();
                inspectPhase.current = 'idle';
                setIsAnimating(false);
            }
        } else {
            // Fase 'out': interpolar de vuelta a la vista general guardada.
            const sPos = savedPos.current!;
            const sQuat = savedQuat.current!;
            camera.position.lerpVectors(startPos.current, sPos, t);
            camera.quaternion.slerpQuaternions(startQuat.current, sQuat, t);
            if (inspectProgress.current >= 1) {
                camera.position.copy(sPos);
                camera.quaternion.copy(sQuat);
                controls.target.copy(savedTarget.current);
                controls.update();
                savedPos.current = null;
                savedQuat.current = null;
                inspectPhase.current = 'idle';
                setInspectActive(false);
                setIsAnimating(false);
            }
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enableDamping={false}
            enabled={enabled && !isAnimating}
            enableZoom={enableZoom}
            enablePan={enablePan}
            enableRotate={enableRotate}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            minDistance={inspectActive ? INSPECT_MIN_DISTANCE : minDistance}
            maxDistance={maxDistance}
            minPolarAngle={minPolarAngle}
            maxPolarAngle={maxPolarAngle}
            makeDefault
        />
    );
};

export default CameraControls;
