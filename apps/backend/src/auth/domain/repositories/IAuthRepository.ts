import type { Estudiante, EstudianteInput, EstudiantePublic } from "../models/Estudiante.js"
import type { Profesor, ProfesorInput } from "../models/Profesor.js"
import type { UsuarioAuth, UsuarioAuthInput } from "../models/UsuarioAuth.js"

export interface IAuthRepository {

  createUsuarioAuth(data: UsuarioAuthInput): Promise<UsuarioAuth>
  findUsuarioAuthByEmail(correo_electronico: string): Promise<UsuarioAuth | null>
  findUsuarioAuthById(id_usuario_auth: number): Promise<UsuarioAuth | null>
  findUsuarioAuthByToken(token: string): Promise<UsuarioAuth | null>
  findUsuarioAuthByRecoveryToken(token: string): Promise<UsuarioAuth | null>
  confirmUsuarioAuth(id_usuario_auth: number): Promise<void>
  updateTokenRecuperacion(id_usuario_auth: number, token: string, expira: string): Promise<void>
  updateTokenConfirmacion(id_usuario_auth: number, token: string, expira: string): Promise<void>
  updatePassword(id_usuario_auth: number, nuevaContrasenia: string): Promise<void>

  createEstudiante(data: EstudianteInput & { id_usuario_auth: number }): Promise<Estudiante>
  findEstudianteByUsuarioAuth(id_usuario_auth: number): Promise<Estudiante | null>
  findEstudianteById(id_estudiante: number): Promise<Estudiante | null>
  findEstudiantesByProfesor(id_profesor: number): Promise<EstudiantePublic[]>
  findEstudianteByCodigoUnico(codigo_unico: number): Promise<Estudiante | null>
  

  createProfesor(data: ProfesorInput & { id_usuario_auth: number }): Promise<Profesor>
  findProfesorByUsuarioAuth(id_usuario_auth: number): Promise<Profesor | null>
}
