import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

interface ModalContextType {
    isOpen: boolean;
    modalContent: ReactNode | null;
    modalTitle: string | null;
    dismissible: boolean;
    showHeader: boolean;
    openModal: (content: ReactNode, title?: string, dismissible?: boolean, showHeader?: boolean) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
    children: ReactNode;
}

/**
 * Provider que gestiona el estado global del modal
 */
export function ModalProvider({ children }: ModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const [modalTitle, setModalTitle] = useState<string | null>(null);
    const [dismissible, setDismissible] = useState(true);
    const [showHeader, setShowHeader] = useState(true);
    const { pathname } = useLocation();

    const openModal = useCallback((content: ReactNode, title?: string, isDismissible: boolean = true, hasHeader: boolean = true) => {
        setModalContent(content);
        setModalTitle(title || null);
        setDismissible(isDismissible);
        setShowHeader(hasHeader);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            setModalContent(null);
            setModalTitle(null);
            setDismissible(true);
            setShowHeader(true);
        }, 300);
    }, []);

    // Cerrar el modal al navegar entre páginas (ej. de oficina a redes/partida)
    useEffect(() => {
        setIsOpen(false);
        setModalContent(null);
        setModalTitle(null);
        setDismissible(true);
        setShowHeader(true);
    }, [pathname]);

    const contextValue = useMemo(() => ({
        isOpen, modalContent, modalTitle, dismissible, showHeader, openModal, closeModal,
    }), [isOpen, modalContent, modalTitle, dismissible, showHeader, openModal, closeModal]);

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
        </ModalContext.Provider>
    );
}

/**
 * Hook para usar el contexto del modal
 * 
 * @example
 * const { openModal, closeModal } = useModal();
 * 
 * // Abrir modal con contenido personalizado y título
 * openModal(<ModalFirewall />, 'Configuración de Firewall');
 * 
 * // Abrir modal sin título
 * openModal(<ModalFirewall />);
 * 
 * // Cerrar modal
 * closeModal();
 */
export function useModal(): ModalContextType {
    const context = useContext(ModalContext);

    if (context === undefined) {
        throw new Error('useModal debe ser usado dentro de un ModalProvider');
    }

    return context;
}
