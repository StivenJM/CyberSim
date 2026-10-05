// src/server.ts
import express from 'express'
import type { Request, Response } from "express";
import cors from 'cors'
import 'dotenv/config'
import authRouter from './auth/infrastructure/controllers/AuthController.js'
import progresoRouter from './auth/infrastructure/controllers/ProgresoController.js'
import groupsRouter from './groups/infrastructure/controller/GroupsController.js'
import feedbackRouter from './feedback/infrastructure/controllers/FeedbackController.js'
import courseAnalysisRouter from './course-analysis/infrastructure/controllers/CourseAnalysisController.js'
import chatRouter from './chat/infrastructure/controllers/ChatController.js'
import agentMalvadoRouter from './agent-malvado/infrastructure/controllers/ScenarioBuilderController.js'
import { PrismaFeedbackPersistenceRepository } from './feedback/infrastructure/repositories/PrismaFeedbackPersistenceRepository.js'
import { prisma } from './auth/infrastructure/db/prisma.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000 // Azure asigna puerto dinámico

const feedbackPersistenceRepository = new PrismaFeedbackPersistenceRepository(prisma);

// CORS - restringido en producción al dominio del frontend
const corsOrigin = process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL
  : '*';

app.use(cors({
  origin: corsOrigin,
  credentials: corsOrigin !== '*'
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API de CiberSeguridad Game',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      progreso: '/progreso',
      groups: '/groups',
      feedback: '/feedback',
      courseAnalysis: '/course-analysis',
      chat: '/api/chat',
      agentMalvado: '/api/agent-malvado',
      health: '/health'
    }
  })
})


import { initializeFeedbackController } from './feedback/infrastructure/controllers/FeedbackController.js';
initializeFeedbackController(feedbackPersistenceRepository);

// Montar rutas de autenticación
app.use('/auth', authRouter)
app.use('/progreso', progresoRouter)
app.use('/feedback', feedbackRouter)
app.use('/course-analysis', courseAnalysisRouter)
app.use('/api/chat', chatRouter)
app.use('/api/agent-malvado', agentMalvadoRouter)
app.use('/groups', groupsRouter)

// Manejo de rutas no encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  })
})

// Manejo de errores global
app.use((err: unknown, _req: express.Request, res: express.Response) => {
  console.error('Error no manejado:', err)
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  })
})

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
})

export default app
