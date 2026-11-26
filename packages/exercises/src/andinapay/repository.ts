import { envelopeFor } from './fixtures.js'

/**
 * Inert repository fixtures for the AndinaPay case.
 *
 * They reproduce the three authored revisions described in
 * `docs/project/ejercicios/cwe-321-andinapay.md`: the literal key is present in
 * AP-H1, removed from the working tree in AP-H2, and still absent in HEAD
 * (AP-H3) while the application keeps resolving the same key by identifier.
 * Nothing here is a real secret or a real commit.
 */

export type AndinaPayRevisionId = 'AP-H1' | 'AP-H2' | 'AP-H3'

export interface RepositoryFile {
	readonly path: string
	readonly lines: readonly string[]
}

export interface RepositoryRevision {
	readonly id: AndinaPayRevisionId
	readonly hash: string
	readonly date: string
	readonly message: string
	readonly files: readonly RepositoryFile[]
}

/**
 * AndinaPay API — repositorio ficticio con forma de backend TypeScript real.
 * La clave histórica vive en `src/config.ts`; el resto de archivos aporta
 * contexto de proyecto (rutas, servicios, tipos) sin lógica de dominio extra.
 */

const README: RepositoryFile = {
	path: 'README.md',
	lines: [
		'# AndinaPay API',
		'',
		'Servicio de pagos de AndinaPay.',
		'',
		'## Requisitos',
		'- Node 20+',
		'- pnpm',
		'',
		'## Desarrollo',
		'```bash',
		'pnpm install',
		'cp .env.example .env',
		'pnpm dev',
		'```',
		'',
		'## Endpoints',
		'- `GET /health`',
		'- `GET /payments`',
		'- `GET /payments/:recordId`',
	],
}

const ENV: RepositoryFile = {
	path: '.env',
	lines: [
		'PORT=3000',
		'DATABASE_URL=postgres://andinapay:andinapay@localhost:5432/andinapay',
		'LOG_LEVEL=info',
		'JWT_TTL=3600',
	],
}

const ENV_EXAMPLE: RepositoryFile = {
	path: '.env.example',
	lines: [
		'PORT=3000',
		'DATABASE_URL=postgres://user:password@localhost:5432/andinapay',
		'LOG_LEVEL=info',
		'JWT_TTL=3600',
	],
}

const GITIGNORE: RepositoryFile = {
	path: '.gitignore',
	lines: ['node_modules/', 'dist/', '.env', '*.log'],
}

const PACKAGE_JSON: RepositoryFile = {
	path: 'package.json',
	lines: [
		'{',
		'  "name": "andinapay-api",',
		'  "version": "2.4.0",',
		'  "private": true,',
		'  "type": "module",',
		'  "scripts": {',
		'    "dev": "tsx watch src/server.ts",',
		'    "build": "tsc -p tsconfig.json",',
		'    "start": "node dist/server.js",',
		'    "test": "vitest run"',
		'  },',
		'  "dependencies": {',
		'    "express": "^4.19.2",',
		'    "zod": "^3.23.8"',
		'  },',
		'  "devDependencies": {',
		'    "tsx": "^4.19.0",',
		'    "typescript": "^5.6.3",',
		'    "vitest": "^2.1.4"',
		'  }',
		'}',
	],
}

const TSCONFIG: RepositoryFile = {
	path: 'tsconfig.json',
	lines: [
		'{',
		'  "compilerOptions": {',
		'    "target": "ES2022",',
		'    "module": "NodeNext",',
		'    "moduleResolution": "NodeNext",',
		'    "strict": true,',
		'    "esModuleInterop": true,',
		'    "outDir": "dist",',
		'    "rootDir": "src"',
		'  },',
		'  "include": ["src"]',
		'}',
	],
}

const SERVER: RepositoryFile = {
	path: 'src/server.ts',
	lines: [
		"import express from 'express'",
		"import { config } from './config.js'",
		"import { healthRouter } from './routes/health.route.js'",
		"import { paymentsRouter } from './routes/payments.route.js'",
		'',
		'const app = express()',
		'',
		'app.use(express.json())',
		"app.use('/health', healthRouter)",
		"app.use('/payments', paymentsRouter)",
		'',
		'app.listen(config.port, () => {',
		"  console.log('AndinaPay API escuchando en :' + config.port)",
		'})',
	],
}

const HEALTH_ROUTE: RepositoryFile = {
	path: 'src/routes/health.route.ts',
	lines: [
		"import { Router } from 'express'",
		'',
		'export const healthRouter = Router()',
		'',
		"healthRouter.get('/', (_req, res) => {",
		"  res.json({ status: 'ok', uptime: process.uptime() })",
		'})',
	],
}

