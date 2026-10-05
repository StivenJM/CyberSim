import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import styles from "../styles/VentanaOS.module.css";
import { useOSTheme } from "../context/OSThemeContext";

export type SnapZone = "left" | "right" | "top" | null;

interface VentanaOSProps {
    titulo: string;
    children: ReactNode;
    onClose: () => void;
    onMinimize?: () => void;
    onFocus?: () => void;
    onSnapZoneChange?: (zone: SnapZone) => void;
    icono?: ReactNode;
    initialPosition?: { x: number; y: number };
    initialSize?: { width: number; height: number };
    initialMaximized?: boolean;
    zIndex?: number;
    hidden?: boolean;
}

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const SNAP_EDGE_THRESHOLD = 8;

export default function VentanaOS({
    titulo,
    children,
    onClose,
    onMinimize,
    onFocus,
    onSnapZoneChange,
    icono,
    initialPosition,
    initialSize,
    initialMaximized = false,
    zIndex = 10,
    hidden = false,
}: VentanaOSProps) {
    const os = useOSTheme();
    const [position, setPosition] = useState(initialPosition ?? { x: 80, y: 40 });
    const [size, setSize] = useState(initialSize ?? { width: window.innerWidth * 0.7, height: window.innerHeight * 0.7 });
    const [isMaximized, setIsMaximized] = useState(initialMaximized);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [snapState, setSnapState] = useState<"left" | "right" | null>(null);
    const [isSnapping, setIsSnapping] = useState(false);
    const resizeDir = useRef<ResizeDir | null>(null);
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, posX: 0, posY: 0 });
    const ventanaRef = useRef<HTMLDivElement>(null);
    const preMaximizeState = useRef({ position: { x: 80, y: 40 }, size: { width: window.innerWidth * 0.7, height: window.innerHeight * 0.7 } });
    const preSnapState = useRef<{ position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
    const activeSnapZoneRef = useRef<SnapZone>(null);
    const onSnapZoneChangeRef = useRef(onSnapZoneChange);
    onSnapZoneChangeRef.current = onSnapZoneChange;

    const applySnap = (zone: SnapZone) => {
        if (!zone || !ventanaRef.current) return;
        const parent = ventanaRef.current.parentElement;
        if (!parent) return;
        const parentRect = parent.getBoundingClientRect();

        // Store pre-snap state (only if not already snapped/maximized)
        if (!snapState && !isMaximized) {
            preSnapState.current = { position: { ...position }, size: { ...size } };
        }

        setIsSnapping(true);
        setTimeout(() => setIsSnapping(false), 200);

        if (zone === "top") {
            preMaximizeState.current = preSnapState.current ?? { position: { ...position }, size: { ...size } };
            setIsMaximized(true);
            setSnapState(null);
        } else if (zone === "left") {
            setIsMaximized(false);
            setSnapState("left");
            setPosition({ x: 0, y: 0 });
            setSize({ width: parentRect.width / 2, height: parentRect.height });
        } else if (zone === "right") {
            setIsMaximized(false);
            setSnapState("right");
            setPosition({ x: parentRect.width / 2, y: 0 });
            setSize({ width: parentRect.width / 2, height: parentRect.height });
        }
    };

    const handleMouseDownTitlebar = (e: React.MouseEvent<HTMLDivElement>) => {
        onFocus?.();
        if ((e.target as HTMLElement).closest(`.${styles.botonesVentana}`)) return;

        // Un-snap or un-maximize on drag start
        if (snapState || isMaximized) {
            const rect = ventanaRef.current?.getBoundingClientRect();
            if (!rect) return;
            const parent = ventanaRef.current?.parentElement;
            if (!parent) return;
            const parentRect = parent.getBoundingClientRect();

            const cursorRatioX = (e.clientX - rect.left) / rect.width;
            const restoreSize = preSnapState.current?.size ?? preMaximizeState.current.size;

            const newX = e.clientX - parentRect.left - (restoreSize.width * cursorRatioX);
            const newY = e.clientY - parentRect.top - 18;

            setSize(restoreSize);
            setPosition({
                x: Math.max(0, Math.min(newX, parentRect.width - restoreSize.width)),
                y: Math.max(0, newY)
            });
            setIsMaximized(false);
            setSnapState(null);
            preSnapState.current = null;

            setIsDragging(true);
            setDragOffset({
                x: restoreSize.width * cursorRatioX,
                y: 18
            });
            return;
        }

        setIsDragging(true);
        const rect = ventanaRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleDoubleClickTitlebar = () => {
        toggleMaximize();
    };

    const toggleMaximize = () => {
        if (snapState) {
            // Un-snap: restore to pre-snap state
            const restore = preSnapState.current ?? { position: { ...position }, size: { ...size } };
            setPosition(restore.position);
            setSize(restore.size);
            setSnapState(null);
            preSnapState.current = null;
        } else if (!isMaximized) {
            preMaximizeState.current = { position: { ...position }, size: { ...size } };
            setIsMaximized(true);
        } else {
            setPosition(preMaximizeState.current.position);
            setSize(preMaximizeState.current.size);
            setIsMaximized(false);
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent, dir: ResizeDir) => {
        e.stopPropagation();
        e.preventDefault();
        onFocus?.();
        if (isMaximized || snapState) return;
        setIsResizing(true);
        resizeDir.current = dir;
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            w: size.width,
            h: size.height,
            posX: position.x,
            posY: position.y,
        };
    };

    // Drag
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!ventanaRef.current) return;
            const parent = ventanaRef.current.parentElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();
            const newX = e.clientX - parentRect.left - dragOffset.x;
            const newY = e.clientY - parentRect.top - dragOffset.y;

            setPosition({
                x: Math.max(0, Math.min(newX, parentRect.width - size.width)),
                y: Math.max(0, Math.min(newY, parentRect.height - 40))
            });

            // Detect snap zone
            const mouseXInParent = e.clientX - parentRect.left;
            const mouseYInParent = e.clientY - parentRect.top;

            let detectedZone: SnapZone = null;
            if (mouseYInParent <= SNAP_EDGE_THRESHOLD) {
                detectedZone = "top";
            } else if (mouseXInParent <= SNAP_EDGE_THRESHOLD) {
                detectedZone = "left";
            } else if (mouseXInParent >= parentRect.width - SNAP_EDGE_THRESHOLD) {
                detectedZone = "right";
            }

            if (detectedZone !== activeSnapZoneRef.current) {
                activeSnapZoneRef.current = detectedZone;
                onSnapZoneChangeRef.current?.(detectedZone);
            }
        };

        const handleMouseUp = () => {
            if (activeSnapZoneRef.current) {
                applySnap(activeSnapZoneRef.current);
            }
            activeSnapZoneRef.current = null;
            onSnapZoneChangeRef.current?.(null);
            setIsDragging(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset, size.width]);

    // Resize
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dir = resizeDir.current;
            if (!dir) return;

            const dx = e.clientX - resizeStart.current.x;
            const dy = e.clientY - resizeStart.current.y;
            const MIN_W = 320;
            const MIN_H = 200;

            let newW = resizeStart.current.w;
            let newH = resizeStart.current.h;
            let newX = resizeStart.current.posX;
            let newY = resizeStart.current.posY;

            if (dir.includes("e")) newW = Math.max(MIN_W, resizeStart.current.w + dx);
            if (dir.includes("s")) newH = Math.max(MIN_H, resizeStart.current.h + dy);
            if (dir.includes("w")) {
                const proposed = resizeStart.current.w - dx;
                if (proposed >= MIN_W) {
                    newW = proposed;
                    newX = resizeStart.current.posX + dx;
                }
            }
            if (dir.includes("n")) {
                const proposed = resizeStart.current.h - dy;
                if (proposed >= MIN_H) {
                    newH = proposed;
                    newY = resizeStart.current.posY + dy;
                }
            }

            setSize({ width: newW, height: newH });
            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => setIsResizing(false);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    const isFullscreen = isMaximized || snapState;
    const showSnappingTransition = isSnapping && !isDragging;

    return (
        <div
            ref={ventanaRef}
            className={`${styles.ventana} ${os === "linux" ? styles.linux : ""} ${isMaximized ? styles.ventanaMaximizada : ""} ${snapState ? styles.ventanaSnapped : ""} ${showSnappingTransition ? styles.ventanaSnapping : ""}`}
            style={isMaximized ? { zIndex, display: hidden ? "none" : undefined } : {
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                zIndex,
                display: hidden ? "none" : undefined,
            }}
            onMouseDown={onFocus}
        >
            <div
                className={styles.barraVentana}
                onMouseDown={handleMouseDownTitlebar}
                onDoubleClick={handleDoubleClickTitlebar}
            >
                <div className={styles.tituloVentana}>
                    {icono && <span className={styles.iconoVentana}>{icono}</span>}
                    <span>{titulo}</span>
                </div>
                <div className={styles.botonesVentana}>
                    {onMinimize && (
                        <button className={styles.botonVentana} onClick={onMinimize} title="Minimizar">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                    <button className={styles.botonVentana} onClick={toggleMaximize} title={isFullscreen ? "Restaurar" : "Maximizar"}>
                        {isFullscreen ? (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <rect x="0.75" y="2.75" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                                <path d="M3 2.5V1.5C3 1.22386 3.22386 1 3.5 1H8.5C8.77614 1 9 1.22386 9 1.5V6.5C9 6.77614 8.77614 7 8.5 7H7.5" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        ) : (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1" />
                            </svg>
                        )}
                    </button>
                    <button className={`${styles.botonVentana} ${styles.botonCerrar}`} onClick={onClose} title="Cerrar">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className={styles.contenidoVentana}>
                {children}
            </div>

            {/* Resize handles */}
            {!isMaximized && !snapState && <>
                <div className={`${styles.resizeHandle} ${styles.resizeN}`} onMouseDown={(e) => handleResizeMouseDown(e, "n")} />
                <div className={`${styles.resizeHandle} ${styles.resizeS}`} onMouseDown={(e) => handleResizeMouseDown(e, "s")} />
                <div className={`${styles.resizeHandle} ${styles.resizeE}`} onMouseDown={(e) => handleResizeMouseDown(e, "e")} />
                <div className={`${styles.resizeHandle} ${styles.resizeW}`} onMouseDown={(e) => handleResizeMouseDown(e, "w")} />
                <div className={`${styles.resizeHandle} ${styles.resizeNE}`} onMouseDown={(e) => handleResizeMouseDown(e, "ne")} />
                <div className={`${styles.resizeHandle} ${styles.resizeNW}`} onMouseDown={(e) => handleResizeMouseDown(e, "nw")} />
                <div className={`${styles.resizeHandle} ${styles.resizeSE}`} onMouseDown={(e) => handleResizeMouseDown(e, "se")} />
                <div className={`${styles.resizeHandle} ${styles.resizeSW}`} onMouseDown={(e) => handleResizeMouseDown(e, "sw")} />
            </>}
        </div>
    );
}
