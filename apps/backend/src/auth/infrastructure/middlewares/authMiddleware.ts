import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool, ServiceError } from '../../../integrations/config.js'
import { coordination } from '../../../integrations/coordinator.js'
export interface AuthPayload {
	id_usuario_auth: number
	id_estudiante?: number
	id_profesor?: number
	role: 'estudiante' | 'profesor'
	installationId?: string
}
declare module 'express-serve-static-core' {
	interface Request {
		user?: AuthPayload
	}
}
export async function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const header = req.get('Authorization')
		if (!header?.startsWith('Bearer '))
			throw new ServiceError('AUTH_REQUIRED', 401)
		const secret = process.env.JWT_SECRET
		if (!secret) throw new ServiceError('AUTH_NOT_CONFIGURED')
		const decoded = jwt.verify(header.slice(7), secret, {
			algorithms: ['HS256'],
		})
		if (
			typeof decoded === 'string' ||
			!Number.isSafeInteger(decoded.id_usuario_auth) ||
			!['estudiante', 'profesor'].includes(decoded.role) ||
			typeof decoded.exp !== 'number'
		)
			throw new ServiceError('INVALID_TOKEN', 401)
		const c = await coordination()
		if (decoded.installationId !== c.installation_id)
			throw new ServiceError('INSTALLATION_CHANGED', 401)
		const result = await pool.query(
			`SELECT u.confirmado,e.id_estudiante,p.id_profesor
   FROM usuario_auth u LEFT JOIN estudiante e ON e.id_usuario_auth=u.id_usuario_auth
   LEFT JOIN profesor p ON p.id_usuario_auth=u.id_usuario_auth WHERE u.id_usuario_auth=$1`,
			[decoded.id_usuario_auth],
		)
		const account = result.rows[0]
		if (!account) throw new ServiceError('INVALID_TOKEN', 401)
		if (!account.confirmado) throw new ServiceError('EMAIL_NOT_CONFIRMED', 403)
		if (
			(decoded.role === 'estudiante' &&
				account.id_estudiante !== decoded.id_estudiante) ||
			(decoded.role === 'profesor' &&
				account.id_profesor !== decoded.id_profesor)
		)
			throw new ServiceError('INVALID_ROLE', 401)
		req.user = decoded as AuthPayload
		next()
	} catch (error) {
		const e =
			error instanceof ServiceError
				? error
				: new ServiceError(
						error instanceof jwt.JsonWebTokenError
							? 'INVALID_TOKEN'
							: 'AUTH_UNAVAILABLE',
						error instanceof jwt.JsonWebTokenError ? 401 : 503,
					)
		res
			.status(e.status)
			.json({ success: false, error: { code: e.code, message: e.message } })
	}
}
export function requireProfesor(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (req.user?.role !== 'profesor') {
		res.status(403).json({ success: false, error: 'Se requiere profesor' })
		return
	}
	next()
}
export function requireEstudiante(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (req.user?.role !== 'estudiante') {
		res.status(403).json({ success: false, error: 'Se requiere estudiante' })
		return
	}
	next()
}
