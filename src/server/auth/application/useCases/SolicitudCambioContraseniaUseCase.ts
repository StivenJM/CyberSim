import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js"
import type { EmailService } from "../../infrastructure/service/EmailService.js"
import { randomBytes } from "crypto"

export class SolicitudCambioContraseniaUseCase {
  constructor(
    private repo: IAuthRepository,
    private emailService: EmailService
  ) {}

  async execute(correo_electronico: string): Promise<{ success: boolean; message: string }> {
    // Buscar usuario por email
    const usuarioAuth = await this.repo.findUsuarioAuthByEmail(correo_electronico)

    if (!usuarioAuth) {
      // Por seguridad, no revelar si el email existe o no
      return {
        success: true,
        message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña'
      }
    }

    // Verificar que la cuenta esté confirmada
    if (!usuarioAuth.confirmado) {
      throw new Error('Debes confirmar tu cuenta antes de recuperar la contraseña')
    }

    //Generar token de recuperación
    const token_recuperacion = randomBytes(32).toString('hex')
    const token_expira = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // 1 hora

    //Actualizar token en la base de datos
    await this.repo.updateTokenRecuperacion(
      usuarioAuth.id_usuario_auth,
      token_recuperacion,
      token_expira
    )

    //Buscar nombre del usuario (estudiante o profesor)
    let nombreCompleto = 'Usuario'
    
    const estudiante = await this.repo.findEstudianteByUsuarioAuth(usuarioAuth.id_usuario_auth)
    if (estudiante) {
      nombreCompleto = `${estudiante.primernombre} ${estudiante.primer_apellido}`
    } else {
      const profesor = await this.repo.findProfesorByUsuarioAuth(usuarioAuth.id_usuario_auth)
      if (profesor) {
        nombreCompleto = `${profesor.primernombre} ${profesor.primer_apellido}`
      }
    }

    //Enviar email de recuperación
    try {
      await this.emailService.sendPasswordResetEmail(
        correo_electronico,
        token_recuperacion,
        nombreCompleto
      )
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error)
      throw new Error('No se pudo enviar el email de recuperación')
    }

    return {
      success: true,
      message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña'
    }
  }
}
