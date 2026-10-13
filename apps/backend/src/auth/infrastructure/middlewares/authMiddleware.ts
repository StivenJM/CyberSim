import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
  id_usuario_auth: number
  id_estudiante?: number
  id_profesor?: number
  role: 'estudiante' | 'profesor'
}

// Extender Request
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthPayload
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado')
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthPayload
    req.user = decoded

    next()
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      })
    }
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      })
    }
    return res.status(500).json({
      success: false,
      error: 'Error al verificar el token'
    })
  }
}

export const requireProfesor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'profesor') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de profesor'
    })
  }
  next()
}

export const requireEstudiante = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'estudiante') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de estudiante'
    })
  }
  next()
}
