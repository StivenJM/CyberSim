import { describe, it, expect, vi, beforeEach } from "vitest"

import { GroupsUseCase } from "../src/groups/application/GroupsUseCase"
import { JoinGroupsUseCase } from "../src/groups/application/JoinGroupsUseCase"
import { GenerateGroupCodeUseCase } from "../src/groups/application/GenerateGroupCodeUseCase"
import { RemoveStudentGroupUseCase } from "../src/groups/application/RemoveStudentGroupUseCase"
import { LeaveGroupUseCase } from "../src/groups/application/LeaveGroupUseCase"

import type { IGroupsRepository } from "../src/groups/domain/repositories/IGroupsRepository"

// Mock del generador de código
vi.mock("../src/groups/domain/utils/CodeGenerator.js", () => ({
  generarCodigoConExpiracion: vi.fn(() => ({
    codigo_acceso: "ABC123",
    codigo_expira: new Date("2030-01-01")
  }))
}))

describe("GroupsUseCases", () => {
  let repo: any

  beforeEach(() => {
    repo = {
      createCurso: vi.fn(),
      updateCurso: vi.fn(),
      deleteCurso: vi.fn(),
      findCursoByCodigo: vi.fn(),
      existsMatricula: vi.fn(),
      hasAnyMatricula: vi.fn(),
      createMatricula: vi.fn(),
      updateCursoCodigo: vi.fn(),
      deleteMatricula: vi.fn(),
      findCursoById: vi.fn()
    } as unknown as IGroupsRepository
  })

  // =========================
  // CREATE / UPDATE / DELETE
  // =========================
  describe("GroupsUseCase", () => {
    it("debe crear un curso", async () => {
      repo.createCurso.mockResolvedValue({ id_curso: 1 })

      const useCase = new GroupsUseCase(repo)
      const result = await useCase.createCurso({ id_profesor: 1, nombre: "Test" })

      expect(result.id_curso).toBe(1)
    })

    it("debe actualizar un curso", async () => {
      repo.updateCurso.mockResolvedValue({ id_curso: 1, nombre: "Updated" })

      const useCase = new GroupsUseCase(repo)
      const result = await useCase.updateCurso(1, { nombre: "Updated" })

      expect(result.nombre).toBe("Updated")
    })

    it("debe eliminar un curso", async () => {
      repo.deleteCurso.mockResolvedValue({ success: true })

      const useCase = new GroupsUseCase(repo)
      const result = await useCase.deleteCurso(1)

      expect(result.success).toBe(true)
    })
  })

  // =========================
  // JOIN GROUP
  // =========================
  describe("JoinGroupsUseCase", () => {
    it("debe unirse a un grupo correctamente", async () => {
      repo.findCursoByCodigo.mockResolvedValue({
        id_curso: 1,
        codigo_expira: new Date("2030-01-01")
      })

      repo.hasAnyMatricula.mockResolvedValue(false)
      repo.createMatricula.mockResolvedValue({ id_matricula: 1 })

      const useCase = new JoinGroupsUseCase(repo)

      const result = await useCase.execute({
        codigo_acceso: "ABC",
        id_estudiante: 10
      })

      expect(result.id_matricula).toBe(1)
    })

    it("debe fallar si el código es inválido", async () => {
      repo.findCursoByCodigo.mockResolvedValue(null)

      const useCase = new JoinGroupsUseCase(repo)

      await expect(
        useCase.execute({ codigo_acceso: "BAD", id_estudiante: 1 })
      ).rejects.toThrow("Código inválido")
    })

    it("debe fallar si el código expiró", async () => {
      repo.findCursoByCodigo.mockResolvedValue({
        id_curso: 1,
        codigo_expira: new Date("2000-01-01")
      })

      const useCase = new JoinGroupsUseCase(repo)

      await expect(
        useCase.execute({ codigo_acceso: "ABC", id_estudiante: 1 })
      ).rejects.toThrow("El código ha expirado")
    })

    it("debe fallar si ya pertenece a un grupo", async () => {
      repo.findCursoByCodigo.mockResolvedValue({
        id_curso: 1,
        codigo_expira: new Date("2030-01-01")
      })

      repo.hasAnyMatricula.mockResolvedValue(true)

      const useCase = new JoinGroupsUseCase(repo)

      await expect(
        useCase.execute({ codigo_acceso: "ABC", id_estudiante: 1 })
      ).rejects.toThrow("Ya perteneces a un grupo")
    })
  })

  // =========================
  // GENERATE CODE
  // =========================
  describe("GenerateGroupCodeUseCase", () => {
    it("debe generar y actualizar código", async () => {
      repo.updateCursoCodigo.mockResolvedValue({
        id_curso: 1,
        codigo_acceso: "ABC123"
      })

      const useCase = new GenerateGroupCodeUseCase(repo)

      const result = await useCase.execute(1)

      expect(result.codigo_acceso).toBe("ABC123")
      expect(repo.updateCursoCodigo).toHaveBeenCalled()
    })
  })

  // =========================
  // REMOVE STUDENT (PROFESOR)
  // =========================
  describe("RemoveStudentGroupUseCase", () => {
    it("debe eliminar estudiante si es el profesor", async () => {
      repo.findCursoById.mockResolvedValue({ id_profesor: 1 })
      repo.deleteMatricula.mockResolvedValue({ success: true })

      const useCase = new RemoveStudentGroupUseCase(repo)

      const result = await useCase.execute(1, 10, 20)

      expect(result.success).toBe(true)
    })

    it("debe fallar si el curso no existe", async () => {
      repo.findCursoById.mockResolvedValue(null)

      const useCase = new RemoveStudentGroupUseCase(repo)

      await expect(
        useCase.execute(1, 10, 20)
      ).rejects.toThrow("Curso no encontrado")
    })

    it("debe fallar si no es el profesor", async () => {
      repo.findCursoById.mockResolvedValue({ id_profesor: 99 })

      const useCase = new RemoveStudentGroupUseCase(repo)

      await expect(
        useCase.execute(1, 10, 20)
      ).rejects.toThrow("No tienes permisos")
    })
  })

  // =========================
  // LEAVE GROUP
  // =========================
  describe("LeaveGroupUseCase", () => {
    it("debe salir del grupo correctamente", async () => {
      repo.existsMatricula.mockResolvedValue(true)
      repo.deleteMatricula.mockResolvedValue({ success: true })

      const useCase = new LeaveGroupUseCase(repo)

      const result = await useCase.execute(1, 10)

      expect(result.success).toBe(true)
    })

    it("debe fallar si no está matriculado", async () => {
      repo.existsMatricula.mockResolvedValue(false)

      const useCase = new LeaveGroupUseCase(repo)

      await expect(
        useCase.execute(1, 10)
      ).rejects.toThrow("No estás matriculado")
    })
  })
})
