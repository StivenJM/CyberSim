import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import authRouter from './auth/infrastructure/controllers/AuthController.js'
import progresoRouter from './auth/infrastructure/controllers/ProgresoController.js'
import groupsRouter from './groups/infrastructure/controller/GroupsController.js'
import { recover } from './integrations/coordinator.js'
import {
	analysisRouter,
	chatRouter,
	errorHandler,
	feedbackRouter,
	health,
	internalRouter,
	readiness,
	scenarioRouter,
} from './integrations/routes.js'

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '32kb' }))
app.use(express.urlencoded({ extended: false, limit: '32kb' }))
app.get('/health/live', (_req, res) => res.json({ status: 'alive' }))
app.get('/health', (_req, res) => res.json({ status: 'alive' }))
app.get('/health/ready', async (_req, res) => {
	try {
		const result = await readiness()
		res.status(result.ready ? 200 : 503).json(result)
	} catch {
		res.status(503).json({ ready: false, state: 'not_ready' })
	}
})
app.get('/health/status', async (_req, res) => {
	try {
		res.json(await health())
	} catch {
		res.status(503).json({ state: 'error' })
	}
})
app.use('/auth', authRouter)
app.use('/progreso', progresoRouter)
app.use('/groups', groupsRouter)
app.use('/feedback', feedbackRouter)
app.use('/course-analysis', analysisRouter)
app.use('/api/chat', chatRouter)
app.use('/api/agent-malvado', scenarioRouter)
app.use((_req, res) => {
	res.status(404).json({
		success: false,
		error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' },
	})
})
app.use(errorHandler)

const internal = express()
internal.use(express.json({ limit: '2mb' }))
internal.use('/internal/v1', internalRouter)
internal.use(errorHandler)

async function start() {
	try {
		await recover()
	} catch {
		console.warn('Integraciones pendientes de migración o reconciliación.')
	}
	const api = app.listen(Number(process.env.PORT) || 3000, '0.0.0.0', () =>
		console.log('API CyberSim disponible en puerto 3000'),
	)
	const privateApi = internal.listen(
		Number(process.env.INTERNAL_PORT) || 3001,
		'0.0.0.0',
	)
	const stop = () => {
		api.close()
		privateApi.close()
		setTimeout(() => process.exit(0), 30000).unref()
	}
	process.once('SIGTERM', stop)
	process.once('SIGINT', stop)
}
if (process.env.NODE_ENV !== 'test') void start()
export default app
