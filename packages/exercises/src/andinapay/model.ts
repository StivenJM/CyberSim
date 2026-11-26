import {
	applied,
	buildReport,
	type CheckResult,
	type ExerciseReport,
	type OperationResult,
	reject,
} from '../core.js'
import { decryptEnvelope } from './crypto.js'
import {
	ANDINAPAY_KEYS,
	ANDINAPAY_PLAINTEXT,
	type AndinaPayKeyId,
	type AndinaPayRecordId,
	envelopeFor,
} from './fixtures.js'

export type IndexedRecord = 'R01' | 'R02' | 'R03'

export interface RecordRef {
	readonly keyId: AndinaPayKeyId
	readonly version: number
}

export interface AndinaPayState {
	readonly headRevision: 'AP-H1' | 'AP-H2' | 'AP-H3'
	readonly index: Readonly<Record<IndexedRecord, RecordRef>>
	readonly staged: Readonly<Partial<Record<'R01' | 'R02', RecordRef>>> | null
	readonly stagedKeys: readonly AndinaPayKeyId[]
	readonly keySource:
		| 'restricted-key-service'
		| 'restricted-runtime-file'
		| null
	readonly writerKey: AndinaPayKeyId
	readonly appPaymentsKey: AndinaPayKeyId
	readonly retiredKeys: readonly AndinaPayKeyId[]
	readonly prevention: {
		readonly scope: 'head-only' | 'history-and-new-diff'
		readonly exceptionPolicy: 'silent-bypass' | 'review-required'
	}
	readonly evidence: readonly string[]
	readonly sealedDiagnosis: string | null
	readonly checks: readonly {
		readonly checkId: string
		readonly passed: boolean
	}[]
	readonly artifactSubmitted: boolean
	readonly reportSubmitted: boolean
	readonly audit: readonly string[]
}

export const ANDINAPAY_CHECKS = [
	'B1',
	'B2',
	'Q1',
	'Q2',
	'Q3',
	'C1',
	'C2',
	'C3',
	'C4',
	'C5',
] as const

export type AndinaPayCheckId = (typeof ANDINAPAY_CHECKS)[number]

export function createAndinaPayState(): AndinaPayState {
	return {
		headRevision: 'AP-H3',
		index: {
			R01: { keyId: 'legacy-demo', version: 1 },
			R02: { keyId: 'legacy-demo', version: 1 },
			R03: { keyId: 'archive-independent', version: 1 },
		},
		staged: null,
		stagedKeys: [],
		keySource: null,
		writerKey: 'legacy-demo',
		appPaymentsKey: 'legacy-demo',
		retiredKeys: [],
		prevention: { scope: 'head-only', exceptionPolicy: 'silent-bypass' },
		evidence: [],
		sealedDiagnosis: null,
		checks: [],
		artifactSubmitted: false,
		reportSubmitted: false,
		audit: [],
	}
}

export type AndinaPayCommand =
	| { readonly kind: 'record_evidence'; readonly reference: string }
	| { readonly kind: 'submit_diagnosis'; readonly text: string }
	| { readonly kind: 'stage_key'; readonly keyId: string }
	| {
			readonly kind: 'set_key_source'
			readonly source: 'restricted-key-service' | 'restricted-runtime-file'
	  }
	| {
			readonly kind: 'rekey_records'
			readonly records: readonly ('R01' | 'R02')[]
	  }
	| { readonly kind: 'commit_recovery' }
	| { readonly kind: 'retire_key_early'; readonly keyId: string }
	| { readonly kind: 'restore_key_for_recovery'; readonly keyId: string }
	| {
			readonly kind: 'configure_prevention'
			readonly scope: 'head-only' | 'history-and-new-diff'
			readonly exceptionPolicy: 'silent-bypass' | 'review-required'
	  }
	| { readonly kind: 'run_check'; readonly checkId: string }
	| { readonly kind: 'submit_artifact' }
	| { readonly kind: 'submit_report'; readonly text: string }

