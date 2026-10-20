import { spawnSync } from 'node:child_process'
import { PrismaPg } from '@prisma/adapter-pg'
import { assertDisposableDatabase } from '../../../../infra/integration/safety.mjs'
import { PrismaClient } from '../../src/generated/prisma/client.js'

assertDisposableDatabase()
const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})
try {
	// Solo datos de usuarios: mantiene el índice real y evita pagar su reconstrucción por caso.
	await prisma.$transaction([
		prisma.retroalimentacion_estudiante.deleteMany(),
		prisma.retroalimentacion_curso.deleteMany(),
		prisma.progreso.deleteMany(),
		prisma.matricula.deleteMany(),
		prisma.curso.deleteMany(),
		prisma.estudiante.deleteMany(),
		prisma.profesor.deleteMany(),
		prisma.usuario_auth.deleteMany(),
	])
	const result = spawnSync(
		process.execPath,
		['node_modules/tsx/dist/cli.mjs', 'prisma/seed.ts'],
		{ env: process.env, stdio: 'inherit', timeout: 30000 },
	)
	if (result.status !== 0) throw new Error('Falló el seed de instalación.')
} finally {
	await prisma.$disconnect()
}
