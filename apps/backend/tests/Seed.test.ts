import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { prisma, tables } = vi.hoisted(() => {
	const tables: Record<string, Record<string, any>[]> = {}
	const prisma: Record<string, any> = {}
	for (const name of [
		'usuario_auth',
		'profesor',
		'estudiante',
		'curso',
		'matricula',
		'progreso',
	]) {
		tables[name] = []
		const find = ({ where }: any) =>
			tables[name].find((row) =>
				Object.entries(where).every(([key, value]) => row[key] === value),
			) ?? null
		const create = ({ data }: any) => {
			const row = { [`id_${name}`]: tables[name].length + 1, ...data }
			tables[name].push(row)
			return row
		}
		prisma[name] = {
			findUnique: vi.fn(find),
			findFirst: vi.fn(find),
			create: vi.fn(create),
			upsert: vi.fn(({ where, create: data, update }: any) => {
				const row = find({ where })
				return row ? Object.assign(row, update) : create({ data })
			}),
		}
	}
	prisma.$executeRaw = vi.fn()
	prisma.$transaction = vi.fn(async (callback: any) => callback(prisma))
	prisma.$disconnect = vi.fn()
	return { prisma, tables }
})

vi.mock('dotenv/config', () => ({}))
vi.mock('bcrypt', () => ({ default: { hash: vi.fn(async () => 'hash') } }))
vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }))
vi.mock('../src/generated/prisma/client.js', () => ({
	PrismaClient: class {
		constructor() {
			Object.assign(this, prisma)
		}
	},
}))
vi.mock('../src/integrations/config.js', () => ({ databaseUrl: vi.fn() }))

async function runSeed() {
	vi.resetModules()
	prisma.$disconnect.mockClear()
	await import('../prisma/seed')
	await vi.waitFor(() => expect(prisma.$disconnect).toHaveBeenCalledOnce())
}

describe('demo seed progress', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		for (const rows of Object.values(tables)) rows.length = 0
		vi.stubEnv('DATABASE_URL', 'postgresql://unused/test')
		vi.spyOn(console, 'log').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('creates demo accounts and enrollments without inventing attempts', async () => {
		await runSeed()

		expect(tables.usuario_auth).toHaveLength(3)
		expect(tables.profesor).toHaveLength(1)
		expect(tables.estudiante).toHaveLength(2)
		expect(tables.curso).toHaveLength(1)
		expect(tables.matricula).toHaveLength(2)
		expect(tables.progreso).toEqual([])
	})

	it('preserves real progress and does not add attempts when restarted', async () => {
		await runSeed()
		tables.progreso.length = 0
		const progress = {
			id_progreso: 1,
			id_estudiante: tables.estudiante[0].id_estudiante,
			slug_escenario: 'tutorial',
			terminado: true,
			tiempo: 120,
			acciones: 'acciones reales',
		}
		tables.progreso.push({ ...progress })

		await runSeed()

		expect(tables.usuario_auth).toHaveLength(3)
		expect(tables.matricula).toHaveLength(2)
		expect(tables.progreso).toEqual([progress])
	})
})
