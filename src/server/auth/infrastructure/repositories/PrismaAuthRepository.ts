import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js"
import type { Estudiante, EstudianteInput, EstudiantePublic } from "../../domain/models/Estudiante.js"
import type { Profesor, ProfesorInput } from "../../domain/models/Profesor.js"
import type { UsuarioAuth, UsuarioAuthInput } from "../../domain/models/UsuarioAuth.js"
import { prisma } from "../db/prisma.js"

interface UsuarioAuthPersistence {
  id_usuario_auth: number
  correo_electronico: string
  contrasenia_hash: string
  confirmado: boolean
  token_confirmacion: string | null
  token_recuperacion: string | null
  token_expira: Date | null
  creado_en: Date
}

export class PrismaAuthRepository implements IAuthRepository {

  //Conversiones
  private mapUsuarioAuthToModel(prismaUser: UsuarioAuthPersistence): UsuarioAuth {
    return {
      id_usuario_auth: prismaUser.id_usuario_auth,
      correo_electronico: prismaUser.correo_electronico,
      contrasenia_hash: prismaUser.contrasenia_hash,
      confirmado: prismaUser.confirmado,
      token_confirmacion: prismaUser.token_confirmacion ?? undefined,
      token_recuperacion: prismaUser.token_recuperacion ?? undefined,
      token_expira: prismaUser.token_expira ? prismaUser.token_expira.toISOString() : undefined,
      creado_en: prismaUser.creado_en.toISOString()
    }
  }

  // UsuarioAuth

  async createUsuarioAuth(data: UsuarioAuthInput): Promise<UsuarioAuth> {
    const created = await prisma.usuario_auth.create({
      data: {
        correo_electronico: data.correo_electronico,
        contrasenia_hash: data.contrasenia_hash,
        token_confirmacion: data.token_confirmacion ?? null,
        token_recuperacion: data.token_recuperacion ?? null,
        token_expira: data.token_expira ? new Date(data.token_expira) : null,
      }
    })
    return this.mapUsuarioAuthToModel(created)
  }

  async findUsuarioAuthByEmail(correo_electronico: string): Promise<UsuarioAuth | null> {
    const found = await prisma.usuario_auth.findUnique({
      where: { correo_electronico }
    })
    return found ? this.mapUsuarioAuthToModel(found) : null
  }

  async findUsuarioAuthById(id_usuario_auth: number): Promise<UsuarioAuth | null> {
    const found = await prisma.usuario_auth.findUnique({
      where: { id_usuario_auth }
    })
    return found ? this.mapUsuarioAuthToModel(found) : null
  }

  async findUsuarioAuthByToken(token: string): Promise<UsuarioAuth | null> {
    const found = await prisma.usuario_auth.findFirst({
      where: { token_confirmacion: token }
    })
    return found ? this.mapUsuarioAuthToModel(found) : null
  }

  async findUsuarioAuthByRecoveryToken(token: string): Promise<UsuarioAuth | null> {
    const found = await prisma.usuario_auth.findFirst({
      where: { token_recuperacion: token }
    })
    return found ? this.mapUsuarioAuthToModel(found) : null
  }

  async confirmUsuarioAuth(id_usuario_auth: number): Promise<void> {
    await prisma.usuario_auth.update({
      where: { id_usuario_auth },
      data: {
        confirmado: true,
        token_confirmacion: null,
        token_expira: null
      }
    })
  }

  async updateTokenRecuperacion(id_usuario_auth: number, token: string, expira: string): Promise<void> {
    await prisma.usuario_auth.update({
      where: { id_usuario_auth },
      data: {
        token_recuperacion: token,
        token_expira: new Date(expira)
      }
    })
  }

  async updateTokenConfirmacion(id_usuario_auth: number, token: string, expira: string): Promise<void> {
    await prisma.usuario_auth.update({
      where: { id_usuario_auth },
      data: {
        token_confirmacion: token,
        token_expira: new Date(expira)
      }
    })
  }

  async updatePassword(id_usuario_auth: number, nuevaContrasenia: string): Promise<void> {
    await prisma.usuario_auth.update({
      where: { id_usuario_auth },
      data: {
        contrasenia_hash: nuevaContrasenia,
        token_recuperacion: null,
        token_expira: null
      }
    })
  }

  // Estudiante

  async createEstudiante(data: EstudianteInput & { id_usuario_auth: number }): Promise<Estudiante> {
    const created = await prisma.estudiante.create({
      data: {
        id_usuario_auth: data.id_usuario_auth,
        codigo_unico: data.codigo_unico,
        primernombre: data.primernombre,
        segundo_nombre: data.segundo_nombre,
        primer_apellido: data.primer_apellido,
        segundo_apellido: data.segundo_apellido,
      },
    })
    return created as Estudiante
  }

  async findEstudianteByUsuarioAuth(id_usuario_auth: number): Promise<Estudiante | null> {
    const found = await prisma.estudiante.findUnique({
      where: { id_usuario_auth }
    })
    return found as Estudiante | null
  }

  async findEstudianteById(id_estudiante: number): Promise<Estudiante | null> {
    const found = await prisma.estudiante.findUnique({
      where: { id_estudiante }
    })
    return found as Estudiante | null
  }

  async findEstudiantesByProfesor(id_profesor: number): Promise<EstudiantePublic[]> {
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        matricula: {
          some: {
            curso: {
              id_profesor
            }
          }
        }
      },
      orderBy: {
        primer_apellido: 'asc'
      }
    })

    return estudiantes as EstudiantePublic[]
  }

  async findEstudianteByCodigoUnico(codigo_unico: number): Promise<Estudiante | null> {
    const found = await prisma.estudiante.findUnique({
      where: { codigo_unico }
    })
    return found as Estudiante | null
  }

  // Profesor

  async createProfesor(data: ProfesorInput & { id_usuario_auth: number }): Promise<Profesor> {
    const created = await prisma.profesor.create({
      data: {
        id_usuario_auth: data.id_usuario_auth,
        primernombre: data.primernombre,
        segundo_nombre: data.segundo_nombre,
        primer_apellido: data.primer_apellido,
        segundo_apellido: data.segundo_apellido,
      },
    })
    return created as Profesor
  }

  async findProfesorByUsuarioAuth(id_usuario_auth: number): Promise<Profesor | null> {
    const found = await prisma.profesor.findUnique({
      where: { id_usuario_auth }
    })
    return found as Profesor | null
  }
}