const KNOWN_EVIDENCE = new Set<string>([
	'AP-H1',
	'AP-H2',
	'AP-H3',
	'logs/application.log',
	'logs/monitoring.txt',
	'keys/inventory.csv',
	'data/current-index.csv',
	'data/partial-v1.json',
	'recovery/policy.txt',
	'incident/notice.txt',
	'R01/K1/v1',
	'R02/K1/v1',
	'R03/KI/v1',
	'R04/K1/v1',
	'R01/K2/v2',
	'R02/K2/v2',
	'R04/K2/v2',
])

/** Stable list of references the student may cite as evidence. */
export const ANDINAPAY_EVIDENCE: readonly string[] = [...KNOWN_EVIDENCE]

export async function readRecord(
	state: AndinaPayState,
	record: IndexedRecord,
): Promise<{ ok: true; plaintext: string } | { ok: false; code: string }> {
	const reference = state.index[record]
	if (state.retiredKeys.includes(reference.keyId)) {
		return { ok: false, code: 'KEY_RETIRED' }
	}
	const envelope = envelopeFor(record, reference.keyId, reference.version)
	if (!envelope) return { ok: false, code: 'EVIDENCE_NOT_FOUND' }
	const decision = await decryptEnvelope(
		envelope,
		ANDINAPAY_KEYS[reference.keyId],
	)
	return decision.ok
		? { ok: true, plaintext: decision.plaintext }
		: { ok: false, code: decision.code }
}

