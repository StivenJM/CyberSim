import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js"
import type { EstudiantePublic } from "../../domain/models/Estudiante.js"
import type { ProfesorPublic } from "../../domain/models/Profesor.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export interface LoginResult {
  role: 'estudiante' | 'profesor'
  user: EstudiantePublic | ProfesorPublic
  token: string
  confirmado: boolean
}

export class LoginUseCase {
  constructor(
    private repo: IAuthRepository,
    private jwtSecret: string
  ) {}

  async execute(correo_electronico: string, contrasenia: string): Promise<LoginResult | null> {
    // 1. Buscar el usuario_auth por email
    const usuarioAuth = await this.repo.findUsuarioAuthByEmail(correo_electronico)
    
    if (!usuarioAuth) {
      return null
    }

    // 2. Verificar la contraseña
    const match = await bcrypt.compare(contrasenia, usuarioAuth.contrasenia_hash)
    
    if (!match) {
      return null
    }

    // 3. Buscar si es profesor
    const profesor = await this.repo.findProfesorByUsuarioAuth(usuarioAuth.id_usuario_auth)
    
    if (profesor) {
      const token = jwt.sign(
        { 
          id_usuario_auth: usuarioAuth.id_usuario_auth,
          id_profesor: profesor.id_profesor, 
          role: "profesor" 
        },
        this.jwtSecret,
        { expiresIn: "1h" }
      )

      return {
        role: "profesor",
        user: profesor,
        token,
        confirmado: usuarioAuth.confirmado
      }
    }

    // 5. Buscar si es estudiante
    const estudiante = await this.repo.findEstudianteByUsuarioAuth(usuarioAuth.id_usuario_auth)
    
    if (estudiante) {
      const token = jwt.sign(
        { 
          id_usuario_auth: usuarioAuth.id_usuario_auth,
          id_estudiante: estudiante.id_estudiante, 
          role: "estudiante" 
        },
        this.jwtSecret,
        { expiresIn: "1h" }
      )

      return {
        role: "estudiante",
        user: estudiante,
        token,
        confirmado: usuarioAuth.confirmado
      }
    }

    // 6. Si existe usuario_auth pero no es ni profesor ni estudiante
    throw new Error('Usuario encontrado pero sin rol asignado')
  }
}
