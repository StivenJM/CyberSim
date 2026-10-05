import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion, PerspectiveCamera } from 'three';
import { useScreenTransition } from '../../../common/contexts/ScreenTransitionContext';

// Centro de la pantalla del monitor en el espacio LOCAL del modelo (antes de
// rotar). Modelo procedural workstationModel: el panel está centrado en X=0, con
// el centro de la pantalla a Y≈0.371 sobre la base y Z≈-0.129 (la cara emisiva
// mira hacia +Z local). La base del modelo apoya en la superficie de la mesa.
const SCREEN_OFFSET = { x: 0, y: 0.371, z: -0.129 };
// Semidimensiones de la pantalla en unidades 3D (cara visible 0.52 × 0.30).
const SCREEN_HALF_W = 0.26;
const SCREEN_HALF_H = 0.15;
// Distancia a la que la cámara queda delante de la pantalla.
const CAMERA_DISTANCE = 0.19;
// Offset lateral: negativo = cámara a la izquierda, positivo = derecha.
// El monitor está centrado en X, así que la vista va recta (0).
const CAMERA_LATERAL_OFFSET = 0;
// Offset vertical: negativo = abajo, positivo = arriba.
const CAMERA_VERTICAL_OFFSET = 0;

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Animates the camera toward/away from a device's monitor screen.
 * After zoom-in completes, projects the monitor corners to 2D and enters desktop mode.
 * On exit, reverses the camera animation back to the original position.
 */
const CameraZoomEffect: React.FC = () => {
    const {
        isZooming, desktopMode, targetPosition, targetRotationY,
        enterDesktopMode, completeExit, savedCameraState,
    } = useScreenTransition();
    const { camera, gl, size } = useThree();

    const progress = useRef(0);
    const zoomDirection = useRef<'in' | 'out'>('in');
    const targetCamPos = useRef(new Vector3());
    const targetLookAt = useRef(new Vector3());
    const savedLookAt = useRef(new Vector3());
    const savedAspect = useRef(0);

    // Si el componente se desmonta mid-transición, restaura cámara y resetea estado para evitar que quede "trabada".
    useEffect(() => {
        return () => {
            if (savedAspect.current > 0 && camera instanceof PerspectiveCamera) {
                const w = gl.domElement.clientWidth;
                const h = gl.domElement.clientHeight;
                camera.aspect = h > 0 ? w / h : 1;
                camera.updateProjectionMatrix();
            }
            savedAspect.current = 0;
            if (savedCameraState.current) {
                camera.position.copy(savedCameraState.current.position);
                camera.quaternion.copy(savedCameraState.current.quaternion);
                savedCameraState.current = null;
            }
            completeExit();
        };
    // stable refs: camera, gl, savedCameraState, completeExit
     
    }, []);

    useFrame((_, rawDelta) => {
        // Clamp del delta: si el usuario vuelve a la pestaña tras mucho tiempo, rawDelta sería enorme y saltaría la animación.
        const delta = Math.min(rawDelta, 0.1);

        // Aspect bloqueado durante toda la transición (zoom + desktopMode) para que los resize no deformen la vista.
        if ((isZooming || desktopMode) && savedAspect.current > 0 && camera instanceof PerspectiveCamera) {
            if (camera.aspect !== savedAspect.current) {
                camera.aspect = savedAspect.current;
                camera.updateProjectionMatrix();
            }
        }

        // Desktop mode idle: aspect is locked above, nothing else to do
        if (desktopMode && !isZooming) {
            return;
        }

        if (!isZooming || !targetPosition) {
            if (!isZooming && !desktopMode) {
                progress.current = 0;
            }
            return;
        }

        // Determine zoom direction: 'in' if going to desktop, 'out' if returning
        const goingToDesktop = !desktopMode;
        if (goingToDesktop && zoomDirection.current !== 'in') {
            zoomDirection.current = 'in';
            progress.current = 0;
        } else if (!goingToDesktop && zoomDirection.current !== 'out') {
            zoomDirection.current = 'out';
            progress.current = 0;
        }

        // Save initial camera state on first frame of zoom-in
        // Guard: only save if not already saved (prevents stale frames after enterDesktopMode from overwriting)
        if (zoomDirection.current === 'in' && progress.current === 0 && !savedCameraState.current) {
            // Guarda el aspect al inicio del zoom para mantenerlo constante durante toda la transición.
            if (camera instanceof PerspectiveCamera) {
                savedAspect.current = camera.aspect;
            }
            savedCameraState.current = {
                position: camera.position.clone(),
                quaternion: camera.quaternion.clone(),
            };
            // Compute where the camera was looking at (point along its forward direction)
            const fwd = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            savedLookAt.current.copy(camera.position).add(fwd.multiplyScalar(5));
        }

        const saved = savedCameraState.current;
        if (!saved) return;

        // Calculate the screen center in world space (accounting for model rotation).
        // La workstation se construye con la pantalla mirando a +Z local y NO tiene
        // entrada en OFFSET_FRENTE_Y (offset = 0), así que se renderiza tal cual con
        // rotation.y = rotacionY. Por tanto la normal de la pantalla en mundo es
        // exactamente targetRotationY: (sin, 0, cos). Sin offset extra.
        const adjustedRotation = targetRotationY;
        const cosR = Math.cos(adjustedRotation);
        const sinR = Math.sin(adjustedRotation);
        // Apply Y-axis rotation matrix: X' = x*cos + z*sin, Z' = -x*sin + z*cos
        const screenCenter = new Vector3(
            targetPosition[0] + SCREEN_OFFSET.x * cosR + SCREEN_OFFSET.z * sinR,
            targetPosition[1] + SCREEN_OFFSET.y,
            targetPosition[2] - SCREEN_OFFSET.x * sinR + SCREEN_OFFSET.z * cosR,
        );

        // Camera end position: in front of screen, same height (straight-on view)
        // Screen faces +Z in local space, so forward normal after rotation = (sinR, 0, cosR)
        // Right direction = (cosR, 0, -sinR); shift both camera AND lookAt to keep same angle
        const lateralX = cosR * CAMERA_LATERAL_OFFSET;
        const lateralZ = -sinR * CAMERA_LATERAL_OFFSET;
        targetCamPos.current.set(
            screenCenter.x + sinR * CAMERA_DISTANCE + lateralX,
            screenCenter.y + CAMERA_VERTICAL_OFFSET,
            screenCenter.z + cosR * CAMERA_DISTANCE + lateralZ,
        );
        targetLookAt.current.set(
            screenCenter.x + lateralX,
            screenCenter.y + CAMERA_VERTICAL_OFFSET,
            screenCenter.z + lateralZ,
        );

        // Advance progress
        const speed = 2.2;
        progress.current = Math.min(progress.current + delta * speed, 1);
        const t = easeInOutCubic(progress.current);

        if (zoomDirection.current === 'in') {
            // Zoom IN: saved position → target position
            camera.position.lerpVectors(saved.position, targetCamPos.current, t);
            // Interpolate lookAt from original view direction to screen center
            camera.lookAt(
                new Vector3().lerpVectors(savedLookAt.current, targetLookAt.current, t)
            );
        } else {
            // Zoom OUT: target position → saved position
            camera.position.lerpVectors(targetCamPos.current, saved.position, t);
            camera.quaternion.slerpQuaternions(
                new Quaternion().setFromRotationMatrix(
                    camera.matrix.lookAt(targetCamPos.current, targetLookAt.current, camera.up)
                ),
                saved.quaternion,
                t,
            );
        }

        // Complete zoom
        if (progress.current >= 1) {
            if (zoomDirection.current === 'in') {
                // Project the 4 corners of the monitor screen to 2D
                const rect = projectMonitorToScreen(camera, gl.domElement, screenCenter, targetRotationY);
                enterDesktopMode(rect);
                // Keep progress at 1 so stale frames (before React re-renders)
                // hold the camera at the target position instead of snapping back
            } else {
                // Restore camera exactly
                camera.position.copy(saved.position);
                camera.quaternion.copy(saved.quaternion);
                // Guard contra NaN/cero al recalcular aspect (size puede ser 0 si el canvas no está mounted).
                if (camera instanceof PerspectiveCamera) {
                    const aspect = size.width / size.height;
                    camera.aspect = (isFinite(aspect) && aspect > 0) ? aspect : 1;
                    camera.updateProjectionMatrix();
                }
                savedAspect.current = 0;
                savedCameraState.current = null;
                completeExit();
                progress.current = 0;
            }
        }
    });

    return null;
};