export async function applyAndinaPay(
	state: AndinaPayState,
	command: AndinaPayCommand,
): Promise<OperationResult<AndinaPayState>> {
	if (state.artifactSubmitted && command.kind !== 'submit_report') {
		return reject(
			'ARTIFACT_FROZEN',
			'La entrega técnica está congelada; no se editan controles ni pruebas.',
		)
	}

	switch (command.kind) {
		case 'record_evidence': {
			if (!KNOWN_EVIDENCE.has(command.reference)) {
				return reject(
					'EVIDENCE_NOT_FOUND',
					'Referencia inexistente; sin cambio.',
				)
			}
			if (state.evidence.includes(command.reference)) {
				return applied(state, 'evidence already recorded')
			}
			return applied(
				{ ...state, evidence: [...state.evidence, command.reference] },
				`evidence:${command.reference}`,
			)
		}

		case 'submit_diagnosis': {
			if (!command.text.trim()) {
				return reject(
					'DIAGNOSIS_REQUIRED',
					'El diagnóstico no puede estar vacío.',
				)
			}
			if (state.sealedDiagnosis !== null) {
				return reject(
					'DIAGNOSIS_SEALED',
					'El diagnóstico ya está sellado y no se sobrescribe.',
				)
			}
			return applied(
				{ ...state, sealedDiagnosis: command.text.trim() },
				'diagnosis:sealed',
			)
		}

		case 'stage_key': {
			if (command.keyId !== 'recovery-v2') {
				return reject('UNKNOWN_KEY', `Clave fuera de lista: ${command.keyId}`)
			}
			if (state.stagedKeys.includes('recovery-v2')) {
				return applied(state, 'key already staged')
			}
			return applied(
				{ ...state, stagedKeys: [...state.stagedKeys, 'recovery-v2'] },
				'key:staged:recovery-v2',
			)
		}

		case 'set_key_source': {
			if (
				command.source !== 'restricted-key-service' &&
				command.source !== 'restricted-runtime-file'
			) {
				return reject('CONFIGURATION_REJECTED', 'Fuente de clave no admitida.')
			}
			return applied(
				{ ...state, keySource: command.source },
				`key-source:${command.source}`,
			)
		}

		case 'rekey_records': {
			if (!state.stagedKeys.includes('recovery-v2')) {
				return reject('KEY_NOT_READY', 'La clave K2 no está preparada.')
			}
			const records = [...new Set(command.records)]
			if (records.length === 0) {
				return reject('MIGRATION_INCOMPLETE', 'No se indicó ningún registro.')
			}
			for (const record of records) {
				const historical = envelopeFor(record, 'legacy-demo', 1)
				const target = envelopeFor(record, 'recovery-v2', 2)
				if (!historical || !target) {
					return reject('EVIDENCE_NOT_FOUND', `Falta el fixture ${record}.`)
				}
				const source = await decryptEnvelope(
					historical,
					ANDINAPAY_KEYS['legacy-demo'],
				)
				const destination = await decryptEnvelope(
					target,
					ANDINAPAY_KEYS['recovery-v2'],
				)
				if (
					!source.ok ||
					!destination.ok ||
					source.plaintext !== destination.plaintext ||
					destination.plaintext !== ANDINAPAY_PLAINTEXT[record]
				) {
					return reject(
						'AUTHENTICATION_FAILED',
						`No se conserva el plaintext de ${record}; el estado publicado no cambia.`,
					)
				}
			}
			const staged = { ...(state.staged ?? {}) }
			for (const record of records) {
				staged[record] = { keyId: 'recovery-v2', version: 2 }
			}
			return applied(
				{ ...state, staged },
				...records.map((record) => `staged:${record}:K2/v2`),
			)
		}

		case 'commit_recovery': {
			if (
				state.retiredKeys.includes('legacy-demo') &&
				state.writerKey === 'recovery-v2'
			) {
				return reject(
					'RECOVERY_ALREADY_COMMITTED',
					'La recuperación ya está publicada.',
				)
			}
			const staged = state.staged
			if (
				!staged?.R01 ||
				!staged?.R02 ||
				!state.stagedKeys.includes('recovery-v2') ||
				state.keySource === null
			) {
				return reject(
					'MIGRATION_INCOMPLETE',
					'Faltan filas migradas o la fuente de clave restringida.',
				)
			}
			for (const record of ['R01', 'R02'] as const) {
				const target = envelopeFor(record, 'recovery-v2', 2)
				const decision = target
					? await decryptEnvelope(target, ANDINAPAY_KEYS['recovery-v2'])
					: { ok: false as const, code: 'EVIDENCE_NOT_FOUND', detail: '' }
				if (
					!decision.ok ||
					decision.plaintext !== ANDINAPAY_PLAINTEXT[record]
				) {
					return reject(
						'READBACK_FAILED',
						`La lectura de ${record} no coincide; el estado publicado no cambia.`,
					)
				}
			}
			return applied(
				{
					...state,
					index: {
						...state.index,
						R01: { keyId: 'recovery-v2', version: 2 },
						R02: { keyId: 'recovery-v2', version: 2 },
					},
					writerKey: 'recovery-v2',
					appPaymentsKey: 'recovery-v2',
					retiredKeys: [
						...new Set([...state.retiredKeys, 'legacy-demo' as const]),
					],
					staged: null,
				},
				'index:published',
				'writer:recovery-v2',
				'key:retired:legacy-demo',
			)
		}

		case 'retire_key_early': {
			if (command.keyId !== 'legacy-demo') {
				return reject('UNKNOWN_KEY', `Clave fuera de lista: ${command.keyId}`)
			}
			return applied(
				{
					...state,
					retiredKeys: [
						...new Set([...state.retiredKeys, 'legacy-demo' as const]),
					],
				},
				'key:retired:legacy-demo',
			)
		}

		case 'restore_key_for_recovery': {
			if (command.keyId !== 'legacy-demo') {
				return reject('UNKNOWN_KEY', `Clave fuera de lista: ${command.keyId}`)
			}
			if (state.writerKey === 'recovery-v2') {
				return reject(
					'RECOVERY_ALREADY_COMMITTED',
					'No se reactiva una clave retirada tras publicar.',
				)
			}
			return applied(
				{
					...state,
					retiredKeys: state.retiredKeys.filter((key) => key !== 'legacy-demo'),
				},
				'key:restored:legacy-demo',
			)
		}

		case 'configure_prevention': {
			if (
				command.scope !== 'head-only' &&
				command.scope !== 'history-and-new-diff'
			) {
				return reject('CONFIGURATION_REJECTED', 'Alcance no admitido.')
			}
			if (
				command.exceptionPolicy !== 'silent-bypass' &&
				command.exceptionPolicy !== 'review-required'
			) {
				return reject(
					'CONFIGURATION_REJECTED',
					'Política de excepción no admitida.',
				)
			}
			return applied(
				{
					...state,
					prevention: {
						scope: command.scope,
						exceptionPolicy: command.exceptionPolicy,
					},
				},
				`prevention:${command.scope}:${command.exceptionPolicy}`,
			)
		}

		case 'run_check': {
			if (!(ANDINAPAY_CHECKS as readonly string[]).includes(command.checkId)) {
				return reject(
					'UNKNOWN_CHECK',
					`Comprobación desconocida: ${command.checkId}`,
				)
			}
			const report = await verifyAndinaPay(state)
			const check = report.checks.find((entry) => entry.id === command.checkId)
			return applied(
				{
					...state,
					checks: [
						...state.checks.filter(
							(entry) => entry.checkId !== command.checkId,
						),
						{ checkId: command.checkId, passed: check?.passed ?? false },
					],
				},
				`check:${command.checkId}:${check?.passed ? 'pass' : 'fail'}`,
			)
		}

		case 'submit_artifact': {
			return applied(
				{ ...state, artifactSubmitted: true },
				'artifact:submitted',
			)
		}

		case 'submit_report': {
			if (!state.artifactSubmitted) {
				return reject(
					'ARTIFACT_NOT_SUBMITTED',
					'No hay entrega técnica previa.',
				)
			}
			if (!command.text.trim()) {
				return reject('REPORT_REQUIRED', 'El informe no puede estar vacío.')
			}
			return applied({ ...state, reportSubmitted: true }, 'report:submitted')
		}
	}
}

