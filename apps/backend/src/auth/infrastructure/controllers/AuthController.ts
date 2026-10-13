import express from "express"
import type { TransportOptions } from "nodemailer"
import type { Request, Response } from "express"
import { PrismaAuthRepository } from "../repositories/PrismaAuthRepository.js"
import { RegisterEstudianteUseCase } from "../../application/useCases/RegisterEstudianteUseCase.js"
import { RegisterProfesorUseCase } from "../../application/useCases/RegisterProfesorUseCase.js"
import { LoginUseCase } from "../../application/useCases/LoginUseCase.js"
import { ConfirmarEmailUseCase } from "../../application/useCases/ConfirmarEmailUseCase.js"
import { ReenviarConfirmacionEmailUseCase } from "../../application/useCases/ReenviarConfirmacionEmailUseCase.js"
import { ObtenerEstudianteProfesorUseCase } from "../../application/useCases/ObtenerEstudianteProfesorUseCase.js"
import { NodemailerEmailService } from "../../infrastructure/service/EmailService.js"
import { authMiddleware, requireProfesor } from "../middlewares/authMiddleware.js"
import { SolicitudCambioContraseniaUseCase } from "../../application/useCases/SolicitudCambioContraseniaUseCase.js"
import { CambiarContraseniaUseCase } from "../../application/useCases/CambiarContraseniaUseCase.js"

const router = express.Router()
const repo = new PrismaAuthRepository()

// Validar variables de entorno
const jwtSecret = process.env.JWT_SECRET
const fromEmail = process.env.FROM_EMAIL
const frontendUrl = process.env.FRONTEND_URL

if (!jwtSecret) {
  throw new Error("Falta la variable de entorno JWT_SECRET")
}

if (!fromEmail) {
  throw new Error("Falta la variable de entorno FROM_EMAIL")
}

if (!frontendUrl) {
  throw new Error("Falta la variable de entorno FRONTEND_URL")
}

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
} = process.env

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  throw new Error('Faltan variables de entorno para la configuración de SMTP')
}

const smtpConfig = {
  host: SMTP_HOST,
  port: Number(SMTP_PORT ?? 587),
  secure: SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
} as TransportOptions

// Inicializar el servicio de correo con Nodemailer
const emailService = new NodemailerEmailService(smtpConfig, fromEmail, frontendUrl)

// Inicializar use cases
const registerEstudiante = new RegisterEstudianteUseCase(repo, emailService)
const registerProfesor = new RegisterProfesorUseCase(repo, emailService)
const loginUseCase = new LoginUseCase(repo, jwtSecret)
const confirmEmailUseCase = new ConfirmarEmailUseCase(repo)
const resendConfirmationUseCase = new ReenviarConfirmacionEmailUseCase(repo, emailService)
const obtenerEstudianteProfesor = new ObtenerEstudianteProfesorUseCase(repo)
const solicitudCambioContraseniaUseCase = new SolicitudCambioContraseniaUseCase(repo, emailService)
const cambiarContraseniaUseCase = new CambiarContraseniaUseCase(repo)

// POST /auth/register/estudiante
router.post('/register/estudiante', async (req: Request, res: Response) => {
  try {
    const created = await registerEstudiante.execute(req.body)
    res.status(201).json({
      success: true,
      data: created,
      message: 'Estudiante registrado. Por favor, verifica tu correo electrónico.'
    })
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
})

// POST /auth/register/profesor
router.post('/register/profesor', async (req: Request, res: Response) => {
  try {
    const created = await registerProfesor.execute(req.body)
    res.status(201).json({
      success: true,
      data: created,
      message: 'Profesor registrado. Por favor, verifica tu correo electrónico.'
    })
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    }
  }
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { correo_electronico, contrasenia } = req.body

    if (!correo_electronico || !contrasenia) {
      return res.status(400).json({
        success: false,
        error: 'Correo electrónico y contraseña son requeridos'
      })
    }

    const result = await loginUseCase.execute(correo_electronico, contrasenia)

    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }

    res.json({ success: true, data: result })

  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    } else {
      res.status(500).json({ success: false, error: 'Error interno del servidor' })
    }
  }
})

// GET /auth/confirm - Confirmar email con token
router.get('/confirm', async (req: Request, res: Response) => {
  try {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Token de confirmación requerido'
      })
    }

    const result = await confirmEmailUseCase.execute(token)

    res.json({ success: true, data: result })

  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    } else {
      res.status(500).json({ success: false, error: 'Error interno del servidor' })
    }
  }
})

// POST /auth/resend-confirmation - Reenviar email de confirmación
router.post('/resend-confirmation', async (req: Request, res: Response) => {
  try {
    const { correo_electronico } = req.body

    if (!correo_electronico) {
      return res.status(400).json({
        success: false,
        error: 'Correo electrónico requerido'
      })
    }

    const result = await resendConfirmationUseCase.execute(correo_electronico)

    res.json({ success: true, data: result })

  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    } else {
      res.status(500).json({ success: false, error: 'Error interno del servidor' })
    }
  }
})

// GET /auth/profesor/:id/estudiantes - Requiere autenticación y rol de profesor
router.get('/profesor/:id/estudiantes', authMiddleware, requireProfesor, async (req: Request, res: Response) => {
  try {
    const id_profesor = parseInt(req.params['id'] as string)

    if (isNaN(id_profesor)) {
      return res.status(400).json({
        success: false,
        error: 'ID de profesor inválido'
      })
    }

    // Verificar que el profesor autenticado solo pueda ver sus propios estudiantes
    if (req.user?.id_profesor !== id_profesor) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver estudiantes de otro profesor'
      })
    }

    const estudiantes = await obtenerEstudianteProfesor.execute(id_profesor)

    res.json({
      success: true,
      data: estudiantes,
      total: estudiantes.length
    })

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

// POST /auth/request-password-reset - Solicitar recuperación de contraseña
router.post('/request-password-reset', async (req: Request, res: Response) => {
  try {
    const { correo_electronico } = req.body

    if (!correo_electronico) {
      return res.status(400).json({
        success: false,
        error: 'Correo electrónico requerido'
      })
    }

    const result = await solicitudCambioContraseniaUseCase.execute(correo_electronico)

    res.json({ success: true, data: result })

  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    } else {
      res.status(500).json({ success: false, error: 'Error interno del servidor' })
    }
  }
})

// POST /auth/reset-password - Restablecer contraseña con token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, nueva_contrasenia } = req.body

    if (!token || !nueva_contrasenia) {
      return res.status(400).json({
        success: false,
        error: 'Token y nueva contraseña son requeridos'
      })
    }

    const result = await cambiarContraseniaUseCase.execute(token, nueva_contrasenia)

    res.json({ success: true, data: result })

  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message })
    } else {
      res.status(500).json({ success: false, error: 'Error interno del servidor' })
    }
  }
})

// GET /auth/me - Obtener información del usuario autenticado
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      })
    }

    const usuarioAuth = await repo.findUsuarioAuthById(req.user.id_usuario_auth)

    if (!usuarioAuth) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      })
    }

    let userData = null

    if (req.user.role === 'profesor' && req.user.id_profesor) {
      userData = await repo.findProfesorByUsuarioAuth(req.user.id_usuario_auth)
    } else if (req.user.role === 'estudiante' && req.user.id_estudiante) {
      userData = await repo.findEstudianteByUsuarioAuth(req.user.id_usuario_auth)
    }

    res.json({
      success: true,
      data: {
        role: req.user.role,
        user: userData,
        email: usuarioAuth.correo_electronico,
        confirmado: usuarioAuth.confirmado
      }
    })

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

export default router
