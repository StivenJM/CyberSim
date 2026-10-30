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
	readonly date: string
	readonly message: string
	readonly files: readonly RepositoryFile[]
}

const CRYPTO_CONFIG_H1: RepositoryFile = {
	path: 'src/crypto-config.ts',
	lines: [
		"export const KEY_ID = 'legacy-demo';",
		"export const KEY_HEX = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';",
	],
}

const CRYPTO_CONFIG_H2: RepositoryFile = {
	path: 'src/crypto-config.ts',
	lines: [
		"export const KEY_ID = 'legacy-demo';",
		"export const KEY_SOURCE = 'runtime-reference';",
	],
}

const CRYPTO_FLOW: RepositoryFile = {
	path: 'src/crypto-flow.txt',
	lines: [
		'key = keyService.get(KEY_ID)',
		'cipher = AES-256-GCM',
		'iv = independent per record',
		'tag = 128 bits',
		'aad = AndinaPay|<recordId>|<version>',
	],
}

const PUBLIC_CONFIG: RepositoryFile = {
	path: 'public-config.txt',
	lines: ['MERCHANT_PUBLIC_ID=merchant-demo-17'],
}

export const ANDINAPAY_REVISIONS: readonly RepositoryRevision[] = [
	{
		id: 'AP-H1',
		date: '2026-08-03 10:00',
		message: 'demo encryption',
		files: [CRYPTO_CONFIG_H1],
	},
	{
		id: 'AP-H2',
		date: '2026-09-01 11:00',
		message: 'use runtime key reference',
		files: [CRYPTO_CONFIG_H2],
	},
	{
		id: 'AP-H3',
		date: '2026-10-24 16:00',
		message: 'document key flow',
		files: [CRYPTO_CONFIG_H2, CRYPTO_FLOW, PUBLIC_CONFIG],
	},
]

/** Candidate change shown to the scanner; it is not part of any revision. */
export const ANDINAPAY_PROPOSED_CHANGE: RepositoryFile = {
	path: 'src/demo-copy.ts',
	lines: [
		"export const KEY_ID = 'legacy-demo';",
		"export const KEY_HEX = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';",
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
