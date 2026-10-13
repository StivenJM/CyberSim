import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { EscenarioController } from '../../../../ecs/controllers/EscenarioController';
import type { FaseComponent } from '../../../../ecs/components/FaseComponent';
import { EventosPublicos, MensajesGenerales } from '../../../../shared/types/EventosEnums';
import { useModal } from '../../../common/contexts/ModalContext';
import { useEscenarioActual } from '../../../common/contexts/EscenarioContext';
import ModalResultadoFase from '../components/ModalResultadoFase';

export interface Objetivo {
    descripcion: string;
    completado: boolean;
}

export interface Fase {
    id: number;
    nombre: string;
    descripcion: string;
    objetivos: Objetivo[];
    completada: boolean;
    faseActual: boolean;
}

interface FasesContextType {
    fases: Fase[];
    faseActualIndex: number;
    actualizarFases: () => void;
}

const FasesContext = createContext<FasesContextType | undefined>(undefined);

export const useFasesContext = () => {
    const context = useContext(FasesContext);
    if (!context) {
        throw new Error('useFasesContext debe ser usado dentro de un FasesProvider');
    }
    return context;
};

interface FasesProviderProps {
    children: ReactNode;
}

export const FasesProvider = ({ children }: FasesProviderProps) => {
    const [fases, setFases] = useState<Fase[]>([]);
    const [faseActualIndex, setFaseActualIndex] = useState(0);
    const { openModal } = useModal();
    const escenario = useEscenarioActual();

    const convertirFaseComponentAFase = (faseComponent: FaseComponent): Fase => {
        return {
            id: faseComponent.id,
            nombre: faseComponent.nombre,
            descripcion: faseComponent.descripcion,
            objetivos: faseComponent.objetivos.map((obj) => ({
                descripcion: obj.descripcion,
                completado: obj.completado,
            })),
            completada: faseComponent.completada,
            faseActual: faseComponent.faseActual,
        };
    };

    const actualizarFases = () => {
        const controller = EscenarioController.getInstance();
        const fasesECS = controller.getFasesConObjetivos();

        if (fasesECS && fasesECS.length > 0) {
            const fasesConvertidas = fasesECS.map(convertirFaseComponentAFase);
            setFases(fasesConvertidas);

            const indexActual = fasesConvertidas.findIndex((f) => f.faseActual);
            if (indexActual !== -1) {
                setFaseActualIndex(indexActual);
            }
        }
    };

    useEffect(() => {
        // Resetear estados al cambiar de escenario
        setFases([]);
        setFaseActualIndex(0);

        actualizarFases();

        const controller = EscenarioController.getInstance();

        const unsubscribeFaseCompletada = controller.on(EventosPublicos.FASE_COMPLETADA, () => {
            setTimeout(() => actualizarFases(), 100);
        });

        const unsubscribeObjetivoCompletado = controller.on('objetivo:completado' as EventosPublicos, () => {
            setTimeout(() => actualizarFases(), 100);
        });

        // Cuando una fase no se completa, directamente "pierde"
        const unsubscribeFaseNoCompletada = controller.on(EventosPublicos.FASE_NO_COMPLETADA, (data: unknown) => {
            setTimeout(() => {
                actualizarFases();
                const mensaje = (data as string) || MensajesGenerales.MSJ_FASE_NO_COMPLETADA;
                openModal(
                    <ModalResultadoFase tipo="fallo" mensaje={mensaje} />,
                    undefined,
                    false,
                    false
                );
            }, 100);
        });

        // Cuando "gana"
        const unsubscribeEscenarioCompletado = controller.on(EventosPublicos.ESCENARIO_COMPLETADO, (data: unknown) => {
            setTimeout(() => {
                actualizarFases();
                const mensaje = (data as string) || '¡Has completado exitosamente todos los objetivos del escenario! Excelente trabajo en la configuración y seguridad de la red.';
                openModal(
                    <ModalResultadoFase tipo="exito" mensaje={mensaje} />,
                    undefined,
                    false,
                    false
                );
            }, 100);
        });

        return () => {
            unsubscribeFaseCompletada();
            unsubscribeObjetivoCompletado();
            unsubscribeFaseNoCompletada();
            unsubscribeEscenarioCompletado();
        };
    }, [openModal, escenario.id]);

    return (
        <FasesContext.Provider
            value={{
                fases,
                faseActualIndex,
                actualizarFases,
            }}
        >
            {children}
        </FasesContext.Provider>
    );
};
