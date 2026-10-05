import { describe, it, expect, vi, beforeEach } from "vitest"

import { RegisterEstudianteUseCase } from "../src/server/auth/application/useCases/RegisterEstudianteUseCase"
import { RegisterProfesorUseCase } from "../src/server/auth/application/useCases/RegisterProfesorUseCase"

vi.mock("bcrypt", async (importOriginal) => {
    const actual = await importOriginal<any>()
    return {
        ...actual,
        default: {
            ...actual.default,
            hash: vi.fn()
        }
    }
})

import bcrypt from "bcrypt"

describe("Register UseCases", () => {

    let repo: any
    let emailService: any

    const mockedHash = bcrypt.hash as unknown as ReturnType<typeof vi.fn>

    beforeEach(() => {

        vi.spyOn(console, 'error').mockImplementation(() => {})
        
        repo = {
            findUsuarioAuthByEmail: vi.fn(),
            createUsuarioAuth: vi.fn(),
            createEstudiante: vi.fn(),
            createProfesor: vi.fn(),
            findEstudianteByCodigoUnico: vi.fn(),
        }

        emailService = {
            sendConfirmationEmail: vi.fn()
        }

        vi.clearAllMocks()
    })

    // ==========================
    // REGISTRAR ESTUDIANTE
    // ==========================
    describe("RegisterEstudianteUseCase", () => {

        let useCase: RegisterEstudianteUseCase

        beforeEach(() => {
            useCase = new RegisterEstudianteUseCase(repo, emailService)
        })

        it("debe lanzar error si el email ya existe", async () => {
            repo.findUsuarioAuthByEmail.mockResolvedValue({})

            await expect(
                useCase.execute({ correo_electronico: "test@epn.edu.ec" } as any)
            ).rejects.toThrow("El correo electrónico ya está registrado")
        })

        it("debe registrar estudiante correctamente", async () => {
            repo.findUsuarioAuthByEmail.mockResolvedValue(null)

            mockedHash.mockResolvedValue("hashed")

            repo.createUsuarioAuth.mockResolvedValue({ id_usuario_auth: 1 })
            repo.createEstudiante.mockResolvedValue({ id_estudiante: 10 })

            const result = await useCase.execute({
                correo_electronico: "test@epn.edu.ec",
                contrasenia: "12345678",
                codigo_unico: 1,
                primernombre: "Atik",
                segundo_nombre: "A",
                primer_apellido: "Tuquerrez",
                segundo_apellido: "F"
            })

            expect(result.id_estudiante).toBe(10)
            expect(emailService.sendConfirmationEmail).toHaveBeenCalled()
        })

        it("no debe fallar si el email no se envía", async () => {
            repo.findUsuarioAuthByEmail.mockResolvedValue(null)

            mockedHash.mockResolvedValue("hashed")

            repo.createUsuarioAuth.mockResolvedValue({ id_usuario_auth: 1 })
            repo.createEstudiante.mockResolvedValue({ id_estudiante: 10 })

            emailService.sendConfirmationEmail.mockRejectedValue(new Error("fail"))

            const result = await useCase.execute({
                correo_electronico: "test@epn.edu.ec",
                contrasenia: "12345678",
                codigo_unico: 1,
                primernombre: "Atik",
                segundo_nombre: "A",
                primer_apellido: "Tuquerrez",
                segundo_apellido: "F"
            })

            expect(result.id_estudiante).toBe(10)
        })
    })

    // ==========================
    // REGISTRAR PROFESOR
    // ==========================
    describe("RegisterProfesorUseCase", () => {

        let useCase: RegisterProfesorUseCase

        beforeEach(() => {
            useCase = new RegisterProfesorUseCase(repo, emailService)
        })

        it("debe lanzar error si el email ya existe", async () => {
            repo.findUsuarioAuthByEmail.mockResolvedValue({})

            await expect(
                useCase.execute({ correo_electronico: "test@epn.edu.ec" } as any)
            ).rejects.toThrow("El correo electrónico ya está registrado")
        })

        it("debe registrar profesor correctamente", async () => {
            repo.findUsuarioAuthByEmail.mockResolvedValue(null)

            mockedHash.mockResolvedValue("hashed")

            repo.createUsuarioAuth.mockResolvedValue({ id_usuario_auth: 1 })
            repo.createProfesor.mockResolvedValue({ id_profesor: 5 })

            const result = await useCase.execute({
                correo_electronico: "test@epn.edu.ec",
                contrasenia: "12345678",
                primernombre: "Atik",
                segundo_nombre: "A",
                primer_apellido: "Tuquerrez",
                segundo_apellido: "F"
            })

            expect(result.id_profesor).toBe(5)
            expect(emailService.sendConfirmationEmail).toHaveBeenCalled()
        })

        it("no debe fallar si el email no se envía", async () => {
            repo.findUsuarioAuthByEmail.mockResolvedValue(null)

            mockedHash.mockResolvedValue("hashed")

            repo.createUsuarioAuth.mockResolvedValue({ id_usuario_auth: 1 })
            repo.createProfesor.mockResolvedValue({ id_profesor: 5 })

            emailService.sendConfirmationEmail.mockRejectedValue(new Error("fail"))

            const result = await useCase.execute({
                correo_electronico: "test@epn.edu.ec",
                contrasenia: "12345678",
                primernombre: "Atik",
                segundo_nombre: "A",
                primer_apellido: "Tuquerrez",
                segundo_apellido: "F"
            })

            expect(result.id_profesor).toBe(5)
        })
    })

})
