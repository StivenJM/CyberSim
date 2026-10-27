/**
 * Shared vocabulary for the five investigated exercises.
 *
 * A case model is a closed reducer over inert state plus a verifier that
 * re-executes its declared battery. The verifier never trusts the name of a
 * patch: it reads the resulting state and re-runs the checks.
 */

export type CheckKind = 'B' | 'Q' | 'C'

export interface CheckResult {
	readonly id: string
	readonly kind: CheckKind
	readonly property: string
	readonly passed: boolean
	readonly evidence: string
}

export interface ExerciseReport {
	readonly caseId: string
	/** Legitimate function preserved. */
	readonly B: boolean
	/** Declared protection properties hold. */
	readonly Q: boolean
	/** Additional discrimination checks, by identifier. */
	readonly C: Record<string, boolean>
	readonly checks: readonly CheckResult[]
	/** The delivered revision leaves a demonstrable unresolved exposure. */
	readonly residualExposure: boolean
}

export interface OperationRejected {
	readonly ok: false
	readonly code: string
	readonly detail: string
}

export interface OperationApplied<TState> {
	readonly ok: true
	readonly state: TState
	readonly effects: readonly string[]
}

export type OperationResult<TState> =
	| OperationApplied<TState>
	| OperationRejected

export function reject(code: string, detail: string): OperationRejected {
	return { ok: false, code, detail }
}

export function applied<TState>(
	state: TState,
	...effects: string[]
): OperationApplied<TState> {
	return { ok: true, state, effects }
}

export function buildReport(
	caseId: string,
	checks: readonly CheckResult[],
	contrast: readonly string[] = [],
): ExerciseReport {
	const bChecks = checks.filter((check) => check.kind === 'B')
	const qChecks = checks.filter((check) => check.kind === 'Q')
	const C = Object.fromEntries(
		checks
			.filter((check) => check.kind === 'C')
			.map((check) => [check.id, check.passed]),
	)
	const residualExposure = contrast.some((id) => C[id] === false)
	return {
		caseId,
		B: bChecks.length > 0 && bChecks.every((check) => check.passed),
		Q: qChecks.length > 0 && qChecks.every((check) => check.passed),
		C,
		checks,
		residualExposure,
	}
}

export function hexToBytes(hex: string): Uint8Array {
	if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/.test(hex)) {
		throw new Error('hex: expected lowercase even-length hexadecimal')
	}
	const bytes = new Uint8Array(hex.length / 2)
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
	}
	return bytes
}

export function bytesToHex(bytes: Uint8Array): string {
	return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function concatBytes(...parts: readonly Uint8Array[]): Uint8Array {
	const total = parts.reduce((sum, part) => sum + part.length, 0)
	const out = new Uint8Array(total)
	let offset = 0
	for (const part of parts) {
		out.set(part, offset)
		offset += part.length
	}
	return out
}

export function utf8(text: string): Uint8Array {
	return new TextEncoder().encode(text)
}

export async function sha256Hex(data: Uint8Array | string): Promise<string> {
	const bytes = typeof data === 'string' ? utf8(data) : data
	const digest = await crypto.subtle.digest(
		'SHA-256',
		bytes as unknown as BufferSource,
	)
	return bytesToHex(new Uint8Array(digest))
}
