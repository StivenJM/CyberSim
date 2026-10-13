import express from "express";
import type { Request, Response } from "express";
import { N8nCourseAnalysisRepository } from "../repositories/N8nCourseAnalysisRepository.js";
import { PrismaCourseAnalysisRepository } from "../repositories/PrismaCourseAnalysisRepository.js";
import { GenerateCourseAnalysisUseCase } from "../../application/useCases/GenerateCourseAnalysisUseCase.js";
import { prisma } from "../../../auth/infrastructure/db/prisma.js";

const router = express.Router();

export function createCourseAnalysisController(webhookUrl?: string) {
  // Validar que la variable de entorno esté configurada
  const url = webhookUrl || process.env.N8N_COURSE_ANALYSIS_WEBHOOK_URL;

  if (!url) {
    console.error("  ADVERTENCIA: Falta la variable de entorno N8N_COURSE_ANALYSIS_WEBHOOK_URL");
    console.error("   El endpoint de análisis de curso no funcionará correctamente.");
  }

  // Inicializar repositorio y caso de uso con inyección de dependencias
  const analysisRepository = new N8nCourseAnalysisRepository(url || '');
  const persistenceRepository = new PrismaCourseAnalysisRepository(prisma);
  const generateAnalysisUseCase = new GenerateCourseAnalysisUseCase(analysisRepository, persistenceRepository);

  router.post('/generate', async (req: Request, res: Response) => {
    try {
      const { id_curso, id_profesor } = req.body;

      // Validación
      if (!id_curso) {
        return res.status(400).json({
          success: false,
          error: 'El campo id_curso es requerido'
        });
      }

      if (typeof id_curso !== 'number' || id_curso <= 0) {
        return res.status(400).json({
          success: false,
          error: 'El id_curso debe ser un número válido mayor que 0'
        });
      }

      if (!id_profesor || typeof id_profesor !== 'number' || id_profesor <= 0) {
        return res.status(400).json({
          success: false,
          error: 'El id_profesor es requerido y debe ser un número válido mayor que 0'
        });
      }

      // Verificar que el webhook esté configurado
      if (!url) {

        return res.status(503).json({
          success: false,
          error: 'El servicio de análisis no está configurado correctamente'
        });
      }

      // Ejecutar caso de uso
      const analysis = await generateAnalysisUseCase.execute({ id_curso, id_profesor });

      res.status(200).json({
        success: true,
        data: analysis
      });

    } catch (err) {
      
      if (err instanceof Error) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error desconocido al generar el análisis del curso'
      });
    }
  });


  router.get('/latest/:id_curso', async (req: Request, res: Response) => {
    try {
      const id_curso = parseInt(req.params.id_curso as string);
      if (!id_curso || isNaN(id_curso)) {
        return res.status(400).json({ success: false, error: 'id_curso inválido' });
      }

      const analysis = await persistenceRepository.findLatestByCurso(id_curso);
      
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch {
      res.status(500).json({
        success: false,
        error: 'Error al recuperar el análisis del curso'
      });
    }
  });

  router.get('/health', (_req: Request, res: Response) => {
    const isConfigured = !!url;
    
    res.status(isConfigured ? 200 : 503).json({
      success: isConfigured,
      service: 'course-analysis',
      configured: isConfigured,
      message: isConfigured 
        ? 'Servicio de análisis de curso disponible' 
        : 'Servicio no configurado (falta N8N_COURSE_ANALYSIS_WEBHOOK_URL)'
    });
  });

  return router;
}

export default createCourseAnalysisController();
