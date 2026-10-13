import React, { useEffect, useRef } from 'react';
import './RadialMenu.css';

interface RadialMenuProps {
    onClose: () => void;
    options: Array<{
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
        to?: string; // Ruta opcional para navegación
    }>;
    onNavigate?: (path: string) => void; // Callback opcional para navegación
    /** Modo "no accesible": muestra un aviso inerte en vez de las opciones. */
    blocked?: boolean;
    blockedMessage?: string;
}

/**
 * Menú radial vertical estilo Blender
 * Aparece en forma de arco con botones distribuidos radialmente
 */
const RadialMenu: React.FC<RadialMenuProps> = ({ onClose, options, onNavigate, blocked = false, blockedMessage }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Pequeño delay para evitar que el click que abre el menú lo cierre inmediatamente
        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }, 100);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    // Calcular ángulos para distribuir los botones en un arco vertical
    // El tamaño del arco se ajusta según la cantidad de opciones
    const getArcSize = (count: number) => {
        if (count === 1) return 0;
        if (count === 2) return Math.PI / 3; // 60 grados
        if (count === 3) return Math.PI / 2; // 90 grados
        if (count === 4) return (2 * Math.PI) / 3; // 120 grados
        return Math.PI; // 180 grados para 5 o más opciones
    };

    const arcSize = getArcSize(options.length);
    const arcStart = -arcSize / 2;
    const arcEnd = arcSize / 2;
    const angleStep = options.length > 1 ? (arcEnd - arcStart) / (options.length - 1) : 0;

    return (
        <>
            <div className="radial-menu-overlay" onClick={onClose} aria-hidden="true" />
            <div
                ref={menuRef}
                className="radial-menu-container"
                role="menu"
                aria-label="Menú de acciones"
            >
                {blocked ? (
                    <div className="radial-menu-blocked" role="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M4.929 4.929 19.07 19.071" />
                        </svg>
                        <span>{blockedMessage ?? 'Dispositivo no accesible'}</span>
                    </div>
                ) : (
                <>
                <div className="radial-menu-center-dot" aria-hidden="true" />
                {options.map((option, index) => {
                    const angle = arcStart + (angleStep * index);
                    const translateX = Math.sin(angle) * 120;
                    const translateY = -Math.cos(angle) * 120;

                    return (
                        <div
                            key={index}
                            className="radial-menu-button"
                            role="menuitem"
                            tabIndex={0}
                            style={{
                                transform: `translate(-50%, -50%) translate(${translateX}px, ${translateY}px)`,
                                animationDelay: `${index * 0.05}s`
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();

                                if (option.to && onNavigate) {
                                    onNavigate(option.to);
                                } else {
                                    option.onClick();
                                }
                                onClose();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    if (option.to && onNavigate) {
                                        onNavigate(option.to);
                                    } else {
                                        option.onClick();
                                    }
                                    onClose();
                                }
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M10.6667 5.60016L4.73337 11.5335C4.61114 11.6557 4.45559 11.7168 4.2667 11.7168C4.07781 11.7168 3.92225 11.6557 3.80003 11.5335C3.67781 11.4113 3.6167 11.2557 3.6167 11.0668C3.6167 10.8779 3.67781 10.7224 3.80003 10.6002L9.73337 4.66683H4.6667C4.47781 4.66683 4.31959 4.60283 4.19203 4.47483C4.06448 4.34683 4.00048 4.18861 4.00003 4.00016C3.99959 3.81172 4.06359 3.6535 4.19203 3.5255C4.32048 3.3975 4.4787 3.3335 4.6667 3.3335H11.3334C11.5223 3.3335 11.6807 3.3975 11.8087 3.5255C11.9367 3.6535 12.0005 3.81172 12 4.00016V10.6668C12 10.8557 11.936 11.0142 11.808 11.1422C11.68 11.2702 11.5218 11.3339 11.3334 11.3335C11.1449 11.3331 10.9867 11.2691 10.8587 11.1415C10.7307 11.0139 10.6667 10.8557 10.6667 10.6668V5.60016Z" fill="white" />
                            </svg>
                            <span>{option.label}</span>
                        </div>
                    );
                })}
                </>
                )}
            </div>
        </>
    );
};

export default RadialMenu;
