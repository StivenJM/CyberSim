export interface Curso {
  id_curso: number
  id_profesor: number
  nombre: string
  codigo_acceso: string | null
  codigo_expira: Date | null
}

export type CursoCreateInput = Pick<Curso, 'id_profesor' | 'nombre'>

// Tipo para actualizar curso
export interface CursoUpdate {
  id_profesor?: number
  nombre?: string
}

export interface DeleteResult {
  success: boolean
  message: string
}