/** Projects the monitor screen's 4 corners from 3D to 2D viewport coordinates */
function projectMonitorToScreen(
    camera: THREE.Camera,
    canvas: HTMLCanvasElement,
    screenCenter: Vector3,
    rotationY: number,
) {
    // Mismo criterio que el cálculo del zoom: la pantalla de la workstation mira a
    // +Z local y el modelo no tiene offset en OFFSET_FRENTE_Y, así que la rotación
    // efectiva de la cara es exactamente rotationY (sin sumar nada).
    const adjusted = rotationY;
    const cosR = Math.cos(adjusted);
    const sinR = Math.sin(adjusted);

    // Screen corners in world space
    const right = new Vector3(cosR, 0, -sinR);
    const up = new Vector3(0, 1, 0);

    const corners = [
        screenCenter.clone().add(right.clone().multiplyScalar(-SCREEN_HALF_W)).add(up.clone().multiplyScalar(SCREEN_HALF_H)),  // top-left
        screenCenter.clone().add(right.clone().multiplyScalar(SCREEN_HALF_W)).add(up.clone().multiplyScalar(SCREEN_HALF_H)),   // top-right
        screenCenter.clone().add(right.clone().multiplyScalar(SCREEN_HALF_W)).add(up.clone().multiplyScalar(-SCREEN_HALF_H)),  // bottom-right
        screenCenter.clone().add(right.clone().multiplyScalar(-SCREEN_HALF_W)).add(up.clone().multiplyScalar(-SCREEN_HALF_H)), // bottom-left
    ];

    const canvasRect = canvas.getBoundingClientRect();
    const projected = corners.map(corner => {
        const c = corner.clone().project(camera);
        return {
            x: (c.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left,
            y: (-c.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top,
        };
    });

    const xs = projected.map(p => p.x);
    const ys = projected.map(p => p.y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);

    return {
        left,
        top,
        width: Math.max(...xs) - left,
        height: Math.max(...ys) - top,
    };
}

export default CameraZoomEffect;
