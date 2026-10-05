import { describe, it, expect, vi, beforeEach } from "vitest"
import { LoginUseCase } from "../src/server/auth/application/useCases/LoginUseCase"

vi.mock("bcrypt", async (importOriginal) => {
    const actual = await importOriginal<any>()

    return {
        ...actual,
        default: {
            ...actual.default,
            compare: vi.fn()
        }
    }
})

vi.mock("jsonwebtoken", async (importOriginal) => {
    const actual = await importOriginal<any>()

    return {
        ...actual,
        default: {
            ...actual.default,
            sign: vi.fn()
        }
    }
})

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

describe("LoginUseCase", () => {
    let repo: any
    let useCase: LoginUseCase

    const mockedCompare = bcrypt.compare as unknown as ReturnType<typeof vi.fn>
    const mockedSign = jwt.sign as unknown as ReturnType<typeof vi.fn>

    beforeEach(() => {
        repo = {
            findUsuarioAuthByEmail: vi.fn(),
            findProfesorByUsuarioAuth: vi.fn(),
            findEstudianteByUsuarioAuth: vi.fn()
        }

        useCase = new LoginUseCase(repo, "secret")

        vi.clearAllMocks()
    })

    it("debe retornar null si el usuario no existe", async () => {
        repo.findUsuarioAuthByEmail.mockResolvedValue(null)

        const result = await useCase.execute("test@epn.edu.ec", "12345678")

        expect(result).toBeNull()
    })

    it("debe retornar null si la contraseña es incorrecta", async () => {
        repo.findUsuarioAuthByEmail.mockResolvedValue({
            id_usuario_auth: 1,
            contrasenia_hash: "hash",
            confirmado: true
        })

        mockedCompare.mockResolvedValue(false)

        const result = await useCase.execute("test@epn.edu.ec", "wrong")

        expect(result).toBeNull()
    })

    it("debe loguear como profesor", async () => {
        repo.findUsuarioAuthByEmail.mockResolvedValue({
            id_usuario_auth: 1,
            contrasenia_hash: "hash",
            confirmado: true
        })

        mockedCompare.mockResolvedValue(true)

        repo.findProfesorByUsuarioAuth.mockResolvedValue({
            id_profesor: 10
        })

        mockedSign.mockReturnValue("fake-jwt-token" as any)

        const result = await useCase.execute("test@epn.edu.ec", "12345678")

        expect(result?.role).toBe("profesor")
        expect(result?.token).toBe("fake-jwt-token")
    })

    it("debe loguear como estudiante", async () => {
        repo.findUsuarioAuthByEmail.mockResolvedValue({
            id_usuario_auth: 1,
            contrasenia_hash: "hash",
            confirmado: true
        })

        mockedCompare.mockResolvedValue(true)

        repo.findProfesorByUsuarioAuth.mockResolvedValue(null)
        repo.findEstudianteByUsuarioAuth.mockResolvedValue({
            id_estudiante: 20
        })

        mockedSign.mockReturnValue("fake-jwt-token" as any)

        const result = await useCase.execute("test@epn.edu.ec", "12345678")

        expect(result?.role).toBe("estudiante")
    })

    it("debe lanzar error si no tiene rol", async () => {
        repo.findUsuarioAuthByEmail.mockResolvedValue({
            id_usuario_auth: 1,
            contrasenia_hash: "hash",
            confirmado: true
        })

        mockedCompare.mockResolvedValue(true)

        repo.findProfesorByUsuarioAuth.mockResolvedValue(null)
        repo.findEstudianteByUsuarioAuth.mockResolvedValue(null)

        await expect(
            useCase.execute("test@epn.edu.ec", "12345678")
        ).rejects.toThrow("Usuario encontrado pero sin rol asignado")
    })
})
