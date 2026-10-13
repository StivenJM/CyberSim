import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js"
import bcrypt from "bcrypt"

export class CambiarContraseniaUseCase {
  constructor(private repo: IAuthRepository) {}

  async execute(token: string, nuevaContrasenia: string): Promise<{ success: boolean; message: string }> {
    // 1. Buscar usuario por token de recuperación
    const usuarioAuth = await this.repo.findUsuarioAuthByRecoveryToken(token)

    if (!usuarioAuth) {
      throw new Error('Token de recuperación inválido')
    }

    // 2. Verificar si el token expiró
    if (usuarioAuth.token_expira) {
      const expiraDate = new Date(usuarioAuth.token_expira)
      if (expiraDate < new Date()) {
        throw new Error('El token de recuperación ha expirado. Por favor, solicita un nuevo enlace.')
      }
    } else {
      throw new Error('Token de recuperación inválido')
    }

    // 3. Validar la nueva contraseña
    if (!nuevaContrasenia || nuevaContrasenia.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }

    // 4. Hash de la nueva contraseña
    const contrasenia_hash = await bcrypt.hash(nuevaContrasenia, 10)

    // 5. Actualizar la contraseña y limpiar tokens
    await this.repo.updatePassword(usuarioAuth.id_usuario_auth, contrasenia_hash)

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    }
  }
}