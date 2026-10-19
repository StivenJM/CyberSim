import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { databaseUrl } from '../src/integrations/config.js'

if (!process.env.DATABASE_URL && process.env.PGHOST)
	process.env.DATABASE_URL = databaseUrl()
if (!process.env.DATABASE_URL)
	throw new Error(
		'DATABASE_URL requerida para seed; no hay destino de respaldo.',
	)
const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
	log: ['error'],
})
async function main() {
	const password = await bcrypt.hash('password123', 10)
	await prisma.$transaction(
		async (tx) => {
			await tx.$executeRaw`SELECT pg_advisory_xact_lock(6729031)`
			const teacherAuth = await tx.usuario_auth.upsert({
				where: { correo_electronico: 'profesor@test.com' },
				update: {},
				create: {
					correo_electronico: 'profesor@test.com',
					contrasenia_hash: password,
					confirmado: true,
				},
			})
			if (
				await tx.estudiante.findUnique({
					where: { id_usuario_auth: teacherAuth.id_usuario_auth },
				})
			)
				throw new Error('Fixture profesor tiene rol incompatible.')
			const teacher = await tx.profesor.upsert({
				where: { id_usuario_auth: teacherAuth.id_usuario_auth },
				update: {},
				create: {
					id_usuario_auth: teacherAuth.id_usuario_auth,
					primernombre: 'Juan',
					segundo_nombre: 'Carlos',
					primer_apellido: 'García',
					segundo_apellido: 'López',
				},
			})
			let course = await tx.curso.findUnique({
				where: { codigo_acceso: 'CYBER2024' },
			})
			if (course && course.id_profesor !== teacher.id_profesor)
				throw new Error('Código CYBER2024 pertenece a otro profesor.')
			course =
				course ||
				(await tx.curso.findFirst({
					where: {
						id_profesor: teacher.id_profesor,
						nombre: 'Ciberseguridad 101',
					},
				}))
			course =
				course ||
				(await tx.curso.create({
					data: {
						id_profesor: teacher.id_profesor,
						nombre: 'Ciberseguridad 101',
						codigo_acceso: 'CYBER2024',
						codigo_expira: new Date(Date.now() + 90 * 86400000),
					},
				}))
			for (const fixture of [
				{
					email: 'estudiante1@test.com',
					code: 20240001,
					name: 'María',
					second: 'Fernanda',
					last: 'Rodríguez',
					other: 'Martínez',
				},
				{
					email: 'estudiante2@test.com',
					code: 20240002,
					name: 'Pedro',
					second: 'Antonio',
					last: 'Sánchez',
					other: 'Torres',
				},
			]) {
				const auth = await tx.usuario_auth.upsert({
					where: { correo_electronico: fixture.email },
					update: {},
					create: {
						correo_electronico: fixture.email,
						contrasenia_hash: password,
						confirmado: true,
					},
				})
				if (
					await tx.profesor.findFirst({
						where: { id_usuario_auth: auth.id_usuario_auth },
					})
				)
					throw new Error('Fixture estudiante tiene rol incompatible.')
				const student = await tx.estudiante.upsert({
					where: { id_usuario_auth: auth.id_usuario_auth },
					update: {},
					create: {
						id_usuario_auth: auth.id_usuario_auth,
						codigo_unico: fixture.code,
						primernombre: fixture.name,
						segundo_nombre: fixture.second,
						primer_apellido: fixture.last,
						segundo_apellido: fixture.other,
					},
				})
				if (
					!(await tx.matricula.findFirst({
						where: {
							id_curso: course.id_curso,
							id_estudiante: student.id_estudiante,
						},
					}))
				)
					await tx.matricula.create({
						data: {
							id_curso: course.id_curso,
							id_estudiante: student.id_estudiante,
						},
					})
				if (
					fixture.code === 20240001 &&
					!(await tx.progreso.findFirst({
						where: {
							id_estudiante: student.id_estudiante,
							slug_escenario: 'control-acceso',
						},
					}))
				)
					await tx.progreso.create({
						data: {
							id_estudiante: student.id_estudiante,
							slug_escenario: 'control-acceso',
							terminado: false,
							tiempo: 0,
						},
					})
			}
		},
		{ timeout: 15000 },
	)
	console.log(
		'Seed comprobado: faltantes completados, registros existentes conservados.',
	)
}
main()
	.catch(() => {
		console.error(
			'Seed fallido: revisar colisiones/destino; no se ejecuta reset.',
		)
		process.exitCode = 1
	})
	.finally(() => prisma.$disconnect())
