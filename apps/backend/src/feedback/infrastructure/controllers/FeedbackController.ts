
import express from "express";
import type { Request, Response } from "express";
import { prisma } from "../../../auth/infrastructure/db/prisma.js";
import { N8nFeedbackRepository } from "../repositories/N8nFeedbackRepository.js";
import { PrismaProgresoRepository } from "../repositories/PrismaProgresoRepository.js";
import { GenerateFeedbackUseCase } from "../../application/useCases/GenerateFeedbackUseCase.js";
import { CheckFeedbackStatusUseCase } from "../../application/useCases/CheckFeedbackStatusUseCase.js";
import type { IFeedbackPersistenceRepository } from "../../domain/repositories/IFeedbackPersistenceRepository.js";

const router = express.Router();

const webhookUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL;

if (!webhookUrl) {
  throw new Error("Falta la variable de entorno N8N_FEEDBACK_WEBHOOK_URL");
}

const feedbackRepository = new N8nFeedbackRepository(webhookUrl);

let feedbackPersistenceRepository: IFeedbackPersistenceRepository;
let generateFeedbackUseCase: GenerateFeedbackUseCase;
let checkFeedbackStatusUseCase: CheckFeedbackStatusUseCase;

export function initializeFeedbackController(persistenceRepo: IFeedbackPersistenceRepository) {
  feedbackPersistenceRepository = persistenceRepo;
  const progresoRepository = new PrismaProgresoRepository(prisma);
  generateFeedbackUseCase = new GenerateFeedbackUseCase(
    feedbackRepository,
    feedbackPersistenceRepository,
    progresoRepository
  );
  checkFeedbackStatusUseCase = new CheckFeedbackStatusUseCase(
    feedbackPersistenceRepository,
    progresoRepository
  );
}


router.get('/check-status', async (req: Request, res: Response) => {
  try {
    const id_estudiante = parseInt(req.query.id_estudiante as string);
    const slug_escenario = req.query.slug_escenario as string;

    if (!id_estudiante || isNaN(id_estudiante) || !slug_escenario) {
      return res.status(400).json({
        success: false,
        error: 'id_estudiante (número) y slug_escenario (string) son requeridos',
      });
    }

    const result = await checkFeedbackStatusUseCase.execute(id_estudiante, slug_escenario);

    res.status(200).json({
      success: true,
      habilitado: result.habilitado,
      intentos_actuales: result.intentosActuales,
      intentos_al_generar: result.intentosAlGenerar,
      ultima_retroalimentacion: result.ultimaRetroalimentacion
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error al verificar estado del feedback',
      });
    }
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { id_estudiante, slug_escenario } = req.body;

    if (!id_estudiante || !slug_escenario) {
      return res.status(400).json({
        success: false,
        error: 'id_estudiante y slug_escenario son requeridos'
      });
    }

    const feedback = await generateFeedbackUseCase.execute({
      id_estudiante,
      slug_escenario,
    });

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error desconocido al generar retroalimentación'
      });
    }
  }
});

export default router;
