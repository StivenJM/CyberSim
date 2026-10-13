import express from "express";
import type { Request, Response } from "express";
import { PrismaGroupsRepository } from "../repositories/PrismaGroupsRepository.js";
import { GroupsUseCase } from "../../application/GroupsUseCase.js";
import { JoinGroupsUseCase } from "../../application/JoinGroupsUseCase.js";
import { GenerateGroupCodeUseCase } from "../../application/GenerateGroupCodeUseCase.js";
import { RemoveStudentGroupUseCase } from "../../application/RemoveStudentGroupUseCase.js";
import { LeaveGroupUseCase } from "../../application/LeaveGroupUseCase.js";

const router = express.Router();
const repo = new PrismaGroupsRepository();
const createCurso = new GroupsUseCase(repo);
const joinGroups = new JoinGroupsUseCase(repo);
const generateCode = new GenerateGroupCodeUseCase(repo);
const removeStudent = new RemoveStudentGroupUseCase(repo);
const leaveGroup = new LeaveGroupUseCase(repo);

// GET /groups/profesor/:id_profesor - Obtener todos los grupos de un profesor
router.get("/profesor/:id_profesor", async (req: Request, res: Response) => {
  try {
    const id_profesor = Number(req.params.id_profesor);

    if (isNaN(id_profesor)) {
      return res.status(400).json({ success: false, error: "ID inválido" });
    }

    const grupos = await repo.findCursosByProfesor(id_profesor);
    res.json({ success: true, data: grupos });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// GET /groups/estudiante/:id_estudiante - Obtener grupo(s) de un estudiante
router.get("/estudiante/:id_estudiante", async (req: Request, res: Response) => {
  try {
    const id_estudiante = Number(req.params.id_estudiante);

    if (isNaN(id_estudiante)) {
      return res.status(400).json({ success: false, error: "ID inválido" });
    }

    const cursos = await repo.findCursosByEstudiante(id_estudiante);
    res.json({ success: true, data: cursos });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// GET /groups/:id_curso/estudiantes - Obtener estudiantes de un grupo
router.get("/:id_curso/estudiantes", async (req: Request, res: Response) => {
  try {
    const id_curso = Number(req.params.id_curso);

    if (isNaN(id_curso)) {
      return res.status(400).json({ success: false, error: "ID inválido" });
    }

    const estudiantes = await repo.findEstudiantesByCurso(id_curso);
    res.json({ success: true, data: estudiantes });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// POST /groups - Crear un nuevo grupo
router.post("/", async (req: Request, res: Response) => {
  try {
    const { id_profesor, nombre } = req.body;

    // Validación de campos requeridos
    if (!id_profesor || !nombre) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos requeridos: id_profesor, nombre",
      });
    }

    const curso = await createCurso.createCurso(req.body);
    const cursoConCodigo = await generateCode.execute(curso.id_curso);
    res.status(201).json({ success: true, data: cursoConCodigo });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// PUT /groups/edit/:id - Editar grupo existente
router.put("/edit/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "ID inválido" });
    }

    const updated = await createCurso.updateCurso(id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// DELETE /groups/delete/:id - Eliminar grupo
router.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "ID inválido" });
    }

    const result = await createCurso.deleteCurso(id);
    res.json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// POST /groups/join - Unirse a un grupo mediante código de acceso
router.post("/join", async (req: Request, res: Response) => {
  try {
    const { codigo_acceso, id_estudiante } = req.body;

    if (!codigo_acceso || !id_estudiante) {
      return res.status(400).json({
        success: false,
        error: "codigo_acceso e id_estudiante son obligatorios",
      });
    }

    const matricula = await joinGroups.execute({
      codigo_acceso,
      id_estudiante,
    });

    res.status(201).json({ success: true, data: matricula });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// POST /groups/:id/generate-code - Generar un nuevo código de acceso para un grupo
router.post("/:id/generate-code", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const curso = await generateCode.execute(id);
    res.json({ success: true, data: curso });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// DELETE /groups/:id_curso/remove-student/:id_estudiante - Eliminar un estudiante de un grupo -> Lo hace el profesor
router.delete(
  "/:id_curso/remove-student/:id_estudiante",
  async (req: Request, res: Response) => {
    try {
      const id_profesor = Number(req.body.id_profesor);
      const id_curso = Number(req.params.id_curso);
      const id_estudiante = Number(req.params.id_estudiante);

      const result = await removeStudent.execute(
        id_profesor,
        id_curso,
        id_estudiante
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

// DELETE /groups/leave/:id_curso/:id_estudiante - Estudiante se sale del grupo
router.delete(
  "/leave/:id_curso/:id_estudiante",
  async (req: Request, res: Response) => {
    try {
      const id_curso = Number(req.params.id_curso);
      const id_estudiante = Number(req.params.id_estudiante);

      const result = await leaveGroup.execute(id_curso, id_estudiante);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export default router;
