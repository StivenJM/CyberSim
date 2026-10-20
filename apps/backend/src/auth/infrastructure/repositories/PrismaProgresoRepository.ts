import type {
	Progreso,
	ProgresoConNombreEscenario,
	ProgresoInput,
	ProgresoResumen,
} from '../../domain/models/Progreso.js'
import type { IProgresoRepository } from '../../domain/repositories/IProgresoRepository.js'
import { prisma } from '../db/prisma.js'

export class PrismaProgresoRepository implements IProgresoRepository {
	async guardarProgresoEstudiante(p: ProgresoInput): Promise<Progreso> {
		let revisionId: string | undefined
		if (
			p.revision_escenario !== undefined &&
			p.content_hash_escenario !== undefined
		) {
			const scenario = await prisma.escenario.findUnique({
				where: { slug: p.slug_escenario },
				select: { id_escenario: true },
			})
			const revision = await prisma.revision_escenario.findFirst({
				select: { id_revision_escenario: true },
				where: {
					numero: p.revision_escenario,
					content_hash: p.content_hash_escenario,
					escenario: { slug: p.slug_escenario },
				},
			})
			if (scenario && !revision) {
				throw new Error(
					'La revisión publicada del escenario no coincide con el catálogo',
				)
			}
			revisionId = revision?.id_revision_escenario
		}

		const created = await prisma.progreso.create({
			data: {
				id_estudiante: p.id_estudiante,
				terminado: p.terminado,
				slug_escenario: p.slug_escenario,
				tiempo: p.tiempo,
				acciones: p.acciones,
				id_revision_escenario: revisionId,
				revision_escenario_numero: p.revision_escenario,
				content_hash_escenario: p.content_hash_escenario,
			},
		})
		return created as Progreso
	}

	async getProgresoEstudiante(
		idEstudiante: number,
		slugEscenario: string,
	): Promise<ProgresoResumen | null> {
		const intentos = await prisma.progreso.count({
			where: {
				id_estudiante: idEstudiante,
				slug_escenario: slugEscenario,
			},
		})

		const terminado = await prisma.progreso.findFirst({
			select: { terminado: true },
			where: {
				id_estudiante: idEstudiante,
				slug_escenario: slugEscenario,
				terminado: true,
			},
		})

		return {
			terminado: terminado?.terminado ?? false,
			intentos: intentos ?? 0,
		}
	}

	async getTodosProgresosEstudiante(
		idEstudiante: number,
	): Promise<ProgresoConNombreEscenario[]> {
		const progresos = await prisma.progreso.findMany({
			where: { id_estudiante: idEstudiante },
			orderBy: { id_progreso: 'asc' },
			include: {
				revision_escenario: {
					include: { escenario: true },
				},
			},
		})
		const slugsWithoutRevision = [
			...new Set(
				progresos
					.filter((progress) => !progress.revision_escenario)
					.map((progress) => progress.slug_escenario),
			),
		]
		const scenarios = slugsWithoutRevision.length
			? await prisma.escenario.findMany({
					where: { slug: { in: slugsWithoutRevision } },
					select: { slug: true, titulo: true },
				})
			: []
		const titlesBySlug = new Map(
			scenarios.map((scenario) => [scenario.slug, scenario.titulo]),
		)

		return progresos.map((p) => ({
			id_progreso: p.id_progreso,
			id_estudiante: p.id_estudiante,
			slug_escenario: p.slug_escenario,
			nombre_escenario:
				p.revision_escenario?.escenario.titulo ??
				titlesBySlug.get(p.slug_escenario) ??
				`Escenario: ${p.slug_escenario}`,
			terminado: !!p.terminado,
			tiempo: p.tiempo,
			fecha_creacion: p.fecha_creacion ? p.fecha_creacion.toISOString() : null,
			acciones: p.acciones ?? '',
			revision_escenario:
				p.revision_escenario?.numero ?? p.revision_escenario_numero ?? null,
			content_hash_escenario:
				p.revision_escenario?.content_hash ?? p.content_hash_escenario ?? null,
		}))
	}
}
