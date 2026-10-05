import { describe, it, expect, vi, beforeEach } from "vitest"

import { CambiarContraseniaUseCase } from "../src/server/auth/application/useCases/CambiarContraseniaUseCase"
import { ConfirmarEmailUseCase } from "../src/server/auth/application/useCases/ConfirmarEmailUseCase"
import { ReenviarConfirmacionEmailUseCase } from "../src/server/auth/application/useCases/ReenviarConfirmacionEmailUseCase"
import { SolicitudCambioContraseniaUseCase } from "../src/server/auth/application/useCases/SolicitudCambioContraseniaUseCase"

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

describe("Auth Extra UseCases", () => {

  let repo: any
  let emailService: any

  const mockedHash = bcrypt.hash as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {

    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    repo = {
      findUsuarioAuthByRecoveryToken: vi.fn(),
      updatePassword: vi.fn(),
      findUsuarioAuthByToken: vi.fn(),
      confirmUsuarioAuth: vi.fn(),
      findUsuarioAuthByEmail: vi.fn(),
      updateTokenRecuperacion: vi.fn(),
      updateTokenConfirmacion: vi.fn(),
      findEstudianteByUsuarioAuth: vi.fn(),
      findProfesorByUsuarioAuth: vi.fn()
    }

    emailService = {
      sendConfirmationEmail: vi.fn(),
      sendPasswordResetEmail: vi.fn()
    }

    vi.clearAllMocks()
  })

  // ==========================
  // CAMBIAR CONTRASEÑA
  // ==========================
  describe("CambiarContraseniaUseCase", () => {

    it("error si token inválido", async () => {
      repo.findUsuarioAuthByRecoveryToken.mockResolvedValue(null)

      const useCase = new CambiarContraseniaUseCase(repo)

      await expect(
        useCase.execute("token", "123456")
      ).rejects.toThrow("Token de recuperación inválido")
    })

    it("error si token expirado", async () => {
      repo.findUsuarioAuthByRecoveryToken.mockResolvedValue({
        id_usuario_auth: 1,
        token_expira: new Date(Date.now() - 1000).toISOString()
      })

      const useCase = new CambiarContraseniaUseCase(repo)

      await expect(
        useCase.execute("token", "123456")
      ).rejects.toThrow("ha expirado")
    })

    it("error si contraseña corta", async () => {
      repo.findUsuarioAuthByRecoveryToken.mockResolvedValue({
        id_usuario_auth: 1,
        token_expira: new Date(Date.now() + 1000).toISOString()
      })

      const useCase = new CambiarContraseniaUseCase(repo)

      await expect(
        useCase.execute("token", "123")
      ).rejects.toThrow("al menos 6 caracteres")
    })

    it("debe cambiar contraseña correctamente", async () => {
      repo.findUsuarioAuthByRecoveryToken.mockResolvedValue({
        id_usuario_auth: 1,
        token_expira: new Date(Date.now() + 1000).toISOString()
      })

      mockedHash.mockResolvedValue("hashed")

      const useCase = new CambiarContraseniaUseCase(repo)

      const result = await useCase.execute("token", "123456")

      expect(result.success).toBe(true)
      expect(repo.updatePassword).toHaveBeenCalled()
    })
  })

  // ==========================
  // CONFIRMAR EMAIL
  // ==========================
  describe("ConfirmarEmailUseCase", () => {

    it("error si token inválido", async () => {
      repo.findUsuarioAuthByToken.mockResolvedValue(null)

      const useCase = new ConfirmarEmailUseCase(repo)

      await expect(
        useCase.execute("token")
      ).rejects.toThrow("Token de confirmación inválido")
    })

    it("retorna éxito si ya está confirmado", async () => {
      repo.findUsuarioAuthByToken.mockResolvedValue({
        confirmado: true
      })

      const useCase = new ConfirmarEmailUseCase(repo)

      const result = await useCase.execute("token")

      expect(result.success).toBe(true)
    })

    it("error si token expirado", async () => {
      repo.findUsuarioAuthByToken.mockResolvedValue({
        confirmado: false,
        token_expira: new Date(Date.now() - 1000).toISOString()
      })

      const useCase = new ConfirmarEmailUseCase(repo)

      await expect(
        useCase.execute("token")
      ).rejects.toThrow("ha expirado")
    })

    it("debe confirmar correctamente", async () => {
      repo.findUsuarioAuthByToken.mockResolvedValue({
        id_usuario_auth: 1,
        confirmado: false,
        token_expira: new Date(Date.now() + 1000).toISOString()
      })

      const useCase = new ConfirmarEmailUseCase(repo)

      const result = await useCase.execute("token")

      expect(result.success).toBe(true)
      expect(repo.confirmUsuarioAuth).toHaveBeenCalled()
    })
  })

  // ==========================
  // REENVIAR CONFIRMACIÓN
  // ==========================
  describe("ReenviarConfirmacionEmailUseCase", () => {

    it("error si no existe usuario", async () => {
      repo.findUsuarioAuthByEmail.mockResolvedValue(null)

      const useCase = new ReenviarConfirmacionEmailUseCase(repo, emailService)

      await expect(
        useCase.execute("test@epn.edu.ec")
      ).rejects.toThrow("No existe una cuenta")
    })

    it("error si ya está confirmado", async () => {
      repo.findUsuarioAuthByEmail.mockResolvedValue({
        confirmado: true
      })

      const useCase = new ReenviarConfirmacionEmailUseCase(repo, emailService)

      await expect(
        useCase.execute("test@epn.edu.ec")
      ).rejects.toThrow("ya está confirmada")
    })

    it("debe reenviar correo correctamente (estudiante)", async () => {
      repo.findUsuarioAuthByEmail.mockResolvedValue({
        id_usuario_auth: 1,
        confirmado: false
      })

      repo.findEstudianteByUsuarioAuth.mockResolvedValue({
        primernombre: "Atik",
        primer_apellido: "Tuquerrez"
      })

      const useCase = new ReenviarConfirmacionEmailUseCase(repo, emailService)

      const result = await useCase.execute("test@epn.edu.ec")

      expect(result.success).toBe(true)
      expect(emailService.sendConfirmationEmail).toHaveBeenCalled()
    })
  })

  // ==========================
  // SOLICITUD CAMBIO CONTRASEÑA
  // ==========================
  describe("SolicitudCambioContraseniaUseCase", () => {

    it("retorna éxito aunque no exista usuario", async () => {
      repo.findUsuarioAuthByEmail.mockResolvedValue(null)

      const useCase = new SolicitudCambioContraseniaUseCase(repo, emailService)

      const result = await useCase.execute("test@epn.edu.ec")

      expect(result.success).toBe(true)
    })

    it("error si no está confirmado", async () => {
      repo.findUsuarioAuthByEmail.mockResolvedValue({
        confirmado: false
      })

      const useCase = new SolicitudCambioContraseniaUseCase(repo, emailService)

      await expect(
        useCase.execute("test@epn.edu.ec")
      ).rejects.toThrow("Debes confirmar tu cuenta")
    })

    it("debe enviar email de recuperación", async () => {
      repo.findUsuarioAuthByEmail.mockResolvedValue({
        id_usuario_auth: 1,
        confirmado: true
      })

      repo.findEstudianteByUsuarioAuth.mockResolvedValue({
        primernombre: "JAtik",
        primer_apellido: "Tuquerrez"
      })

      const useCase = new SolicitudCambioContraseniaUseCase(repo, emailService)

      const result = await useCase.execute("test@epn.edu.ec")

      expect(result.success).toBe(true)
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled()
    })

    it("lanza error si falla envío de email", async () => {
      repo.findUsuarioAuthByEmail.mockResolvedValue({
        id_usuario_auth: 1,
        confirmado: true
      })

      emailService.sendPasswordResetEmail.mockRejectedValue(new Error())

      const useCase = new SolicitudCambioContraseniaUseCase(repo, emailService)

      await expect(
        useCase.execute("test@epn.edu.ec")
      ).rejects.toThrow("No se pudo enviar el email de recuperación")
    })
  })

})
