import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { ReactNode } from 'react';
import type { Dispositivo, Escenario } from '../../../shared/types/EscenarioTypes';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../../../shared/types/DeviceEnums';
import { EscenarioController } from '../../../ecs/controllers/EscenarioController';
import {
    DispositivoComponent,
    WorkstationComponent,
    TransformComponent,
} from '../../../ecs/components';
import { ComponenteContainer } from '../../../ecs/core/Componente';
import { useSelectedLevel } from './SelectedLevelContext';

/**
 * Shape mínimo de los datos de un dispositivo provenientes del ECS.
 * Los valores llegan tipados como `unknown` porque se originan en estructuras
 * dinámicas del builder; se narrow-ean al construir el `Dispositivo`.
 */
interface DispositivoRaw {
    tipo?: unknown;
    nombre?: unknown;
    sistemaOperativo?: unknown;
    hardware?: unknown;
    software?: unknown;
    estadoAtaque?: unknown;
}

/**
 * Forma de la entidad que emite `ECSSceneRenderer` al seleccionar un objeto 3D.
 * `entidadCompleta` se tipa como `unknown` porque proviene del builder dinámico y
 * solo se reconoce con `instanceof ComponenteContainer`.
 */
export interface ECSEntityRef {
    id?: unknown;
    tipo?: unknown;
    entidadId?: number;
    entidadCompleta?: unknown;
    objetoConTipo?: DispositivoRaw;
    position?: { x: number; y: number; z: number };
}

interface EscenarioContextType {
    escenario: Escenario | null;
    setEscenario: (escenario: Escenario) => void;
    dispositivoSeleccionado: Dispositivo | null;
    // Acepta un Dispositivo ya normalizado, null, o una entidad/objeto proveniente del ECS
    setDispositivoSeleccionado: (dispositivo: Dispositivo | ECSEntityRef | null) => void;
    // ID de la entidad seleccionada (puede ser dispositivo o espacio)
    entidadSeleccionadaId: number | null;
}

function hasDispositivoShape(raw: ECSEntityRef): raw is ECSEntityRef & { id: number; tipo: TipoDispositivo } {
    return typeof raw.id !== 'undefined' && typeof raw.tipo !== 'undefined';
}

function toDispositivoFromRaw(
    entidadId: number,
    raw: DispositivoRaw,
    posicion: Dispositivo['posicion'],
): Dispositivo {
    return {
        id: entidadId,
        entidadId,
        tipo: raw.tipo as TipoDispositivo,
        nombre: raw.nombre as string | undefined,
        sistemaOperativo: raw.sistemaOperativo as string | undefined,
        hardware: (raw.hardware as string) ?? "",
        software: raw.software as string | undefined,
        posicion,
        estadoAtaque: raw.estadoAtaque as EstadoAtaqueDispositivo,
        activos: [],
    };
}

function mapEntityToDispositivo(input: Dispositivo | ECSEntityRef | null): Dispositivo | null {
    if (!input) return null;

    const raw = input as ECSEntityRef;

    if (hasDispositivoShape(raw)) {
        return input as Dispositivo;
    }

    const entidadId = raw.entidadId ?? 0;

    if (raw.entidadCompleta instanceof ComponenteContainer) {
        const container = raw.entidadCompleta;
        const dispComp = container.get(DispositivoComponent);
        const transform = container.get(TransformComponent);

        if (!dispComp) {
            if (raw.objetoConTipo) {
                return toDispositivoFromRaw(entidadId, raw.objetoConTipo, raw.position);
            }
            return null;
        }

        const posicion = transform
            ? { x: transform.x, y: transform.y, z: transform.z, rotacionY: transform.rotacionY }
            : raw.position;

        const dispositivo = toDispositivoFromRaw(entidadId, dispComp as DispositivoRaw, posicion);

        const ws = container.get(WorkstationComponent);
        if (ws && typeof ws.configuraciones !== 'undefined') {
            dispositivo.configuraciones = ws.configuraciones;
        }

        return dispositivo;
    }

    if (raw.objetoConTipo) {
        return toDispositivoFromRaw(entidadId, raw.objetoConTipo, raw.position);
    }

    return null;
}

