/**
 * NubeAndina (CWE-502) domain model.
 *
 * A toy typed-JSON session format with real Base64/HMAC verification over
 * inert documents. Restoring a session copies data and applies three
 * simulated effects (`restarts`, `role=admin`, `config=dirty`); it never
 * restarts a process, changes a real permission or executes code.
 */

import {
	applied,
	buildReport,
	bytesToHex,
	type CheckResult,
	type ExerciseReport,
	type OperationResult,
	reject,
	sha256Hex,
	utf8,
} from '../core.js'

export type NdDiff = 'N0' | 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6'
export type NdCommit = 'eager' | 'staged'

export const ND_HMAC_KEY_HEX = 'a1'.repeat(32)
export const ND_MAC_CONTEXT = 'NA1|session|org-7|'
export const ND_NOW = '2026-10-20T10:00:00Z'

export interface NdDocument {
	readonly id: string
	readonly json: string
	readonly tag: string
	readonly handle: string
}

const S01 =
	'{"type":"WorkspaceSession","owner":"org-7","expiresAt":"2026-10-20T11:00:00Z","filters":{"track":"security","pageSize":20},"template":"basic","preferences":{"theme":"dark"},"extensions":[]}'
const S02 =
	'{"type":"WorkspaceSession","owner":"org-7","expiresAt":"2026-10-20T11:00:00Z","filters":{"track":"design","pageSize":10},"template":"report","preferences":{"theme":"dark"},"extensions":[]}'
const S03 =
	'{"type":"RestoreHook","owner":"org-7","effects":["restart","role_admin","config_dirty"]}'
const S04 =
	'{"type":"WorkspaceSession","owner":"org-7","expiresAt":"2026-10-20T11:00:00Z","filters":{"track":"security","pageSize":20},"template":"basic","preferences":{"theme":"dark"},"extensions":[{"type":"RestoreHook","effects":["restart","role_admin","config_dirty"]}]}'
const S05 =
	'{"type":"WorkspaceSession","owner":"org-8","expiresAt":"2026-10-20T11:00:00Z","filters":{"track":"security","pageSize":20},"template":"basic","preferences":{"theme":"dark"},"extensions":[],"role":"admin"}'
const S06 =
	'{"type":"WorkspaceSession","owner":"org-7","expiresAt":"2026-10-20T09:00:00Z","filters":{"track":"security","pageSize":20},"template":"basic","preferences":{"theme":"dark"},"extensions":[]}'
const S07 = `${S01.slice(0, -1)},"note":"${'X'.repeat(2500)}"}`

export const ND_DOCUMENTS: readonly NdDocument[] = [
	{
		id: 'S01',
		json: S01,
		tag: 'c787db8e34f7a6c9e64d57be1b6573242ec8082315dff8f0cf16229001a5482c',
		handle: 'SID-7-A',
	},
	{
		id: 'S02',
		json: S02,
		tag: '9f8b96185ab511f0d9c1d997a966a8af84ad84b1cbe73e56568960cf91f3cde6',
		handle: 'SID-7-B',
	},
	{
		id: 'S03',
		json: S03,
		tag: '7a5c2024179989bf6b5ee5814d6f10768127336ddfb6350c1628212e9da5b432',
		handle: 'BLOB-S03',
	},
	{
		id: 'S04',
		json: S04,
		tag: 'ebbc0df281f52fadf7193b7a5e71d05bf27e7a2e016e73ce06f67f60f5373107',
		handle: 'BLOB-S04',
	},
	{
		id: 'S05',
		json: S05,
		tag: 'c6f72c9d7eac9312944fe8b361e8c5bfc63141aa1d0c7b3f7ca837f9f0860234',
		handle: 'SID-8-A',
	},
	{
		id: 'S06',
		json: S06,
		tag: 'fecfbdfabe8e0cfd15c30b52c11bf2a08646c4158e255d7fb763a9f85761b6f3',
		handle: 'SID-7-OLD',
	},
	{
		id: 'S07',
		json: S07,
		tag: 'b0cd02355212e548376aa108f2222e59fc901c5234e59f778ed9a13c6adb445c',
		handle: 'X'.repeat(2500),
	},
	{
		id: 'S08',
		json: S01,
		tag: 'c687db8e34f7a6c9e64d57be1b6573242ec8082315dff8f0cf16229001a5482c',
		handle: 'SID-7-A ',
	},
]

export function documentById(id: string): NdDocument | undefined {
	return ND_DOCUMENTS.find((entry) => entry.id === id)
}

