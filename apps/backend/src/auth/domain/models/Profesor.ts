export interface Profesor {
  id_profesor: number
  id_usuario_auth: number
  primernombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
}

export type ProfesorInput = Omit<Profesor, 'id_profesor'>
export type ProfesorPublic = Profesor
