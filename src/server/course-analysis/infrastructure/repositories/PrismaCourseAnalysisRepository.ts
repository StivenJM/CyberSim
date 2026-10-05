import type { PrismaClient } from '../../../../generated/prisma/index.js';
import type { ICourseAnalysisPersistenceRepository } from '../../domain/repositories/ICourseAnalysisPersistenceRepository.js';
import type { CourseAnalysisResponse } from '../../domain/models/CourseAnalysis.js';

export class PrismaCourseAnalysisRepository implements ICourseAnalysisPersistenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(idProfesor: number, analysis: CourseAnalysisResponse): Promise<void> {
    await this.prisma.retroalimentacion_curso.create({
      data: {
        id_curso: analysis.id_curso,
        id_profesor: idProfesor,
        // Guardamos tanto los números (resumen) como el texto de la IA (resumen_ejecutivo) en la columna 'resumen'
        resumen: JSON.stringify({
          stats: analysis.resumen,
          ai: analysis.analisis.resumen_ejecutivo
        }),
        patrones: JSON.stringify(analysis.analisis.patrones),
        fortalezas: JSON.stringify(analysis.analisis.fortalezas),
        areas_mejora: JSON.stringify(analysis.analisis.areas_mejora),
        recomendaciones: JSON.stringify(analysis.analisis.recomendaciones),
      },
    });
  }

  async findLatestByCurso(idCurso: number): Promise<CourseAnalysisResponse | null> {
    const record = await this.prisma.retroalimentacion_curso.findFirst({
      where: { id_curso: idCurso },
      orderBy: { fecha: 'desc' },
    });

    if (!record) return null;

    const parsedResumen = JSON.parse(record.resumen);

    return {
      id_curso: record.id_curso,
      fecha_generacion: record.fecha.toISOString(),
      // Si es el formato nuevo (objeto con stats), lo extraemos. 
      // Si es el viejo (solo stats), lo usamos directamente.
      resumen: parsedResumen.stats || parsedResumen,
      analisis: {
        resumen_ejecutivo: parsedResumen.ai || { titulo: "Diagnóstico General", contenido: "Resumen no disponible" },
        patrones: JSON.parse(record.patrones),
        fortalezas: JSON.parse(record.fortalezas),
        areas_mejora: JSON.parse(record.areas_mejora),
        recomendaciones: JSON.parse(record.recomendaciones),
      },
    };
  }
}
