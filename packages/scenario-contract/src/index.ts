export const SCENARIO_SCHEMA_VERSION = 1 as const

export const SCENARIO_STATUSES = [
	'draft',
	'validated',
	'published',
	'archived',
] as const

export const SCENARIO_CAPABILITIES = [
	'asset-transfer',
	'attack-simulation',
	'digital-signature',
	'firewall',
	'hardening',
	'network-traffic',
	'phishing-email',
	'terminal',
	'vpn',
] as const

export const SCENARIO_ENVIRONMENT_PROFILES = [
	'office-3d',
	'network-topology',
	'terminal-lab',
	'security-dashboard',
] as const

export const SCENARIO_EVENT_TYPES = [
	'Envío de activo',
	'Tráfico de red',
	'Conexión VPN',
	'n/a',
	'Completación de fase',
	'Completación de escenario',
	'Verificación de firma',
	'Verificación de acciones de un jugador en la simulación',
	'Envío de correo',
] as const

export type ScenarioStatus = (typeof SCENARIO_STATUSES)[number]
export type ScenarioCapability = (typeof SCENARIO_CAPABILITIES)[number]
export type ScenarioEnvironmentProfile =
	(typeof SCENARIO_ENVIRONMENT_PROFILES)[number]

export interface ScenarioIdentity {
	id: number
	slug: string
	titulo: string
	categoria: string
	descripcion: string
}

export interface ScenarioEnvironmentReference {
	profile: ScenarioEnvironmentProfile
	version: string
}

export interface ScenarioRevisionMetadata {
	schemaVersion: typeof SCENARIO_SCHEMA_VERSION
	revision: number
	status: ScenarioStatus
	capabilities: ScenarioCapability[]
	environment: ScenarioEnvironmentReference
	engineVersion: string
	assetCatalogVersion: string
	seed: number
	contentHash: string
}

export type ScenarioManifest<TDefinition extends ScenarioIdentity> =
	TDefinition & ScenarioRevisionMetadata

export type ScenarioManifestOptions = Omit<
	ScenarioRevisionMetadata,
	'schemaVersion' | 'contentHash'
>

export interface ScenarioValidationResult {
	ok: boolean
	errors: string[]
}

const statusSet = new Set<string>(SCENARIO_STATUSES)
const capabilitySet = new Set<string>(SCENARIO_CAPABILITIES)
const environmentSet = new Set<string>(SCENARIO_ENVIRONMENT_PROFILES)
const eventTypeSet = new Set<string>(SCENARIO_EVENT_TYPES)

function stableSerialize(value: unknown): string {
	if (value === null || typeof value !== 'object') {
		return JSON.stringify(value) ?? 'null'
	}
	if (Array.isArray(value)) {
		return `[${value.map(stableSerialize).join(',')}]`
	}
	const record = value as Record<string, unknown>
	return `{${Object.keys(record)
		.filter((key) => record[key] !== undefined && key !== 'contentHash')
		.sort()
		.map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
		.join(',')}}`
}

export function computeScenarioContentHash(value: unknown): string {
	const bytes = new TextEncoder().encode(stableSerialize(value))
	const bitLength = bytes.length * 8
	const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64
	const padded = new Uint8Array(paddedLength)
	padded.set(bytes)
	padded[bytes.length] = 0x80
	const view = new DataView(padded.buffer)
	view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000))
	view.setUint32(paddedLength - 4, bitLength >>> 0)

	const state = new Uint32Array([
		0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
		0x1f83d9ab, 0x5be0cd19,
	])
	const constants = new Uint32Array([
		0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
		0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
		0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
		0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
		0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
		0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
		0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
		0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
		0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
		0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
		0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
	])
	const words = new Uint32Array(64)
	const rotateRight = (word: number, bits: number) =>
		(word >>> bits) | (word << (32 - bits))

	for (let offset = 0; offset < paddedLength; offset += 64) {
		for (let index = 0; index < 16; index += 1) {
			words[index] = view.getUint32(offset + index * 4)
		}
		for (let index = 16; index < 64; index += 1) {
			const left = words[index - 15]
			const right = words[index - 2]
			const sigma0 = rotateRight(left, 7) ^ rotateRight(left, 18) ^ (left >>> 3)
			const sigma1 =
				rotateRight(right, 17) ^ rotateRight(right, 19) ^ (right >>> 10)
			words[index] =
				(words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0
		}

		let [a, b, c, d, e, f, g, h] = state
		for (let index = 0; index < 64; index += 1) {
			const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25)
			const choice = (e & f) ^ (~e & g)
			const temp1 = (h + sum1 + choice + constants[index] + words[index]) >>> 0
			const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22)
			const majority = (a & b) ^ (a & c) ^ (b & c)
			const temp2 = (sum0 + majority) >>> 0
			h = g
			g = f
			f = e
			e = (d + temp1) >>> 0
			d = c
			c = b
			b = a
			a = (temp1 + temp2) >>> 0
		}

		state[0] = (state[0] + a) >>> 0
		state[1] = (state[1] + b) >>> 0
		state[2] = (state[2] + c) >>> 0
		state[3] = (state[3] + d) >>> 0
		state[4] = (state[4] + e) >>> 0
		state[5] = (state[5] + f) >>> 0
		state[6] = (state[6] + g) >>> 0
		state[7] = (state[7] + h) >>> 0
	}

	return `sha256:${[...state]
		.map((word) => word.toString(16).padStart(8, '0'))
		.join('')}`
}

