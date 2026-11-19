import type { ReactNode } from 'react'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { API_BASE_URL } from '../../../common/utils/apiConfig'

export interface ProgresoEscenario {
	id_progreso: number
	id_estudiante: number
	slug_escenario: string
	nombre_escenario: string
	terminado: boolean
	tiempo: number | null
}

interface ProgresoEstudianteContextType {
	progresos: ProgresoEscenario[]
	loading: boolean
	error: string | null
	refetch: () => Promise<void>
}

const ProgresoEstudianteContext = createContext<
	ProgresoEstudianteContextType | undefined
>(undefined)

function getStudentId(): number | null {
	try {
		const userStr = localStorage.getItem('user')
		if (!userStr) return null
		const user = JSON.parse(userStr)
		return user.id_estudiante ?? null
	} catch {
		return null
	}
}

interface ProgresoEstudianteProviderProps {
	children: ReactNode
}

/**
 * Carga el progreso del estudiante una sola vez por sesión de navegación y lo
 * comparte con la cabecera (progreso del curso) y el mapa de niveles (estado de
 * cada nodo, resumen y sugerencia). Evita que cada consumidor haga su propia
 * petición y que la cabecera y el mapa muestren cifras distintas.
 */
export function ProgresoEstudianteProvider({
	children,
}: ProgresoEstudianteProviderProps) {
	const idEstudiante = getStudentId()
	const [progresos, setProgresos] = useState<ProgresoEscenario[]>([])
	const [loading, setLoading] = useState<boolean>(idEstudiante !== null)
	const [error, setError] = useState<string | null>(null)

	const fetchProgresos = useCallback(async () => {
		if (!idEstudiante) {
			setProgresos([])
			setLoading(false)
			return
		}
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(
				`${API_BASE_URL}/progreso/estudiante/${idEstudiante}`,
			)
			if (!res.ok) throw new Error('No se pudo cargar tu progreso')
			const result = await res.json()
			if (!result.success) throw new Error('No se pudo cargar tu progreso')
			setProgresos((result.data ?? []) as ProgresoEscenario[])
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'No se pudo cargar tu progreso',
			)
		} finally {
			setLoading(false)
		}
	}, [idEstudiante])

	useEffect(() => {
		void fetchProgresos()
	}, [fetchProgresos])

	return (
		<ProgresoEstudianteContext.Provider
			value={{ progresos, loading, error, refetch: fetchProgresos }}
		>
			{children}
		</ProgresoEstudianteContext.Provider>
	)
}

export function useProgresoEstudiante(): ProgresoEstudianteContextType {
	const context = useContext(ProgresoEstudianteContext)
	if (context === undefined) {
		throw new Error(
			'useProgresoEstudiante debe ser usado dentro de un ProgresoEstudianteProvider',
		)
	}
	return context
}
