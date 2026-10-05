import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API_BASE_URL } from '../../../common/utils/apiConfig';

export interface GrupoInfo {
    id_curso: number;
    nombre: string;
    nombre_profesor: string;
}

interface EstudianteGrupoContextType {
    grupo: GrupoInfo | null;
    loading: boolean;
    refetch: () => Promise<void>;
}

const EstudianteGrupoContext = createContext<EstudianteGrupoContextType | undefined>(undefined);

function getStudentId(): number | null {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        return user.id_estudiante ?? null;
    } catch {
        return null;
    }
}

interface EstudianteGrupoProviderProps {
    children: ReactNode;
}

/**
 * Provider que carga el grupo del estudiante una sola vez y lo comparte
 * entre las rutas dentro de EstudianteLayout (/seleccion-niveles, /perfil).
 * Evita refetches al navegar entre ellas.
 */
export function EstudianteGrupoProvider({ children }: EstudianteGrupoProviderProps) {
    const idEstudiante = getStudentId();
    const [grupo, setGrupo] = useState<GrupoInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(idEstudiante !== null);

    const fetchGrupo = useCallback(async () => {
        if (!idEstudiante) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/groups/estudiante/${idEstudiante}`);
            if (!res.ok) throw new Error('Error al obtener grupo');
            const result = await res.json();
            const list: GrupoInfo[] = result.data || [];
            setGrupo(list.length > 0 ? list[0] : null);
        } catch {
            setGrupo(null);
        } finally {
            setLoading(false);
        }
    }, [idEstudiante]);

    useEffect(() => {
        fetchGrupo();
    }, [fetchGrupo]);

    return (
        <EstudianteGrupoContext.Provider value={{ grupo, loading, refetch: fetchGrupo }}>
            {children}
        </EstudianteGrupoContext.Provider>
    );
}

export function useEstudianteGrupo(): EstudianteGrupoContextType {
    const context = useContext(EstudianteGrupoContext);
    if (context === undefined) {
        throw new Error('useEstudianteGrupo debe ser usado dentro de un EstudianteGrupoProvider');
    }
    return context;
}
