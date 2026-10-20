import { beforeEach, describe, expect, it, vi } from 'vitest'

const prisma = vi.hoisted(() => ({
	escenario: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
	},
	progreso: {
		create: vi.fn(),
		findMany: vi.fn(),
	},
	revision_escenario: {
		findFirst: vi.fn(),
	},
}))

vi.mock('../src/auth/infrastructure/db/prisma.js', () => ({ prisma }))

import { PrismaProgresoRepository } from '../src/auth/infrastructure/repositories/PrismaProgresoRepository'

describe('PrismaProgresoRepository scenario revisions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		prisma.escenario.findMany.mockResolvedValue([])
	})

	it('links progress to a matching archived revision', async () => {
		prisma.escenario.findUnique.mockResolvedValue({
			id_escenario: 'scenario-1',
		})
		prisma.revision_escenario.findFirst.mockResolvedValue({
			id_revision_escenario: 'revision-1',
		})
		prisma.progreso.create.mockResolvedValue({ id_progreso: 1 })
		const repository = new PrismaProgresoRepository()

		await repository.guardarProgresoEstudiante({
			id_estudiante: 1,
			slug_escenario: 'tutorial',
			terminado: true,
			tiempo: 20,
			acciones: '',
			revision_escenario: 1,
			content_hash_escenario: 'sha256:historical',
		})

		expect(prisma.revision_escenario.findFirst).toHaveBeenCalledWith({
			select: { id_revision_escenario: true },
			where: {
				numero: 1,
				content_hash: 'sha256:historical',
				escenario: { slug: 'tutorial' },
			},
		})
		expect(prisma.progreso.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					id_revision_escenario: 'revision-1',
				}),
			}),
		)
	})

	it('resolves historical titles from the canonical scenario table', async () => {
		prisma.progreso.findMany.mockResolvedValue([
			{
				id_progreso: 1,
				id_estudiante: 1,
				slug_escenario: 'tutorial',
				terminado: true,
				tiempo: 20,
				acciones: '',
				fecha_creacion: null,
				revision_escenario: null,
				revision_escenario_numero: null,
				content_hash_escenario: null,
			},
		])
		prisma.escenario.findMany.mockResolvedValue([
			{
				slug: 'tutorial',
				titulo: 'Tutorial: Introducción a la Seguridad',
			},
		])
		const repository = new PrismaProgresoRepository()

		const result = await repository.getTodosProgresosEstudiante(1)

		expect(result[0].nombre_escenario).toBe(
			'Tutorial: Introducción a la Seguridad',
		)
	})
})
