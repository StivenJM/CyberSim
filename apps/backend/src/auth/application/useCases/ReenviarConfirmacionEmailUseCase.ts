import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js"
import type { EmailService } from "../../infrastructure/service/EmailService.js"
import { randomBytes } from "crypto"

export class ReenviarConfirmacionEmailUseCase {
  constructor(
    private repo: IAuthRepository,
    private emailService: EmailService
  ) {}

  async execute(correo_electronico: string): Promise<{ success: boolean; message: string }> {
    // 1. Buscar usuario por email
    const usuarioAuth = await this.repo.findUsuarioAuthByEmail(correo_electronico)

    if (!usuarioAuth) {
      throw new Error('No existe una cuenta con ese correo electrónico')
    }

    // 2. Verificar si ya está confirmado
    if (usuarioAuth.confirmado) {
      throw new Error('Esta cuenta ya está confirmada')
    }

    // 3. Generar nuevo token
    const token_confirmacion = randomBytes(32).toString('hex')
    const token_expira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // 4. Actualizar token en la base de datos
    await this.repo.updateTokenConfirmacion(
      usuarioAuth.id_usuario_auth,
      token_confirmacion,
      token_expira
    )

    // 5. Buscar nombre del usuario (estudiante o profesor)
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

    // 6. Enviar email
    await this.emailService.sendConfirmationEmail(
      correo_electronico,
      token_confirmacion,
      nombreCompleto
    )

    return {
      success: true,
      message: 'Correo de confirmación reenviado exitosamente'
    }
  }
}