export function base64(text: string): string {
	const bytes = utf8(text)
	let binary = ''
	for (const byte of bytes) binary += String.fromCharCode(byte)
	return btoa(binary)
}

export async function hmacHex(payload: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		hexBytes(ND_HMAC_KEY_HEX) as unknown as BufferSource,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	)
	const signature = await crypto.subtle.sign(
		'HMAC',
		key,
		utf8(`${ND_MAC_CONTEXT}${payload}`) as unknown as BufferSource,
	)
	return bytesToHex(new Uint8Array(signature))
}

function hexBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2)
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
	}
	return bytes
}

export const ND_LIMITS = {
	wire: 4096,
	bytes: 2048,
	depth: 5,
	extensions: 2,
	text: 80,
} as const

export interface NdPublished {
	readonly filters: { readonly track: string; readonly pageSize: number } | null
	readonly template: string | null
	readonly theme: string | null
	readonly role: 'organizer' | 'admin'
	readonly sessionOwner: string | null
	readonly restarts: number
	readonly configDirty: boolean
}

export function createNubeAndinaState(
	diff: NdDiff = 'N0',
	commit: NdCommit = 'eager',
): NdState {
	return {
		diff,
		commit,
		published: {
			filters: null,
			template: null,
			theme: null,
			role: 'organizer',
			sessionOwner: null,
			restarts: 0,
			configDirty: false,
		},
	}
}

export interface NdState {
	readonly diff: NdDiff
	readonly commit: NdCommit
	readonly published: NdPublished
}

export type NdTransport =
	| {
			readonly kind: 'blob'
			readonly payload: string
			readonly tag: string | null
	  }
	| { readonly kind: 'handle'; readonly handle: string }

export interface NdOutcome {
	readonly status: 'ok' | 'rejected' | 'technical_error'
	readonly reason: string
	readonly state: NdState
	readonly effects: readonly string[]
	readonly partial: boolean
}

type Parsed = Record<string, unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value)
}

function depthOf(value: unknown, current = 1): number {
	if (!isRecord(value) && !Array.isArray(value)) return current
	const children = Array.isArray(value) ? value : Object.values(value)
	return children.reduce(
		(max, child) => Math.max(max, depthOf(child, current + 1)),
		current,
	)
}

function collectHooks(value: unknown, found: string[] = []): string[] {
	if (Array.isArray(value)) {
		for (const entry of value) collectHooks(entry, found)
		return found
	}
	if (!isRecord(value)) return found
	if (value.type === 'RestoreHook') {
		found.push('hook')
	}
	for (const child of Object.values(value)) collectHooks(child, found)
	return found
}

function applyHook(
	published: NdPublished,
	effects: readonly string[],
): NdPublished {
	let next = published
	for (const effect of effects) {
		if (effect === 'restart') next = { ...next, restarts: next.restarts + 1 }
		if (effect === 'role_admin') next = { ...next, role: 'admin' }
		if (effect === 'config_dirty') next = { ...next, configDirty: true }
	}
	return next
}

function applyFields(published: NdPublished, data: Parsed): NdPublished {
	const filters = isRecord(data.filters)
		? {
				track: String(data.filters.track ?? ''),
				pageSize: Number(data.filters.pageSize ?? 0),
			}
		: null
	const preferences = isRecord(data.preferences) ? data.preferences : null
	return {
		...published,
		sessionOwner:
			typeof data.owner === 'string' ? data.owner : published.sessionOwner,
		filters: filters ?? published.filters,
		template:
			typeof data.template === 'string' ? data.template : published.template,
		theme:
			preferences && typeof preferences.theme === 'string'
				? preferences.theme
				: published.theme,
		role: typeof data.role === 'string' ? 'admin' : published.role,
	}
}

function basicLimits(payload: string): string | null {
	const decoded = atob(payload)
	if (decoded.length > ND_LIMITS.bytes) return 'size'
	return null
}