const PAYMENTS_ROUTE: RepositoryFile = {
	path: 'src/routes/payments.route.ts',
	lines: [
		"import { Router } from 'express'",
		"import { readRecord, listRecords } from '../services/payment.service.js'",
		'',
		'export const paymentsRouter = Router()',
		'',
		"paymentsRouter.get('/', async (_req, res) => {",
		'  res.json(await listRecords())',
		'})',
		'',
		"paymentsRouter.get('/:recordId', async (req, res, next) => {",
		'  try {',
		'    res.json(await readRecord(req.params.recordId))',
		'  } catch (error) {',
		'    next(error)',
		'  }',
		'})',
	],
}

const PAYMENT_SERVICE: RepositoryFile = {
	path: 'src/services/payment.service.ts',
	lines: [
		"import { config } from '../config.js'",
		"import { openEnvelope } from './crypto.service.js'",
		"import type { PaymentRecord } from '../types/payment.types.js'",
		'',
		'export async function listRecords(): Promise<PaymentRecord[]> {',
		'  return db.select().from(payments)',
		'}',
		'',
		'export async function readRecord(recordId: string) {',
		'  const envelope = await db.envelopes.find(recordId)',
		'  const plaintext = await openEnvelope(envelope, config.legacyKeyId)',
		'  return { recordId, plaintext }',
		'}',
	],
}

const CRYPTO_SERVICE_MIN: RepositoryFile = {
	path: 'src/services/crypto.service.ts',
	lines: [
		"import { createDecipheriv } from 'node:crypto'",
		'',
		'export async function openEnvelope(envelope, keyId) {',
		'  const key = await keyService.get(keyId)',
		'  // AES-256-GCM: verifica el tag antes de devolver el texto.',
		'  return decrypt(envelope, key)',
		'}',
	],
}

const CRYPTO_SERVICE_DOCS: RepositoryFile = {
	path: 'src/services/crypto.service.ts',
	lines: [
		"import { createDecipheriv } from 'node:crypto'",
		'',
		'// app-payments: lectura de sobres con AES-256-GCM.',
		'// key = keyService.get(KEY_ID)',
		'// iv  = independiente por registro',
		'// tag = 128 bits',
		'// aad = AndinaPay|<recordId>|<version>',
		'export async function openEnvelope(envelope, keyId) {',
		'  const key = await keyService.get(keyId)',
		'  // AES-256-GCM: verifica el tag antes de devolver el texto.',
		'  return decrypt(envelope, key)',
		'}',
	],
}

const PAYMENT_TYPES: RepositoryFile = {
	path: 'src/types/payment.types.ts',
	lines: [
		'export interface PaymentRecord {',
		'  recordId: string',
		'  merchantId: string',
		'  amount: number',
		'  currency: string',
		'}',
		'',
		'export interface PaymentEnvelope {',
		'  recordId: string',
		'  keyId: string',
		'  version: number',
		'  ivHex: string',
		'  tagHex: string',
		'  ciphertextHex: string',
		'}',
	],
}

/** config.ts en la versión histórica: la clave literal quedó escrita. */
const CONFIG_H1: RepositoryFile = {
	path: 'src/config.ts',
	lines: [
		'export const config = {',
		'  port: Number(process.env.PORT ?? 3000),',
		"  databaseUrl: process.env.DATABASE_URL ?? '',",
		"  merchantId: 'merchant-demo-17',",
		"  legacyKeyId: 'legacy-demo',",
		'  // Clave de cifrado de app-payments (queda en texto plano).',
		'  legacyKeyHex:',
		"    '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',",
		'}',
	],
}

/** config.ts tras retirar el literal: la clave se resuelve en runtime. */
const CONFIG_H2: RepositoryFile = {
	path: 'src/config.ts',
	lines: [
		'export const config = {',
		'  port: Number(process.env.PORT ?? 3000),',
		"  databaseUrl: process.env.DATABASE_URL ?? '',",
		"  merchantId: 'merchant-demo-17',",
		"  legacyKeyId: 'legacy-demo',",
		"  keySource: 'runtime-reference',",
		'}',
	],
}

const BASE_FILES: readonly RepositoryFile[] = [
	README,
	GITIGNORE,
	ENV,
	ENV_EXAMPLE,
	PACKAGE_JSON,
	TSCONFIG,
	SERVER,
	HEALTH_ROUTE,
	PAYMENTS_ROUTE,
	PAYMENT_SERVICE,
	PAYMENT_TYPES,
]

export const ANDINAPAY_REVISIONS: readonly RepositoryRevision[] = [
	{
		id: 'AP-H1',
		hash: '3f9a1c2',
		date: '2026-08-03 10:00',
		message: 'feat: bootstrap payment service',
		files: [...BASE_FILES, CRYPTO_SERVICE_MIN, CONFIG_H1],
	},
	{
		id: 'AP-H2',
		hash: 'b71e04d',
		date: '2026-09-01 11:00',
		message: 'refactor: load key from runtime reference',
		files: [...BASE_FILES, CRYPTO_SERVICE_MIN, CONFIG_H2],
	},
	{
		id: 'AP-H3',
		hash: 'd6fe10f',
		date: '2026-10-24 16:00',
		message: 'docs: annotate AES-GCM flow',
		files: [...BASE_FILES, CRYPTO_SERVICE_DOCS, CONFIG_H2],
	},
]

