export interface Progreso {
	id_progreso: number
	id_estudiante: number
	slug_escenario: string
	terminado: boolean
	tiempo: number
	acciones: string
	id_revision_escenario?: string | null
}

export type ProgresoInput = Omit<Progreso, 'id_progreso'> & {
	revision_escenario?: number
	content_hash_escenario?: string
}

export interface ProgresoConNombreEscenario {
	id_progreso: number
	id_estudiante: number
	slug_escenario: string
	nombre_escenario: string
	terminado: boolean
	tiempo: number | null
	acciones: string
	fecha_creacion: string | null
	revision_escenario: number | null
	content_hash_escenario: string | null
}

export interface ProgresoResumen {
	terminado: boolean
	intentos: number
}