function schemaError(
	data: Parsed,
	extensions: readonly unknown[],
): string | null {
	if (data.type !== 'WorkspaceSession') return 'root_type'
	if (!isRecord(data.filters)) return 'filters'
	if (extensions.length > ND_LIMITS.extensions) return 'extensions'
	for (const extension of extensions) {
		if (!isRecord(extension) || extension.type !== 'PassiveNote') {
			return 'extension_type'
		}
	}
	if (typeof data.role === 'string') return 'client_authority'
	const longest = JSON.stringify(data)
		.split(/[",:{}[\]\\]+/)
		.filter((part) => part.trim().length > 0)
		.reduce((max, part) => Math.max(max, [...part].length), 0)
	if (longest > ND_LIMITS.text) return 'text'
	return null
}

function authorityError(data: Parsed): string | null {
	if (data.owner !== 'org-7') return 'owner'
	if (typeof data.expiresAt !== 'string' || data.expiresAt <= ND_NOW)
		return 'expiry'
	return null
}

const HANDLE_STORE: Readonly<
	Record<string, { owner: string; expiresAt: string; data: Parsed }>
> = {
	'SID-7-A': {
		owner: 'org-7',
		expiresAt: '2026-10-20T11:00:00Z',
		data: JSON.parse(S01) as Parsed,
	},
	'SID-7-B': {
		owner: 'org-7',
		expiresAt: '2026-10-20T11:00:00Z',
		data: JSON.parse(S02) as Parsed,
	},
	'SID-8-A': {
		owner: 'org-8',
		expiresAt: '2026-10-20T11:00:00Z',
		data: JSON.parse(S05) as Parsed,
	},
	'SID-7-OLD': {
		owner: 'org-7',
		expiresAt: '2026-10-20T09:00:00Z',
		data: JSON.parse(S06) as Parsed,
	},
}

function rejected(
	state: NdState,
	reason: string,
	effects: readonly string[] = [],
	published = state.published,
): NdOutcome {
	return {
		status: 'rejected',
		reason,
		state: { ...state, published },
		effects,
		partial: published !== state.published,
	}
}

export interface NdRestoreOptions {
	readonly faultAfterFirstField?: boolean
}

export async function restoreSession(
	state: NdState,
	transport: NdTransport,
	options: NdRestoreOptions = {},
): Promise<NdOutcome> {
	if (state.diff === 'N4') {
		if (transport.kind !== 'handle') {
			return rejected(state, 'handle_required')
		}
		if (!/^SID-[78]-[A-Z]+$/.test(transport.handle)) {
			return rejected(state, 'invalid_handle')
		}
		const stored = HANDLE_STORE[transport.handle]
		if (!stored) return rejected(state, 'unknown_handle')
		if (stored.owner !== 'org-7') return rejected(state, 'owner')
		if (stored.expiresAt <= ND_NOW) return rejected(state, 'expiry')
		if (options.faultAfterFirstField) {
			const partialState =
				state.commit === 'eager'
					? {
							...state,
							published: { ...state.published, sessionOwner: 'org-7' },
						}
					: state
			return rejected(partialState, 'fault', [], partialState.published)
		}
		return {
			status: 'ok',
			reason: 'restored',
			state: { ...state, published: applyFields(state.published, stored.data) },
			effects: [],
			partial: false,
		}
	}

	if (transport.kind !== 'blob') return rejected(state, 'blob_required')
	const payload = transport.payload
	let data: Parsed
	try {
		data = JSON.parse(atob(payload)) as Parsed
	} catch {
		return rejected(state, 'parse')
	}

	const wireBytes = new TextEncoder().encode(
		`${payload}${transport.tag ?? ''}`,
	).length
	if (wireBytes > ND_LIMITS.wire) return rejected(state, 'wire')
	if (depthOf(data) > ND_LIMITS.depth) return rejected(state, 'depth')

	const macValid =
		transport.tag !== null && (await hmacHex(payload)) === transport.tag

	const size = basicLimits(payload)
	const extensions = Array.isArray(data.extensions) ? data.extensions : []
	const hooks = collectHooks(data)
	const hookEffects =
		isRecord(data) && Array.isArray(data.effects)
			? data.effects.map((effect) => String(effect))
			: ['restart', 'role_admin', 'config_dirty']
	const hookPublished = applyHook(state.published, hookEffects)

	const stage = (next: NdPublished) => (state.commit === 'staged' ? next : next)

	if (state.diff === 'N0' || state.diff === 'N5') {
		if (options.faultAfterFirstField) {
			const partialState =
				state.commit === 'eager'
					? {
							...state,
							published: { ...state.published, sessionOwner: 'org-7' },
						}
					: state
			return rejected(
				partialState,
				'fault',
				hooks.length > 0 ? ['hook'] : [],
				partialState.published,
			)
		}
		const withHooks = hooks.length > 0 ? hookPublished : state.published
		const applied1 = applyFields(withHooks, data)
		const sizeError =
			size ?? schemaError(data, extensions) ?? authorityError(data)
		if (sizeError) {
			return rejected(
				state,
				`${sizeError}_after_restore`,
				hooks.length > 0 ? ['hook'] : [],
				applied1,
			)
		}
		return {
			status: 'ok',
			reason: 'restored',
			state: { ...state, published: stage(applied1) },
			effects: hooks.length > 0 ? ['hook'] : [],
			partial: false,
		}
	}

	if (state.diff === 'N1') {
		const withHooks = hooks.length > 0 ? hookPublished : state.published
		const applied1 = applyFields(withHooks, data)
		if (!macValid)
			return rejected(
				state,
				'integrity_after_restore',
				hooks.length > 0 ? ['hook'] : [],
				applied1,
			)
		const error = size ?? schemaError(data, extensions) ?? authorityError(data)
		if (error)
			return rejected(
				state,
				`${error}_after_restore`,
				hooks.length > 0 ? ['hook'] : [],
				applied1,
			)
		return {
			status: 'ok',
			reason: 'restored',
			state: { ...state, published: applied1 },
			effects: hooks.length > 0 ? ['hook'] : [],
			partial: false,
		}
	}

	if (state.diff === 'N2') {
		if (!macValid) return rejected(state, 'integrity')
		if (data.type !== 'WorkspaceSession') return rejected(state, 'root_type')
		const withHooks = hooks.length > 0 ? hookPublished : state.published
		const applied1 = applyFields(withHooks, data)
		const error = size ?? schemaError(data, extensions) ?? authorityError(data)
		if (error)
			return rejected(
				state,
				`${error}_after_restore`,
				hooks.length > 0 ? ['hook'] : [],
				applied1,
			)
		return {
			status: 'ok',
			reason: 'restored',
			state: { ...state, published: applied1 },
			effects: hooks.length > 0 ? ['hook'] : [],
			partial: false,
		}
	}

	// N3 and N6 validate everything before publishing; N6 only admits inert types.
	if (!macValid) return rejected(state, 'integrity')
	if (size) return rejected(state, size)
	const extensionError = schemaError(data, extensions)
	if (extensionError) return rejected(state, extensionError)
	const authority = authorityError(data)
	if (authority) return rejected(state, authority)
	if (state.diff === 'N6' && hooks.length > 0) {
		return rejected(state, 'active_type')
	}

	if (options.faultAfterFirstField) {
		const partialState =
			state.commit === 'eager'
				? { ...state, published: { ...state.published, sessionOwner: 'org-7' } }
				: state
		return rejected(partialState, 'fault', [], partialState.published)
	}

	return {
		status: 'ok',
		reason: 'restored',
		state: { ...state, published: applyFields(state.published, data) },
		effects: [],
		partial: false,
	}
}

export type NdCommand =
	| { readonly kind: 'select_diff'; readonly diff: NdDiff }
	| { readonly kind: 'select_commit'; readonly commit: NdCommit }

export function applyNubeAndina(
	state: NdState,
	command: NdCommand,
): OperationResult<NdState> {
	if (command.kind === 'select_diff') {
		const diffs: readonly NdDiff[] = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6']
		if (!diffs.includes(command.diff)) {
			return reject(
				'CONFIGURATION_REJECTED',
				`Diff no admitido: ${command.diff}`,
			)
		}
		return applied({ ...state, diff: command.diff }, `diff:${command.diff}`)
	}
	if (command.commit !== 'eager' && command.commit !== 'staged') {
		return reject(
			'CONFIGURATION_REJECTED',
			`Commit no admitido: ${command.commit}`,
		)
	}
	return applied(
		{ ...state, commit: command.commit },
		`commit:${command.commit}`,
	)
}

const INITIAL: NdPublished = {
	filters: null,
	template: null,
	theme: null,
	role: 'organizer',
	sessionOwner: null,
	restarts: 0,
	configDirty: false,
}

function blob(id: string): NdTransport {
	const document = documentById(id)
	if (!document) throw new Error(`missing document ${id}`)
	return { kind: 'blob', payload: base64(document.json), tag: document.tag }
}

function handleOf(id: string): NdTransport {
	const document = documentById(id)
	if (!document) throw new Error(`missing document ${id}`)
	return { kind: 'handle', handle: document.handle }
}

export async function verifyNubeAndina(
	state: NdState,
): Promise<ExerciseReport> {
	const checks: CheckResult[] = []
	const transportOf = (id: string): NdTransport =>
		state.diff === 'N4' ? handleOf(id) : blob(id)
	const fresh = () => createNubeAndinaState(state.diff, state.commit)
	const unchanged = (published: NdPublished) =>
		JSON.stringify(published) === JSON.stringify(INITIAL)

	const b1 = await restoreSession(fresh(), transportOf('S01'))
	const b2 = await restoreSession(fresh(), transportOf('S02'))
	checks.push({
		id: 'NA-B1',
		kind: 'B',
		property:
			'S01 restaura filtros security/20, basic, dark y la autoridad org-7.',
		passed:
			b1.status === 'ok' &&
			b1.state.published.filters?.track === 'security' &&
			b1.state.published.filters?.pageSize === 20 &&
			b1.state.published.template === 'basic' &&
			b1.state.published.theme === 'dark' &&
			b1.state.published.sessionOwner === 'org-7' &&
			b1.state.published.role === 'organizer',
		evidence: `${b1.status}/${JSON.stringify(b1.state.published.filters)}`,
	})
	checks.push({
		id: 'NA-B2',
		kind: 'B',
		property: 'S02 restaura design/10, report, dark con la misma autoridad.',
		passed:
			b2.status === 'ok' &&
			b2.state.published.filters?.track === 'design' &&
			b2.state.published.filters?.pageSize === 10 &&
			b2.state.published.template === 'report' &&
			b2.state.published.theme === 'dark' &&
			b2.state.published.role === 'organizer',
		evidence: `${b2.status}/${JSON.stringify(b2.state.published.filters)}`,
	})

	const q1 = await restoreSession(fresh(), transportOf('S03'))
	const q2 = await restoreSession(fresh(), transportOf('S04'))
	const q3 = await restoreSession(fresh(), transportOf('S05'))
	const q4 = await restoreSession(fresh(), transportOf('S06'))
	const q5 = await restoreSession(fresh(), transportOf('S07'))
	const q6 = await restoreSession(fresh(), transportOf('S08'))

	checks.push({
		id: 'NA-Q1',
		kind: 'Q',
		property: 'S03 se rechaza sin invocar el hook y sin cambiar el negocio.',
		passed:
			q1.status === 'rejected' &&
			q1.state.published.restarts === 0 &&
			q1.state.published.role === 'organizer' &&
			!q1.state.published.configDirty,
		evidence: `${q1.status}/${q1.reason}`,
	})
	checks.push({
		id: 'NA-Q2',
		kind: 'Q',
		property: 'S04 se rechaza recursivamente sin hook ni cambio de negocio.',
		passed:
			q2.status === 'rejected' &&
			q2.state.published.restarts === 0 &&
			q2.state.published.role === 'organizer' &&
			!q2.state.published.configDirty,
		evidence: `${q2.status}/${q2.reason}`,
	})
	checks.push({
		id: 'NA-Q3',
		kind: 'Q',
		property:
			'S05 se rechaza por dueño/esquema y nunca acepta rol admin del cliente.',
		passed:
			q3.status === 'rejected' &&
			q3.state.published.role === 'organizer' &&
			unchanged(q3.state.published),
		evidence: `${q3.status}/${q3.reason}`,
	})
	checks.push({
		id: 'NA-Q4',
		kind: 'Q',
		property: 'S06 se rechaza por vigencia sin cambios.',
		passed: q4.status === 'rejected' && unchanged(q4.state.published),
		evidence: `${q4.status}/${q4.reason}`,
	})
	checks.push({
		id: 'NA-Q5',
		kind: 'Q',
		property: 'S07 se rechaza por límites antes de reconstruir, sin efectos.',
		passed: q5.status === 'rejected' && unchanged(q5.state.published),
		evidence: `${q5.status}/${q5.reason}`,
	})
	checks.push({
		id: 'NA-Q6',
		kind: 'Q',
		property: 'S08 se rechaza por integridad o handle inválido, sin efectos.',
		passed: q6.status === 'rejected' && unchanged(q6.state.published),
		evidence: `${q6.status}/${q6.reason}`,
	})

	const fault = await restoreSession(fresh(), transportOf('S02'), {
		faultAfterFirstField: true,
	})
	const c1 = fault.status === 'rejected' && unchanged(fault.state.published)
	checks.push({
		id: 'NA-C1',
		kind: 'C',
		property:
			'Ante la falla simulada tras el primer campo, staged conserva el estado anterior.',
		passed: c1,
		evidence: `commit=${state.commit}; partial=${fault.partial}`,
	})

	return buildReport('cwe-502-nubeandina', checks, ['NA-C1'])
}

export async function sha256Document(id: string): Promise<string | undefined> {
	const document = documentById(id)
	return document ? sha256Hex(document.json) : undefined
}
