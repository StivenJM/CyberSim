import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js"

export class ConfirmarEmailUseCase {
  constructor(private repo: IAuthRepository) {}

  async execute(token: string): Promise<{ success: boolean; message: string }> {
    //Buscar usuario por token
    const usuarioAuth = await this.repo.findUsuarioAuthByToken(token)

    if (!usuarioAuth) {
      throw new Error('Token de confirmación inválido')
    }

    //Verificar si ya está confirmado
    if (usuarioAuth.confirmado) {
      return {
        success: true,
        message: 'La cuenta ya está confirmada'
      }
    }

    //Verificar si el token expiró
    if (usuarioAuth.token_expira) {
      const expiraDate = new Date(usuarioAuth.token_expira)
      if (expiraDate < new Date()) {
        throw new Error('El token de confirmación ha expirado. Por favor, solicita un nuevo correo de confirmación.')
      }
    }

    //Confirmar la cuenta
    await this.repo.confirmUsuarioAuth(usuarioAuth.id_usuario_auth)

    return {
      success: true,
      message: 'Cuenta confirmada exitosamente. Ya puedes iniciar sesión.'
    }
  }
}