import express from "express"
import type { Request, Response } from "express";
import { PrismaProgresoRepository } from "../repositories/PrismaProgresoRepository.js"
import { GuardarProgresoUseCase } from "../../application/useCases/GuardarProgresoUseCase.js"
import { ObtenerProgresoUseCase } from "../../application/useCases/ObtenerProgresoUseCase.js"
import { ObtenerTodosProgresosUseCase } from "../../application/useCases/ObtenerTodosProgresosUseCase.js"

const router = express.Router()
const repo = new PrismaProgresoRepository()

const guardarProgreso = new GuardarProgresoUseCase(repo);
const obtenerProgreso = new ObtenerProgresoUseCase(repo);
const obtenerTodosProgresos = new ObtenerTodosProgresosUseCase(repo);

// POST /progreso - Guardar progreso de un estudiante
router.post('/', async (req: Request , res: Response) => {
  try {
    const { id_estudiante, slug_escenario, terminado, tiempo, acciones } = req.body

    // Validación de campos requeridos
    if (!id_estudiante || !slug_escenario || terminado === undefined || tiempo === undefined || acciones == undefined ) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: id_estudiante, slug_escenario, terminado, tiempo, acciones'
      })
    }

    const progreso = await guardarProgreso.execute(req.body)
    res.status(201).json({ success: true, data: progreso })
  } catch (err) {
    if (err instanceof Error) {
    res.status(400).json({ success: false, error: err.message })
    }
  }
})

// GET /progreso/estudiante/10/escenario/tutorial - Obtener progreso específico
router.get('/estudiante/:idEstudiante/escenario/:slugEscenario', async (req: Request , res: Response) => {
  try {
    const idEstudiante = parseInt(req.params['idEstudiante'] as string)
    const slugEscenario = req.params['slugEscenario'] as string

    if (isNaN(idEstudiante) || !slugEscenario) {
      return res.status(400).json({
        success: false,
        error: 'idEstudiante debe ser un número válido y slugEscenario debe ser un string'
      })
    }

    const progreso = await obtenerProgreso.execute(idEstudiante, slugEscenario)

    if (!progreso) {
      return res.status(404).json({
        success: false,
        error: 'Progreso no encontrado'
      })
    }

    res.json({ success: true, data: progreso })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

// GET /progreso/estudiante/10 - Obtener todos los progresos de un estudiante
router.get('/estudiante/:idEstudiante', async (req: Request , res: Response) => {
  try {
    const idEstudiante = parseInt(req.params['idEstudiante'] as string)

    if (isNaN(idEstudiante)) {
      return res.status(400).json({
        success: false,
        error: 'El ID del estudiante debe ser un número válido'
      })
    }

    const progresos = await obtenerTodosProgresos.execute(idEstudiante)
    res.json({ success: true, data: progresos })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

export default router