/**
 * Context para gestionar globalmente al escenario actual en toda la aplicación
*/
const EscenarioContext = createContext<EscenarioContextType | undefined>(undefined);

interface EscenarioProviderProps {
    children: ReactNode;
    initialEscenario?: Escenario;
}

/**
 * Envuelve la aplicación y proporciona el estado del escenario
 */
export function EscenarioProvider({ children, initialEscenario }: EscenarioProviderProps) {
    const { selectedEscenario } = useSelectedLevel();
    const navigate = useNavigate();
    const [escenario, setEscenarioState] = useState<Escenario | null>(selectedEscenario ?? initialEscenario ?? null);
    // Estado real
    const [dispositivoSeleccionado, setDispositivoSeleccionadoState] = useState<Dispositivo | null>(null);
    // ID de la entidad seleccionada (dispositivo o espacio)
    const [entidadSeleccionadaId, setEntidadSeleccionadaId] = useState<number | null>(null);

    useEffect(() => {
        if (selectedEscenario) {
            setEscenarioState(selectedEscenario);
            // Resetear dispositivo seleccionado al cambiar de escenario
            setDispositivoSeleccionadoState(null);
            setEntidadSeleccionadaId(null);
        }
    }, [selectedEscenario]);

    // Redirigir a selección de niveles si no hay escenario
    useEffect(() => {
        if (!escenario) {
            EscenarioController.reset();
            navigate('/seleccion-niveles');
        }
    }, [escenario, navigate]);

    const setEscenario = useCallback((nuevoEscenario: Escenario) => {
        setEscenarioState(nuevoEscenario);
    }, []);

    const setDispositivoSeleccionado = useCallback((dispositivo: Dispositivo | ECSEntityRef | null) => {
        const mapped = mapEntityToDispositivo(dispositivo);
        setDispositivoSeleccionadoState(mapped);

        if (!dispositivo) {
            setEntidadSeleccionadaId(null);
            return;
        }

        const id = (dispositivo as ECSEntityRef).entidadId;
        setEntidadSeleccionadaId(typeof id === 'number' ? id : null);
    }, []);

    const contextValue = useMemo(() => ({
        escenario,
        setEscenario,
        dispositivoSeleccionado,
        setDispositivoSeleccionado,
        entidadSeleccionadaId,
    }), [escenario, setEscenario, dispositivoSeleccionado, setDispositivoSeleccionado, entidadSeleccionadaId]);

    if (!escenario) {
        return null;
    }

    return (
        <EscenarioContext.Provider value={contextValue}>
            {children}
        </EscenarioContext.Provider>
    );
}

/**
 * Hook personalizado para usar el contexto de escenario
 * Lanza error si se usa fuera del Provider
 * 
 * @returns El contexto del escenario con el escenario actual y función para actualizarlo
 * @throws Error si se usa fuera del EscenarioProvider
 * 
 * @example
 * const { escenario, setEscenario } = useEscenario();
 */

export function useEscenario(): EscenarioContextType {
    const context = useContext(EscenarioContext);

    if (context === undefined) {
        throw new Error('useEscenario debe ser usado dentro de un EscenarioProvider');
    }

    return context;
}

/**
 * Hook para obtener solo el escenario actual (sin función de actualización)
 * 
 * @returns El escenario actual
 * 
 * @example
 * const escenario = useEscenarioActual();
 */

export function useEscenarioActual(): Escenario {
    const { escenario } = useEscenario();
    if (!escenario) {
        throw new Error('No hay escenario cargado. Asegúrate de seleccionar un nivel primero.');
    }
    return escenario;
}
