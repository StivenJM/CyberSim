import { randomBytes } from 'node:crypto'
import bcrypt from 'bcrypt'
import type { EstudiantePublic } from '../../domain/models/Estudiante.js'
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository.js'
import type { EmailService } from '../../infrastructure/service/EmailService.js'

interface RegisterEstudiantePayload {
	correo_electronico: string
	contrasenia: string
	codigo_unico: number
	primernombre: string
	segundo_nombre: string
	primer_apellido: string
	segundo_apellido: string
}

const DOMINIOS_PERMITIDOS = [
	'gmail.com',
	'hotmail.com',
	'outlook.com',
	'epn.edu.ec',
]

function validarContrasenia(contrasenia: string): void {
	if (contrasenia.length < 8) {
		throw new Error('La contraseña debe tener al menos 8 caracteres')
	}
}

function validarCorreo(correo: string): void {
	const dominio = correo.split('@')[1]
	if (!dominio || !DOMINIOS_PERMITIDOS.includes(dominio)) {
		throw new Error(
			`El correo debe pertenecer a uno de los siguientes dominios: ${DOMINIOS_PERMITIDOS.join(', ')}`,
		)
	}
}

export class RegisterEstudianteUseCase {
	constructor(
		private repo: IAuthRepository,
		private emailService: EmailService,
	) {}

	async execute(payload: RegisterEstudiantePayload): Promise<EstudiantePublic> {
		// Verificar si el email ya existe
		const existingUser = await this.repo.findUsuarioAuthByEmail(
			payload.correo_electronico,
		)
		if (existingUser) {
			throw new Error('El correo electrónico ya está registrado')
		}

		// Validar contraseña
		validarContrasenia(payload.contrasenia)

		// Validar dominio del correo
		validarCorreo(payload.correo_electronico)

		//verificar si el codigo_unico ya existe
		const existingCodigo = await this.repo.findEstudianteByCodigoUnico(
			payload.codigo_unico,
		)
		if (existingCodigo) {
			throw new Error('El código único ya está registrado')
		}

		// Hash de la contraseña
		const contrasenia_hash = await bcrypt.hash(payload.contrasenia, 10)

		// Generar token de confirmación
		const token_confirmacion = randomBytes(32).toString('hex')
		const token_expira = new Date(
			Date.now() + 24 * 60 * 60 * 1000,
		).toISOString() // 24 horas

		const persist = async (repo: IAuthRepository) => {
			// Crear usuario_auth
			const usuarioAuth = await repo.createUsuarioAuth({
				correo_electronico: payload.correo_electronico,
				contrasenia_hash,
				token_confirmacion,
				token_expira,
			})

			// Crear estudiante vinculado al usuario_auth
			const estudiante = await repo.createEstudiante({
				id_usuario_auth: usuarioAuth.id_usuario_auth,
				codigo_unico: payload.codigo_unico,
				primernombre: payload.primernombre,
				segundo_nombre: payload.segundo_nombre,
				primer_apellido: payload.primer_apellido,
				segundo_apellido: payload.segundo_apellido,
			})

			return estudiante
		}
		const estudiante = this.repo.transaction
			? await this.repo.transaction(persist)
			: await persist(this.repo)

		//Correo de confirmacion
		const nombreCompleto = `${payload.primernombre} ${payload.primer_apellido}`
		let emailStatus: 'accepted' | 'failed' = 'accepted'
		try {
			await this.emailService.sendConfirmationEmail(
				payload.correo_electronico,
				token_confirmacion,
				nombreCompleto,
			)
		} catch {
			emailStatus = 'failed'
			console.error('SMTP_CONFIRMATION_FAILED')
			// No lanzamos error aquí para no bloquear el registro
			// El usuario puede solicitar reenvío del email más tarde
		}

		return { ...estudiante, emailStatus }
	}
}
