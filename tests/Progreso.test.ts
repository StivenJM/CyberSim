import { describe, it, expect, vi, beforeEach } from "vitest"

import { GuardarProgresoUseCase } from "../src/server/auth/application/useCases/GuardarProgresoUseCase"
import { ObtenerProgresoUseCase } from "../src/server/auth/application/useCases/ObtenerProgresoUseCase"
import { ObtenerTodosProgresosUseCase } from "../src/server/auth/application/useCases/ObtenerTodosProgresosUseCase"
import { ObtenerEstudianteProfesorUseCase } from "../src/server/auth/application/useCases/ObtenerEstudianteProfesorUseCase"

import type { IProgresoRepository } from "../src/server/auth/domain/repositories/IProgresoRepository"
import type { IAuthRepository } from "../src/server/auth/domain/repositories/IAuthRepository"

describe("Progreso UseCases", () => {

  let progresoRepo: IProgresoRepository
  let authRepo: IAuthRepository

  beforeEach(() => {
    progresoRepo = {
      guardarProgresoEstudiante: vi.fn(),
      getProgresoEstudiante: vi.fn(),
      getTodosProgresosEstudiante: vi.fn()
    }

    authRepo = {
      findEstudiantesByProfesor: vi.fn()
    } as unknown as IAuthRepository

    vi.clearAllMocks()
  })

  // ==========================
  // GUARDAR PROGRESO
  // ==========================
  describe("GuardarProgresoUseCase", () => {

    it("debe lanzar error si el tiempo es negativo", async () => {
      const useCase = new GuardarProgresoUseCase(progresoRepo)

      await expect(
        useCase.execute({
          id_estudiante: 1,
          slug_escenario: "escenario-1",
          terminado: false,
          tiempo: -10,
          acciones: ""
        })
      ).rejects.toThrow("El tiempo no puede ser negativo")
    })

    it("debe guardar progreso correctamente", async () => {
      const useCase = new GuardarProgresoUseCase(progresoRepo)

        ; (progresoRepo.guardarProgresoEstudiante as any).mockResolvedValue({
          id_progreso: 1
        })

      const result = await useCase.execute({
        id_estudiante: 1,
        slug_escenario: "escenario-1",
        terminado: true,
        tiempo: 120,
        acciones: ""
      })

      expect(result.id_progreso).toBe(1)
      expect(progresoRepo.guardarProgresoEstudiante).toHaveBeenCalled()
    })
  })

  // ==========================
  // OBTENER PROGRESO
  // ==========================
  describe("ObtenerProgresoUseCase", () => {

    it("debe retornar el progreso del estudiante", async () => {
      const useCase = new ObtenerProgresoUseCase(progresoRepo)

        ; (progresoRepo.getProgresoEstudiante as any).mockResolvedValue({
          terminado: true,
          intentos: 3
        })

      const result = await useCase.execute(1, "escenario-1")

      expect(result?.terminado).toBe(true)
      expect(result?.intentos).toBe(3)
    })
  })

  // ==========================
  // OBTENER TODOS LOS PROGRESOS
  // ==========================
  describe("ObtenerTodosProgresosUseCase", () => {

    it("debe retornar lista de progresos", async () => {
      const useCase = new ObtenerTodosProgresosUseCase(progresoRepo)

        ; (progresoRepo.getTodosProgresosEstudiante as any).mockResolvedValue([
          { id_progreso: 1 },
          { id_progreso: 2 }
        ])

      const result = await useCase.execute(1)

      expect(result.length).toBe(2)
    })
  })

  // ==========================
  // OBTENER ESTUDIANTES POR PROFESOR
  // ==========================
  describe("ObtenerEstudianteProfesorUseCase", () => {

    it("debe lanzar error si el id es inválido", async () => {
      const useCase = new ObtenerEstudianteProfesorUseCase(authRepo)

      await expect(
        useCase.execute(0)
      ).rejects.toThrow("ID de profesor inválido")
    })

    it("debe retornar estudiantes del profesor", async () => {
      const useCase = new ObtenerEstudianteProfesorUseCase(authRepo)

        ; (authRepo.findEstudiantesByProfesor as any).mockResolvedValue([
          { id_estudiante: 1 },
          { id_estudiante: 2 }
        ])

      const result = await useCase.execute(1)

      expect(result.length).toBe(2)
      expect(authRepo.findEstudiantesByProfesor).toHaveBeenCalledWith(1)
    })
  })

})