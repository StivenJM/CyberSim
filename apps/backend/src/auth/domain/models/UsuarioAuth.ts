export interface UsuarioAuth {
  id_usuario_auth: number
  correo_electronico: string
  contrasenia_hash: string
  confirmado: boolean
  token_confirmacion?: string
  token_recuperacion?: string
  token_expira?: string
  creado_en: string
}

export type UsuarioAuthInput = Omit<UsuarioAuth,'id_usuario_auth' | 'confirmado' | 'creado_en'>
