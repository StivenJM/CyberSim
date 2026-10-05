import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { Vector3, Quaternion } from 'three';

interface MonitorRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface PendingZoom {
    position: [number, number, number];
    rotationY: number;
}

interface ScreenTransitionState {
    /** True only during camera zoom animation */
    isZooming: boolean;
    /** True when desktop content is visible on the monitor */
    desktopMode: boolean;
    /** 3D world position of the target device */
    targetPosition: [number, number, number] | null;
    /** Y rotation of the target device model */
    targetRotationY: number;
    /** 2D rect of the monitor screen after zoom completes */
    monitorRect: MonitorRect | null;
    /** Pending zoom request (set from Sidebar, consumed by VistaOficina) */
    pendingZoom: PendingZoom | null;
}

interface SavedCameraState {
    position: Vector3;
    quaternion: Quaternion;
}

interface ScreenTransitionActions {
    startZoom: (position: [number, number, number], rotationY: number) => void;
    enterDesktopMode: (rect: MonitorRect) => void;
    updateMonitorRect: (rect: MonitorRect) => void;
    exitDesktopMode: () => void;
    completeExit: () => void;
    requestZoomToDevice: (position: [number, number, number], rotationY: number) => void;
    consumePendingZoom: () => void;
    savedCameraState: React.RefObject<SavedCameraState | null>;
}

type ScreenTransitionContextType = ScreenTransitionState & ScreenTransitionActions;

const ScreenTransitionContext = createContext<ScreenTransitionContextType | null>(null);

export function ScreenTransitionProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ScreenTransitionState>({
        isZooming: false,
        desktopMode: false,
        targetPosition: null,
        targetRotationY: 0,
        monitorRect: null,
        pendingZoom: null,
    });

    const savedCameraState = useRef<SavedCameraState | null>(null);

    const startZoom = useCallback((position: [number, number, number], rotationY: number) => {
        setState({
            isZooming: true,
            desktopMode: false,
            targetPosition: position,
            targetRotationY: rotationY,
            monitorRect: null,
            pendingZoom: null,
        });
    }, []);

    const enterDesktopMode = useCallback((rect: MonitorRect) => {
        setState(prev => ({
            ...prev,
            isZooming: false,
            desktopMode: true,
            monitorRect: rect,
        }));
    }, []);

    const updateMonitorRect = useCallback((rect: MonitorRect) => {
        setState(prev => ({
            ...prev,
            monitorRect: rect,
        }));
    }, []);

    const exitDesktopMode = useCallback(() => {
        // Start reverse zoom: keep desktopMode true so CameraZoomEffect
        // knows to zoom OUT (direction is determined by desktopMode flag).
        // Clear monitorRect to hide the overlay immediately.
        setState(prev => ({
            ...prev,
            isZooming: true,
            monitorRect: null,
        }));
    }, []);

    const completeExit = useCallback(() => {
        setState({
            isZooming: false,
            desktopMode: false,
            targetPosition: null,
            targetRotationY: 0,
            monitorRect: null,
            pendingZoom: null,
        });
    }, []);

    const requestZoomToDevice = useCallback((position: [number, number, number], rotationY: number) => {
        setState(prev => ({
            ...prev,
            pendingZoom: { position, rotationY },
        }));
    }, []);

    const consumePendingZoom = useCallback(() => {
        setState(prev => ({
            ...prev,
            pendingZoom: null,
        }));
    }, []);

    return (
        <ScreenTransitionContext.Provider
            value={{
                ...state,
                startZoom,
                enterDesktopMode,
                updateMonitorRect,
                exitDesktopMode,
                completeExit,
                requestZoomToDevice,
                consumePendingZoom,
                savedCameraState,
            }}
        >
            {children}
        </ScreenTransitionContext.Provider>
    );
}

export function useScreenTransition() {
    const ctx = useContext(ScreenTransitionContext);
    if (!ctx) {
        throw new Error('useScreenTransition must be used within ScreenTransitionProvider');
    }
    return ctx;
}
