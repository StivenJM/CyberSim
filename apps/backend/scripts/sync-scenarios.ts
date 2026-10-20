import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
	validateScenarioEnvelope,
	verifyScenarioContentHash,
} from '@cybersim/scenario-contract'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'
import type { Prisma } from '../src/generated/prisma/index.js'
import { databaseUrl } from '../src/integrations/config.js'

const directory = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../../frontend/src/data/escenarios',
)

async function loadPublishedManifests(): Promise<Record<string, unknown>[]> {
	const manifests: Record<string, unknown>[] = []
	for (const file of fs
		.readdirSync(directory)
		.filter((name) => /^escenario.+\.ts$/.test(name))
		.sort()) {
		const module = (await import(
			pathToFileURL(path.join(directory, file)).href
		)) as Record<string, unknown>
		for (const value of Object.values(module)) {
			if (!value || typeof value !== 'object' || !('schemaVersion' in value)) {
				continue
			}
			const manifest = value as Record<string, unknown>
			const validation = validateScenarioEnvelope(manifest)
			if (!validation.ok || !verifyScenarioContentHash(manifest)) {
				throw new Error(
					`Invalid manifest in ${file}: ${validation.errors.join('; ') || 'content hash mismatch'}`,
				)
			}
			if (manifest.status === 'published') manifests.push(manifest)
		}
	}
	return manifests
}

if (!process.env.DATABASE_URL && process.env.PGHOST) {
	process.env.DATABASE_URL = databaseUrl()
}
if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required to synchronize scenarios.')
}

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
	log: ['error'],
})

try {
	const manifests = await loadPublishedManifests()
	for (const manifest of manifests) {
		await prisma.$transaction(async (tx) => {
			const scenario = await tx.escenario.upsert({
				where: { slug: String(manifest.slug) },
				update: {
					titulo: String(manifest.titulo),
					categoria: String(manifest.categoria),
					descripcion: String(manifest.descripcion),
				},
				create: {
					slug: String(manifest.slug),
					titulo: String(manifest.titulo),
					categoria: String(manifest.categoria),
					descripcion: String(manifest.descripcion),
				},
			})
			const number = Number(manifest.revision)
			const existing = await tx.revision_escenario.findUnique({
				where: {
					id_escenario_numero: {
						id_escenario: scenario.id_escenario,
						numero: number,
					},
				},
			})
			if (existing && existing.content_hash !== manifest.contentHash) {
				throw new Error(
					`Revision ${number} of "${String(manifest.slug)}" is immutable; increment the revision.`,
				)
			}
			await tx.revision_escenario.updateMany({
				where: {
					id_escenario: scenario.id_escenario,
					estado: 'published',
					...(existing
						? { id_revision_escenario: { not: existing.id_revision_escenario } }
						: {}),
				},
				data: { estado: 'archived' },
			})
			const revisionData = {
				schema_version: Number(manifest.schemaVersion),
				estado: 'published',
				manifest: JSON.parse(JSON.stringify(manifest)) as Prisma.InputJsonValue,
				content_hash: String(manifest.contentHash),
				engine_version: String(manifest.engineVersion),
				asset_catalog_version: String(manifest.assetCatalogVersion),
				seed: Number(manifest.seed),
				publicado_en: new Date(),
			} as const
			if (existing) {
				await tx.revision_escenario.update({
					where: { id_revision_escenario: existing.id_revision_escenario },
					data: revisionData,
				})
			} else {
				await tx.revision_escenario.create({
					data: {
						id_escenario: scenario.id_escenario,
						numero: number,
						...revisionData,
					},
				})
			}
		})
	}
	console.log(`Synchronized ${manifests.length} published scenario revisions.`)
} finally {
	await prisma.$disconnect()
}