/** Candidate change shown to the scanner; it is not part of any revision. */
export const ANDINAPAY_PROPOSED_CHANGE: RepositoryFile = {
	path: 'src/config.example.ts',
	lines: [
		'// Copia propuesta en revisión; repite la clave literal.',
		'export const legacyKeyHex =',
		"  '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'",
	],
}

export function revisionById(
	id: AndinaPayRevisionId,
): RepositoryRevision | undefined {
	return ANDINAPAY_REVISIONS.find((revision) => revision.id === id)
}

function partialCopy(): string {
	return JSON.stringify(
		{
			note: 'copias sintéticas recibidas; no son credenciales utilizables',
			records: [
				envelopeFor('R01', 'legacy-demo', 1),
				envelopeFor('R02', 'legacy-demo', 1),
			],
		},
		null,
		2,
	)
}

export interface RepositoryArtifact {
	readonly path: string
	readonly lines: readonly string[]
}

/** Files that are not tied to a revision and stay available as A0 material. */
export const ANDINAPAY_ARTIFACTS: readonly RepositoryArtifact[] = [
	{
		path: 'incident/notice.txt',
		lines: [
			'08:30 — aviso anónimo recibido por el canal de soporte.',
			'Fragmento legible adjunto: SYN-001 / tok_demo_A',
			'Adjunto: partial-v1.json',
			'Origen no autenticado; no se conoce el vector de adquisición.',
		],
	},
	{
		path: 'data/partial-v1.json',
		lines: partialCopy().split('\n'),
	},
	{
		path: 'data/current-index.csv',
		lines: [
			'R01,legacy-demo,v1',
			'R02,legacy-demo,v1',
			'R03,archive-independent,v1',
		],
	},
	{
		path: 'keys/inventory.csv',
		lines: [
			'legacy-demo,active,app-payments:encrypt+decrypt,runtime-reference',
			'archive-independent,active,app-payments:decrypt,restricted-reference',
			'recovery-v2,not-activated,migration-worker:temporary-use,restricted-reference',
		],
	},
	{
		path: 'logs/application.log',
		lines: [
			'08:00 READ R01 key=legacy-demo result=ok',
			'08:01 READ R02 key=legacy-demo result=ok',
			'08:02 READ R03 key=archive-independent result=ok',
		],
	},
	{
		path: 'logs/monitoring.txt',
		lines: [
			'Ventana observada: 08:00–08:30',
			'Alertas registradas: 0',
			'Nota: no incluye auditoría completa del repositorio, exportaciones ni foro.',
		],
	},
	{
		path: 'recovery/policy.txt',
		lines: [
			'Conservar la evidencia inmutable.',
			'Leer los registros operativos y registrar un nuevo cliente ficticio.',
			'Retirar el uso de la clave comprometida después de migrar.',
			'Inventariar copias sin afirmar que se recuperan copias ajenas.',
		],
	},
]

export interface SearchMatch {
	readonly path: string
	readonly line: number
	readonly text: string
}

/**
 * Literal search over one revision. The search is intentionally case
 * insensitive but never interprets regular expressions: the student is
 * looking for a literal identifier, not writing a query.
 */
export function searchRevision(
	revision: AndinaPayRevisionId,
	query: string,
): readonly SearchMatch[] {
	const trimmed = query.trim()
	if (!trimmed) return []
	const needle = trimmed.toLowerCase()
	const files = revisionById(revision)?.files ?? []
	return files.flatMap((file) =>
		file.lines.flatMap((text, index) =>
			text.toLowerCase().includes(needle)
				? [{ path: file.path, line: index + 1, text }]
				: [],
		),
	)
}

export interface FileDiff {
	readonly path: string
	readonly removed: readonly string[]
	readonly added: readonly string[]
}

/** Line-oriented diff between two revisions, enough for the authored files. */
export function diffRevisions(
	from: AndinaPayRevisionId,
	to: AndinaPayRevisionId,
): readonly FileDiff[] {
	const before = revisionById(from)
	const after = revisionById(to)
	if (!before || !after) return []

	const paths = new Set([
		...before.files.map((file) => file.path),
		...after.files.map((file) => file.path),
	])

	return [...paths].flatMap((path) => {
		const oldFile = before.files.find((file) => file.path === path)
		const newFile = after.files.find((file) => file.path === path)
		const oldLines = oldFile?.lines ?? []
		const newLines = newFile?.lines ?? []
		const removed = oldLines.filter((line) => !newLines.includes(line))
		const added = newLines.filter((line) => !oldLines.includes(line))
		return removed.length || added.length ? [{ path, removed, added }] : []
	})
}
