export interface Estudiante {
  id_estudiante: number
  id_usuario_auth: number | null
  codigo_unico: number
  primernombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
}

export type EstudianteInput = Omit<Estudiante, 'id_estudiante'>
export type EstudiantePublic = Estudiante & { correo_electronico?: string }