export function createScenarioManifest<TDefinition extends ScenarioIdentity>(
	definition: TDefinition,
	options: ScenarioManifestOptions,
): ScenarioManifest<TDefinition> {
	const candidate = {
		...definition,
		...options,
		schemaVersion: SCENARIO_SCHEMA_VERSION,
	}
	return {
		...candidate,
		contentHash: computeScenarioContentHash(candidate),
	}
}

export function validateScenarioEnvelope(
	value: unknown,
): ScenarioValidationResult {
	const errors: string[] = []
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return { ok: false, errors: ['manifest: must be an object'] }
	}

	const manifest = value as Record<string, unknown>
	if (!Number.isInteger(manifest.id) || Number(manifest.id) <= 0) {
		errors.push('id: must be a positive integer')
	}
	if (
		typeof manifest.slug !== 'string' ||
		!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug)
	) {
		errors.push('slug: must use lowercase kebab-case')
	}
	for (const field of ['titulo', 'categoria', 'descripcion'] as const) {
		if (typeof manifest[field] !== 'string' || !manifest[field].trim()) {
			errors.push(`${field}: must be a non-empty string`)
		}
	}
	if (manifest.schemaVersion !== SCENARIO_SCHEMA_VERSION) {
		errors.push(
			`schemaVersion: unsupported version ${String(manifest.schemaVersion)}`,
		)
	}
	if (!Number.isInteger(manifest.revision) || Number(manifest.revision) <= 0) {
		errors.push('revision: must be a positive integer')
	}
	if (typeof manifest.status !== 'string' || !statusSet.has(manifest.status)) {
		errors.push(`status: unsupported status "${String(manifest.status)}"`)
	}

	if (!Array.isArray(manifest.capabilities)) {
		errors.push('capabilities: must be an array')
	} else {
		const seen = new Set<string>()
		manifest.capabilities.forEach((capability, index) => {
			if (typeof capability !== 'string' || !capabilitySet.has(capability)) {
				errors.push(
					`capabilities[${index}]: unsupported cybersecurity capability "${String(capability)}"`,
				)
			}
			if (typeof capability === 'string' && seen.has(capability)) {
				errors.push(
					`capabilities[${index}]: duplicate capability "${capability}"`,
				)
			}
			if (typeof capability === 'string') seen.add(capability)
		})
	}

	const environment = manifest.environment
	if (
		!environment ||
		typeof environment !== 'object' ||
		Array.isArray(environment)
	) {
		errors.push('environment: must be an object')
	} else {
		const reference = environment as Record<string, unknown>
		if (
			typeof reference.profile !== 'string' ||
			!environmentSet.has(reference.profile)
		) {
			errors.push(
				`environment.profile: unsupported environment profile "${String(reference.profile)}"`,
			)
		}
		if (typeof reference.version !== 'string' || !reference.version.trim()) {
			errors.push('environment.version: must be a non-empty string')
		}
	}

	for (const field of ['engineVersion', 'assetCatalogVersion'] as const) {
		if (typeof manifest[field] !== 'string' || !manifest[field].trim()) {
			errors.push(`${field}: must be a non-empty string`)
		}
	}
	if (!Number.isInteger(manifest.seed) || Number(manifest.seed) < 0) {
		errors.push('seed: must be a non-negative integer')
	}
	if (
		typeof manifest.contentHash !== 'string' ||
		!/^sha256:[a-f0-9]{64}$/.test(manifest.contentHash)
	) {
		errors.push('contentHash: must use the sha256:<64 hex characters> format')
	}

	if (!Array.isArray(manifest.fases) || manifest.fases.length === 0) {
		errors.push('fases: must contain at least one phase')
	}
	if (!Array.isArray(manifest.eventos)) {
		errors.push('eventos: must be an array')
	} else {
		manifest.eventos.forEach((event, index) => {
			if (!event || typeof event !== 'object' || Array.isArray(event)) {
				errors.push(`eventos[${index}]: must be an object`)
				return
			}
			const type = (event as Record<string, unknown>).tipoEvento
			if (typeof type !== 'string' || !eventTypeSet.has(type)) {
				errors.push(
					`eventos[${index}].tipoEvento: unsupported event type "${String(type)}"`,
				)
			}
		})
	}
	if (!Array.isArray(manifest.ataques)) {
		errors.push('ataques: must be an array')
	}

	return { ok: errors.length === 0, errors }
}

export function verifyScenarioContentHash(value: unknown): boolean {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false
	const manifest = value as Record<string, unknown>
	return manifest.contentHash === computeScenarioContentHash(manifest)
}
