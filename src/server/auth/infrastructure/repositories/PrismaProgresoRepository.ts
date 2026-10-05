import { getNombreEscenario } from "../../../../client/data/escenarios/registry.js";
import type { Progreso, ProgresoInput, ProgresoConNombreEscenario, ProgresoResumen } from "../../domain/models/Progreso.js";
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js";
import { prisma } from "../db/prisma.js";

export class PrismaProgresoRepository implements IProgresoRepository {

    async guardarProgresoEstudiante(p: ProgresoInput): Promise<Progreso> {
        const created = await prisma.progreso.create({
            data: {
                id_estudiante: p.id_estudiante,
                terminado: p.terminado,
                slug_escenario: p.slug_escenario,
                tiempo: p.tiempo,
                acciones: p.acciones,
            },
        });
        return created as Progreso;
    }

    async getProgresoEstudiante(idEstudiante: number, slugEscenario: string): Promise<ProgresoResumen | null> {
        const intentos = await prisma.progreso.count({
            where: {
                id_estudiante: idEstudiante,
                slug_escenario: slugEscenario,
            },
        });

        const terminado = await prisma.progreso.findFirst({
            select: { terminado: true },
            where: {
                id_estudiante: idEstudiante,
                slug_escenario: slugEscenario,
                terminado: true,
            },
        });

        return {
            terminado: terminado?.terminado ?? false,
            intentos: intentos ?? 0,
        };
    }

    async getTodosProgresosEstudiante(idEstudiante: number): Promise<ProgresoConNombreEscenario[]> {
        const progresos = await prisma.progreso.findMany({
            where: { id_estudiante: idEstudiante },
            orderBy: { id_progreso: 'asc' },
        });

        return progresos.map(p => ({
            id_progreso: p.id_progreso,
            id_estudiante: p.id_estudiante,
            slug_escenario: p.slug_escenario,
            nombre_escenario: getNombreEscenario(p.slug_escenario),
            terminado: !!p.terminado,
            tiempo: p.tiempo,
            fecha_creacion: p.fecha_creacion ? p.fecha_creacion.toISOString() : null,
            acciones: p.acciones ?? '',
        }));
    }
}