async function decryptWith(
	record: AndinaPayRecordId,
	keyId: AndinaPayKeyId,
	version: number,
): Promise<string | null> {
	const envelope = envelopeFor(record, keyId, version)
	if (!envelope) return null
	const decision = await decryptEnvelope(envelope, ANDINAPAY_KEYS[keyId])
	return decision.ok ? decision.plaintext : null
}

export async function verifyAndinaPay(
	state: AndinaPayState,
): Promise<ExerciseReport> {
	const checks: CheckResult[] = []

	const readR01 = await readRecord(state, 'R01')
	const readR02 = await readRecord(state, 'R02')
	const readR03 = await readRecord(state, 'R03')
	checks.push({
		id: 'B1',
		kind: 'B',
		property:
			'La aplicación autorizada lee R01, R02 y R03 con sus plaintexts exactos.',
		passed:
			readR01.ok &&
			readR01.plaintext === ANDINAPAY_PLAINTEXT.R01 &&
			readR02.ok &&
			readR02.plaintext === ANDINAPAY_PLAINTEXT.R02 &&
			readR03.ok &&
			readR03.plaintext === ANDINAPAY_PLAINTEXT.R03,
		evidence: `R01=${readR01.ok ? 'ok' : readR01.code}; R02=${readR02.ok ? 'ok' : readR02.code}; R03=${readR03.ok ? 'ok' : readR03.code}`,
	})

	const writerVersion = state.writerKey === 'recovery-v2' ? 2 : 1
	const writerRead = state.retiredKeys.includes(state.writerKey)
		? null
		: await decryptWith('R04', state.writerKey, writerVersion)
	checks.push({
		id: 'B2',
		kind: 'B',
		property:
			'La fila legítima R04 se crea con el escritor operativo y se relee.',
		passed: writerRead === ANDINAPAY_PLAINTEXT.R04,
		evidence: `writer=${state.writerKey}/v${writerVersion}`,
	})

	const currentR01 = state.index.R01
	const currentR01Envelope = envelopeFor(
		'R01',
		currentR01.keyId,
		currentR01.version,
	)
	const currentR02Envelope = envelopeFor(
		'R02',
		state.index.R02.keyId,
		state.index.R02.version,
	)
	const currentR01UnderK1 = currentR01Envelope
		? await decryptEnvelope(currentR01Envelope, ANDINAPAY_KEYS['legacy-demo'])
		: undefined
	const currentR02UnderK1 = currentR02Envelope
		? await decryptEnvelope(currentR02Envelope, ANDINAPAY_KEYS['legacy-demo'])
		: undefined
	const q1Fails =
		currentR01UnderK1 !== undefined &&
		currentR02UnderK1 !== undefined &&
		!currentR01UnderK1.ok &&
		!currentR02UnderK1.ok
	checks.push({
		id: 'Q1',
		kind: 'Q',
		property:
			'La copia actual R01/R02 ya no se descifra con la clave expuesta K1.',
		passed: q1Fails,
		evidence: `index R01=${currentR01.keyId}/v${currentR01.version}; R02=${state.index.R02.keyId}/v${state.index.R02.version}`,
	})

	const q2 =
		state.index.R01.keyId === 'recovery-v2' &&
		state.index.R02.keyId === 'recovery-v2' &&
		state.writerKey === 'recovery-v2' &&
		state.keySource !== null &&
		state.retiredKeys.includes('legacy-demo')
	checks.push({
		id: 'Q2',
		kind: 'Q',
		property:
			'Las escrituras nuevas usan K2 no expuesta y una fuente de clave restringida.',
		passed: q2,
		evidence: `writer=${state.writerKey}; source=${state.keySource ?? 'none'}; retired=${state.retiredKeys.join(',') || 'none'}`,
	})

	const q3 =
		state.appPaymentsKey !== 'legacy-demo' &&
		state.retiredKeys.includes('legacy-demo')
	checks.push({
		id: 'Q3',
		kind: 'Q',
		property: 'external-reader no exporta claves y app-payments ya no usa K1.',
		passed: q3,
		evidence: `appPayments=${state.appPaymentsKey}; export=denied`,
	})

	const historical = await decryptWith('R01', 'legacy-demo', 1)
	checks.push({
		id: 'C1',
		kind: 'C',
		property: 'La copia histórica R01/v1 con K1 sigue revelando SYN-001.',
		passed: historical === ANDINAPAY_PLAINTEXT.R01,
		evidence:
			historical === ANDINAPAY_PLAINTEXT.R01 ? 'legible con K1' : 'no legible',
	})

	checks.push({
		id: 'C2',
		kind: 'C',
		property: 'R03/v1 con K1 falla por autenticación.',
		passed: (await decryptWith('R03', 'legacy-demo', 1)) === null,
		evidence: 'R03/K1 → AUTHENTICATION_FAILED',
	})

	const wrongKey = await decryptWith('R01', 'recovery-v2', 1)
	const original = envelopeFor('R01', 'legacy-demo', 1)
	const tampered = original
		? {
				...original,
				tagHex: `${String((Number.parseInt(original.tagHex.slice(0, 2), 16) ^ 0xff).toString(16).padStart(2, '0'))}${original.tagHex.slice(2)}`,
			}
		: undefined
	const alteredTag = tampered
		? await decryptEnvelope(tampered, ANDINAPAY_KEYS['legacy-demo'])
		: { ok: true as const, plaintext: '' }
	checks.push({
		id: 'C3',
		kind: 'C',
		property:
			'Clave incorrecta o tag alterado devuelven AUTHENTICATION_FAILED.',
		passed: wrongKey === null && !alteredTag.ok,
		evidence: 'clave incorrecta y tag alterado rechazados',
	})

	checks.push({
		id: 'C4',
		kind: 'C',
		property:
			'La prevención cubre histórico y cambio nuevo, con revisión de excepciones.',
		passed:
			state.prevention.scope === 'history-and-new-diff' &&
			state.prevention.exceptionPolicy === 'review-required',
		evidence: `scope=${state.prevention.scope}; exceptions=${state.prevention.exceptionPolicy}`,
	})

	checks.push({
		id: 'C5',
		kind: 'C',
		property: 'merchant-demo-17 es un identificador público, no una clave.',
		passed: !Object.values(ANDINAPAY_KEYS).includes('merchant-demo-17'),
		evidence: 'identificador público registrado como no secreto',
	})

	return buildReport('cwe-321-andinapay', checks, ['C4'])
}
