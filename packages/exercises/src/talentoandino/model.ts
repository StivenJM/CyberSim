/**
 * TalentoAndino (CWE-434) domain model.
 *
 * Every upload is an inert catalog row: `profile` and `active` are attributes
 * of the pedagogical analyzer, never declarations trusted from the client. The
 * model never writes a user-supplied path and never executes a marker.
 */

import {
	applied,
	buildReport,
	type CheckResult,
	type ExerciseReport,
	type OperationResult,
	reject,
} from '../core.js'

export type TaField = 'cv' | 'photo'
export type TaProfile =
	| 'pdf-complete'
	| 'jpeg-complete'
	| 'script'
	| 'pdf-signature-script'
	| 'pdf-active'
	| 'incomplete'

export interface TaFixture {
	readonly id: string
	readonly field: TaField
	readonly originalName: string
	readonly declaredMime: string
	readonly profile: TaProfile
	readonly size: number
	readonly active: boolean
	readonly contract: 'accept' | 'reject'
}

export const TA_FIXTURES: readonly TaFixture[] = [
	{
		id: 'T01',
		field: 'cv',
		originalName: 'cv_ana.pdf',
		declaredMime: 'application/pdf',
		profile: 'pdf-complete',
		size: 256000,
		active: false,
		contract: 'accept',
	},
	{
		id: 'T02',
		field: 'photo',
		originalName: 'foto.jpg',
		declaredMime: 'image/jpeg',
		profile: 'jpeg-complete',
		size: 128000,
		active: false,
		contract: 'accept',
	},
	{
		id: 'T03',
		field: 'cv',
		originalName: 'cv.php',
		declaredMime: 'application/x-php',
		profile: 'script',
		size: 512,
		active: true,
		contract: 'reject',
	},
	{
		id: 'T04',
		field: 'cv',
		originalName: 'cv.pdf',
		declaredMime: 'application/pdf',
		profile: 'pdf-signature-script',
		size: 1024,
		active: true,
		contract: 'reject',
	},
	{
		id: 'T05',
		field: 'cv',
		originalName: 'anexo.pdf',
		declaredMime: 'application/pdf',
		profile: 'pdf-active',
		size: 400000,
		active: true,
		contract: 'reject',
	},
	{
		id: 'T06',
		field: 'cv',
		originalName: 'grande.pdf',
		declaredMime: 'application/pdf',
		profile: 'pdf-complete',
		size: 5242881,
		active: false,
		contract: 'reject',
	},
	{
		id: 'T07',
		field: 'photo',
		originalName: 'grande.jpg',
		declaredMime: 'image/jpeg',
		profile: 'jpeg-complete',
		size: 2097153,
		active: false,
		contract: 'reject',
	},
	{
		id: 'T08',
		field: 'cv',
		originalName: '../indice.pdf',
		declaredMime: 'application/pdf',
		profile: 'pdf-complete',
		size: 300000,
		active: false,
		contract: 'accept',
	},
	{
		id: 'T09',
		field: 'photo',
		originalName: 'foto.JpG',
		declaredMime: 'image/jpeg',
		profile: 'jpeg-complete',
		size: 128000,
		active: false,
		contract: 'accept',
	},
	{
		id: 'T10',
		field: 'cv',
		originalName: 'foto.jpg',
		declaredMime: 'image/jpeg',
		profile: 'jpeg-complete',
		size: 128000,
		active: false,
		contract: 'reject',
	},
	{
		id: 'T11',
		field: 'cv',
		originalName: 'cortado.pdf',
		declaredMime: 'application/pdf',
		profile: 'incomplete',
		size: 1000,
		active: false,
		contract: 'reject',
	},
	{
		id: 'T12',
		field: 'cv',
		originalName: 'limite.pdf',
		declaredMime: 'application/pdf',
		profile: 'pdf-complete',
		size: 5242880,
		active: false,
		contract: 'accept',
	},
	{
		id: 'T13',
		field: 'photo',
		originalName: 'limite.jpg',
		declaredMime: 'image/jpeg',
		profile: 'jpeg-complete',
		size: 2097152,
		active: false,
		contract: 'accept',
	},
]

export const TA_LIMITS = { cv: 5242880, photo: 2097152 } as const

export interface TaLegacyObject {
	readonly id: 'LG01' | 'LG02' | 'LG03'
	readonly name: string
	readonly owner: string
	readonly profile: TaProfile
	readonly size: number
	readonly active: boolean
}

export const TA_LEGACY: readonly TaLegacyObject[] = [
	{
		id: 'LG01',
		name: 'curriculum.pdf',
		owner: 'candidato-1',
		profile: 'pdf-complete',
		size: 220000,
		active: false,
	},
	{
		id: 'LG02',
		name: 'pagina.php',
		owner: 'desconocido',
		profile: 'script',
		size: 700,
		active: true,
	},
	{
		id: 'LG03',
		name: 'foto.jpg',
		owner: 'candidato-2',
		profile: 'script',
		size: 900,
		active: true,
	},
]

export type TaValidation = 'V0' | 'V1' | 'V2'
export type TaSize = 'L0' | 'L1'
export type TaName = 'N0' | 'N1'
export type TaStorage = 'S0' | 'S1' | 'S2'
export type TaDelivery = 'D0' | 'D1'
export type TaPublication = 'P0' | 'P1'

export interface TaPolicy {
	readonly validation: TaValidation
	readonly size: TaSize
	readonly name: TaName
	readonly storage: TaStorage
	readonly delivery: TaDelivery
	readonly publication: TaPublication
}

export const TA_POLICY_INITIAL: TaPolicy = {
	validation: 'V0',
	size: 'L0',
	name: 'N0',
	storage: 'S0',
	delivery: 'D0',
	publication: 'P0',
}

export type TaActor =
	| 'candidato-1'
	| 'candidato-2'
	| 'reclutador-1'
	| 'visitante'

export interface TaPending {
	readonly handle: string
	readonly fixtureId: string
	readonly owner: string
	readonly admission: 'admitted' | 'pending'
	readonly revoked: boolean
}

export interface TaObject {
	readonly reference: string
	readonly fixtureId: string
	readonly owner: string
	readonly field: TaField
	readonly storage: TaStorage
	readonly admitted: boolean
	readonly marker: string
	readonly recordId: number
	readonly relation: string
}

export interface TaState {
	readonly policy: TaPolicy
	readonly inventoryActions: readonly (
		| 'migrate:LG01'
		| 'quarantine:LG02'
		| 'quarantine:LG03'
	)[]
	readonly pending: readonly TaPending[]
	readonly objects: readonly TaObject[]
	readonly rejected: readonly {
		readonly fixtureId: string
		readonly reason: string
	}[]
	readonly nextSequence: number
	readonly nextInternalId: number
	readonly audit: readonly string[]
}

export function createTalentoAndinoState(
	policy: TaPolicy = TA_POLICY_INITIAL,
): TaState {
	return {
		policy,
		inventoryActions: [],
		pending: [],
		objects: [],
		rejected: [],
		nextSequence: 1,
		nextInternalId: 100,
		audit: [],
	}
}

export type TaCommand =
	| {
			readonly kind: 'configure'
			readonly field: keyof TaPolicy
			readonly value: string
	  }
	| {
			readonly kind: 'inventory'
			readonly action: 'migrate' | 'quarantine'
			readonly id: string
	  }
	| { readonly kind: 'receive'; readonly fixtureId: string }
	| {
			readonly kind: 'retrieve_pending'
			readonly handle: string
			readonly actor: TaActor
	  }
	| { readonly kind: 'resolve'; readonly handle: string }
	| {
			readonly kind: 'retrieve'
			readonly reference: string
			readonly actor: TaActor
	  }

const POLICY_VALUES: Readonly<Record<keyof TaPolicy, readonly string[]>> = {
	validation: ['V0', 'V1', 'V2'],
	size: ['L0', 'L1'],
	name: ['N0', 'N1'],
	storage: ['S0', 'S1', 'S2'],
	delivery: ['D0', 'D1'],
	publication: ['P0', 'P1'],
}

const PURPOSES: Readonly<Record<TaField, readonly TaProfile[]>> = {
	cv: ['pdf-complete'],
	photo: ['jpeg-complete'],
}

function accepts(policy: TaPolicy, fixture: TaFixture): boolean {
	if (policy.size === 'L1' && fixture.size > TA_LIMITS[fixture.field])
		return false
	if (policy.validation === 'V0') return true
	if (policy.validation === 'V1') {
		const extension = fixture.originalName.toLowerCase().split('.').pop() ?? ''
		const expected = fixture.field === 'cv' ? ['pdf'] : ['jpg', 'jpeg']
		return (
			expected.includes(extension) &&
			(fixture.declaredMime === 'application/pdf' ||
				fixture.declaredMime === 'image/jpeg')
		)
	}
	return PURPOSES[fixture.field].includes(fixture.profile) && !fixture.active
}

function internalName(
	policy: TaPolicy,
	fixture: TaFixture,
	counter: number,
): string {
	if (policy.name === 'N0') return fixture.originalName
	const extension = fixture.profile === 'jpeg-complete' ? 'jpg' : 'pdf'
	return `TA-${String(counter).padStart(4, '0')}.${extension}`
}

function ownerOf(): string {
	// Every test posting belongs to candidato-1; reclutador-1 is assigned to it.
	return 'candidato-1'
}

export function applyTalentoAndino(
	state: TaState,
	command: TaCommand,
): OperationResult<TaState> {
	switch (command.kind) {
		case 'configure': {
			const allowed = POLICY_VALUES[command.field]
			if (!allowed.includes(command.value)) {
				return reject(
					'CONFIGURATION_REJECTED',
					`Valor no admitido para ${command.field}: ${command.value}`,
				)
			}
			return applied(
				{
					...state,
					policy: { ...state.policy, [command.field]: command.value },
				},
				`policy:${command.field}=${command.value}`,
			)
		}

		case 'inventory': {
			const legacy = TA_LEGACY.find((entry) => entry.id === command.id)
			if (!legacy) {
				return reject(
					'EVIDENCE_NOT_FOUND',
					`Objeto de inventario desconocido: ${command.id}`,
				)
			}
			const action =
				`${command.action}:${command.id}` as TaState['inventoryActions'][number]
			if (state.inventoryActions.includes(action)) {
				return applied(state, 'inventory already recorded')
			}
			return applied(
				{
					...state,
					inventoryActions: [...state.inventoryActions, action],
				},
				`inventory:${action}`,
			)
		}

		case 'receive': {
			const fixture = TA_FIXTURES.find(
				(entry) => entry.id === command.fixtureId,
			)
			if (!fixture) {
				return reject(
					'UNSUPPORTED_INPUT',
					`Fixture fuera del catálogo: ${command.fixtureId}`,
				)
			}
			const sequence = state.nextSequence
			const pending: TaPending = {
				handle: `TA-PENDING-${sequence}`,
				fixtureId: fixture.id,
				owner: ownerOf(),
				admission: state.policy.publication === 'P0' ? 'admitted' : 'pending',
				revoked: false,
			}
			return applied(
				{
					...state,
					pending: [...state.pending, pending],
					nextSequence: sequence + 1,
				},
				`receive:${pending.handle}`,
				`admission:${pending.admission}`,
			)
		}

		case 'retrieve_pending': {
			const pending = state.pending.find(
				(entry) => entry.handle === command.handle,
			)
			if (!pending) {
				return reject(
					'EVIDENCE_NOT_FOUND',
					`Handle desconocido: ${command.handle}`,
				)
			}
			if (pending.revoked || pending.admission !== 'admitted') {
				return reject('NOT_ADMITTED', 'El objeto todavía no es recuperable.')
			}
			if (command.actor === 'visitante') {
				return reject('FORBIDDEN', 'El visitante no está autorizado.')
			}
			if (command.actor !== pending.owner && command.actor !== 'reclutador-1') {
				return reject('FORBIDDEN', 'El actor no es propietario ni reclutador.')
			}
			const fixture = TA_FIXTURES.find(
				(entry) => entry.id === pending.fixtureId,
			)
			return applied(
				state,
				`retrieval:pending:${pending.handle}`,
				`marker:TA:${fixture?.id}`,
			)
		}

		case 'resolve': {
			const pending = state.pending.find(
				(entry) => entry.handle === command.handle,
			)
			if (!pending) {
				return reject(
					'EVIDENCE_NOT_FOUND',
					`Handle desconocido: ${command.handle}`,
				)
			}
			const fixture = TA_FIXTURES.find(
				(entry) => entry.id === pending.fixtureId,
			)
			if (!fixture) {
				return reject('EVIDENCE_NOT_FOUND', 'Fixture ausente.')
			}

			if (
				state.policy.size === 'L1' &&
				fixture.size > TA_LIMITS[fixture.field]
			) {
				return applied(
					{
						...state,
						pending: state.pending.map((entry) =>
							entry.handle === command.handle
								? { ...entry, revoked: true, admission: 'pending' }
								: entry,
						),
						rejected: [
							...state.rejected,
							{ fixtureId: fixture.id, reason: 'rejected_size' },
						],
					},
					'rejected_size',
				)
			}

			if (!accepts(state.policy, fixture)) {
				return applied(
					{
						...state,
						pending: state.pending.map((entry) =>
							entry.handle === command.handle
								? { ...entry, revoked: true, admission: 'pending' }
								: entry,
						),
						rejected: [
							...state.rejected,
							{ fixtureId: fixture.id, reason: 'rejected_type' },
						],
					},
					'rejected_type',
				)
			}

			const recordId = state.nextInternalId
			const reference = internalName(state.policy, fixture, recordId)
			const object: TaObject = {
				reference,
				fixtureId: fixture.id,
				owner: pending.owner,
				field: fixture.field,
				storage: state.policy.storage,
				admitted: true,
				marker: `TA:${fixture.id}`,
				recordId,
				relation: pending.owner,
			}
			return applied(
				{
					...state,
					pending: state.pending.filter(
						(entry) => entry.handle !== command.handle,
					),
					objects: [...state.objects, object],
					nextInternalId:
						state.policy.name === 'N1' ? recordId + 1 : state.nextInternalId,
				},
				`admitted:${reference}`,
				`record:${recordId}`,
			)
		}

		case 'retrieve': {
			const object = state.objects.find(
				(entry) => entry.reference === command.reference,
			)
			const legacy = TA_LEGACY.find((entry) => entry.id === command.reference)
			if (!object && !legacy) {
				return reject(
					'EVIDENCE_NOT_FOUND',
					`Referencia desconocida: ${command.reference}`,
				)
			}
			if (legacy) {
				return retrieveLegacy(state, legacy, command.actor)
			}
			if (!object) return reject('EVIDENCE_NOT_FOUND', 'Objeto ausente.')
			if (!object.admitted) {
				return reject('NOT_ADMITTED', 'El objeto no fue admitido.')
			}
			if (command.actor === 'visitante') {
				return reject('FORBIDDEN', 'El visitante no está autorizado.')
			}
			if (object.owner !== command.actor && command.actor !== 'reclutador-1') {
				return reject('FORBIDDEN', 'El actor no es propietario ni reclutador.')
			}
			if (state.policy.delivery === 'D0') {
				if (object.storage !== 'S0') {
					return reject('NOT_SERVED', 'El origen directo está denegado.')
				}
				return applied(
					state,
					`retrieval:direct:${object.reference}`,
					`marker:${object.marker}`,
				)
			}
			return applied(
				state,
				`retrieval:handler:${object.reference}`,
				`marker:${object.marker}`,
			)
		}
	}
}

function retrieveLegacy(
	state: TaState,
	legacy: TaLegacyObject,
	actor: TaActor,
): OperationResult<TaState> {
	const action = (kind: 'migrate' | 'quarantine') =>
		state.inventoryActions.includes(
			`${kind}:${legacy.id}` as TaState['inventoryActions'][number],
		)
	const quarantined = action('quarantine')
	const migrated = action('migrate')

	if (quarantined) {
		return reject(
			'QUARANTINED',
			'El objeto está en cuarentena y no se entrega.',
		)
	}
	if (actor === 'visitante') {
		return reject('FORBIDDEN', 'El visitante no está autorizado.')
	}
	if (legacy.owner !== actor && actor !== 'reclutador-1') {
		return reject('FORBIDDEN', 'El actor no es propietario ni reclutador.')
	}
	if (state.policy.delivery === 'D0' && !migrated) {
		return applied(
			state,
			`retrieval:direct:${legacy.id}`,
			`marker:TA:${legacy.id}`,
		)
	}
	if (state.policy.delivery === 'D1' && migrated) {
		return applied(
			state,
			`retrieval:handler:${legacy.id}`,
			`marker:TA:${legacy.id}`,
		)
	}
	if (state.policy.delivery === 'D0' && migrated) {
		return applied(
			state,
			`retrieval:direct:${legacy.id}`,
			`marker:TA:${legacy.id}`,
		)
	}
	return reject('NOT_ADMITTED', 'La entrega configurada no sirve el objeto.')
}

function probe(
	state: TaState,
	fixtureId: string,
): {
	accepted: boolean
	recoverable: boolean
	reference: string | null
	pendingBodyBeforeRejection: boolean
} {
	let current = state
	const received = applyTalentoAndino(current, { kind: 'receive', fixtureId })
	if (!received.ok) {
		return {
			accepted: false,
			recoverable: false,
			reference: null,
			pendingBodyBeforeRejection: false,
		}
	}
	current = received.state
	const handle = current.pending.at(-1)?.handle
	if (!handle) {
		return {
			accepted: false,
			recoverable: false,
			reference: null,
			pendingBodyBeforeRejection: false,
		}
	}
	const early = applyTalentoAndino(current, {
		kind: 'retrieve_pending',
		handle,
		actor: 'candidato-1',
	})
	const pendingBodyBeforeRejection = early.ok
	const resolved = applyTalentoAndino(current, { kind: 'resolve', handle })
	if (!resolved.ok) {
		return {
			accepted: false,
			recoverable: false,
			reference: null,
			pendingBodyBeforeRejection,
		}
	}
	current = resolved.state
	const admitted = current.objects.at(-1)
	if (
		!admitted ||
		current.rejected.some((entry) => entry.fixtureId === fixtureId)
	) {
		return {
			accepted: false,
			recoverable: false,
			reference: null,
			pendingBodyBeforeRejection,
		}
	}
	const retrieval = applyTalentoAndino(current, {
		kind: 'retrieve',
		reference: admitted.reference,
		actor: 'candidato-1',
	})
	return {
		accepted: true,
		recoverable: retrieval.ok,
		reference: admitted.reference,
		pendingBodyBeforeRejection,
	}
}

export function verifyTalentoAndino(state: TaState): ExerciseReport {
	const checks: CheckResult[] = []
	const fresh = () => {
		let next = createTalentoAndinoState(state.policy)
		for (const action of state.inventoryActions) {
			const [kind, id] = action.split(':') as ['migrate' | 'quarantine', string]
			const result = applyTalentoAndino(next, {
				kind: 'inventory',
				action: kind,
				id,
			})
			if (result.ok) next = result.state
		}
		return next
	}

	const accept = ['T01', 'T02', 'T09', 'T12', 'T13']
	const acceptResults = accept.map((id) => probe(fresh(), id))
	checks.push({
		id: 'TA-B1',
		kind: 'B',
		property:
			'T01/T02/T09/T12/T13 se admiten y se recuperan por el handler en tamaños exactos.',
		passed: acceptResults.every((entry) => entry.accepted && entry.recoverable),
		evidence: accept
			.map(
				(id, index) =>
					`${id}=${acceptResults[index].accepted ? 'ok' : 'rejected'}`,
			)
			.join(','),
	})

	const legacy = fresh()
	const lg01 = applyTalentoAndino(legacy, {
		kind: 'retrieve',
		reference: 'LG01',
		actor: 'candidato-1',
	})
	checks.push({
		id: 'TA-B2',
		kind: 'B',
		property:
			'LG01 sigue disponible al propietario/reclutador y conserva su relación.',
		passed: lg01.ok,
		evidence: lg01.ok ? 'LG01 recuperable' : lg01.detail,
	})

	const rejectIds = ['T03', 'T04', 'T05', 'T10', 'T11']
	const rejectResults = rejectIds.map((id) => probe(fresh(), id))
	checks.push({
		id: 'TA-Q1',
		kind: 'Q',
		property:
			'T03/T04/T05/T10/T11 se rechazan sin registro admitido ni recuperación final.',
		passed: rejectResults.every((entry) => !entry.accepted),
		evidence: rejectIds
			.map(
				(id, index) =>
					`${id}=${rejectResults[index].accepted ? 'admitted' : 'rejected'}`,
			)
			.join(','),
	})

	const oversize = ['T06', 'T07'].map((id) => probe(fresh(), id))
	const limits = ['T12', 'T13'].map((id) => probe(fresh(), id))
	checks.push({
		id: 'TA-Q2',
		kind: 'Q',
		property:
			'T06/T07 se rechazan por tamaño y los límites exactos siguen admitidos.',
		passed:
			oversize.every((entry) => !entry.accepted) &&
			limits.every((entry) => entry.accepted),
		evidence: `oversize=${oversize.map((entry) => (entry.accepted ? 'admitted' : 'rejected')).join(',')}; limits=${limits.map((entry) => (entry.accepted ? 'ok' : 'rejected')).join(',')}`,
	})

	const traversal = probe(fresh(), 'T08')
	checks.push({
		id: 'TA-Q3',
		kind: 'Q',
		property:
			'T08 se admite con ID interno y nunca usa la ruta del nombre original.',
		passed:
			traversal.accepted &&
			traversal.reference !== null &&
			!traversal.reference.includes('..') &&
			!traversal.reference.includes('/'),
		evidence: `reference=${traversal.reference ?? 'none'}`,
	})

	const sequenceState = fresh()
	const firstReceive = applyTalentoAndino(sequenceState, {
		kind: 'receive',
		fixtureId: 'T01',
	})
	let afterFirst = firstReceive.ok ? firstReceive.state : sequenceState
	const firstHandle = afterFirst.pending[0]?.handle
	const firstResolved =
		firstHandle !== undefined
			? applyTalentoAndino(afterFirst, { kind: 'resolve', handle: firstHandle })
			: undefined
	afterFirst = firstResolved?.ok ? firstResolved.state : afterFirst
	const secondReceive = applyTalentoAndino(afterFirst, {
		kind: 'receive',
		fixtureId: 'T01',
	})
	let afterSecond = secondReceive.ok ? secondReceive.state : afterFirst
	const secondHandle = afterSecond.pending[0]?.handle
	const secondResolved =
		secondHandle !== undefined
			? applyTalentoAndino(afterSecond, {
					kind: 'resolve',
					handle: secondHandle,
				})
			: undefined
	afterSecond = secondResolved?.ok ? secondResolved.state : afterSecond
	const ids =
		state.policy.name === 'N1'
			? afterSecond.objects.map((entry) => entry.reference)
			: []
	const retrievable =
		ids.length === 2
			? ids.every(
					(reference) =>
						applyTalentoAndino(afterSecond, {
							kind: 'retrieve',
							reference,
							actor: 'candidato-1',
						}).ok,
				)
			: false
	checks.push({
		id: 'TA-Q4',
		kind: 'Q',
		property:
			'Dos T01 consecutivos reciben IDs internos distintos y ambos se recuperan.',
		passed: ids.length === 2 && ids[0] !== ids[1] && retrievable,
		evidence: `ids=${ids.join(',') || 'sin IDs internos (N0)'}`,
	})

	const quarantined = fresh()
	const q5 = ['LG02', 'LG03'].map((id) => {
		const action = applyTalentoAndino(quarantined, {
			kind: 'inventory',
			action: 'quarantine',
			id,
		})
		if (!action.ok) return false
		const retrieval = applyTalentoAndino(action.state, {
			kind: 'retrieve',
			reference: id,
			actor: 'reclutador-1',
		})
		return !retrieval.ok
	})
	checks.push({
		id: 'TA-Q5',
		kind: 'Q',
		property:
			'LG02/LG03 quedan en cuarentena, no descargables, con metadatos conservados.',
		passed: q5.every(Boolean),
		evidence: `LG02=${q5[0] ? 'cuarentena' : 'entregado'}; LG03=${q5[1] ? 'cuarentena' : 'entregado'}`,
	})

	let visitorState = fresh()
	const visitorReceive = applyTalentoAndino(visitorState, {
		kind: 'receive',
		fixtureId: 'T01',
	})
	visitorState = visitorReceive.ok ? visitorReceive.state : visitorState
	const visitorHandle = visitorState.pending[0]?.handle
	const visitorResolved =
		visitorHandle !== undefined
			? applyTalentoAndino(visitorState, {
					kind: 'resolve',
					handle: visitorHandle,
				})
			: undefined
	visitorState = visitorResolved?.ok ? visitorResolved.state : visitorState
	const visitorReference = visitorState.objects.at(-1)?.reference
	const visitorAttempt =
		visitorReference !== undefined
			? applyTalentoAndino(visitorState, {
					kind: 'retrieve',
					reference: visitorReference,
					actor: 'visitante',
				})
			: undefined
	const publicDirect =
		state.policy.delivery === 'D0' && state.policy.storage === 'S0'
	checks.push({
		id: 'TA-Q6',
		kind: 'Q',
		property:
			'El visitante no recupera objetos por handler y el origen directo no queda público.',
		passed: !visitorAttempt?.ok && !publicDirect,
		evidence: `visitante-por-handler=${visitorAttempt?.ok ? 'allowed' : 'denied'}; directo=${publicDirect ? 'público' : 'denegado'}`,
	})

	const interleaved = fresh()
	const received = applyTalentoAndino(interleaved, {
		kind: 'receive',
		fixtureId: 'T04',
	})
	const handle = received.ok ? received.state.pending[0]?.handle : undefined
	const early =
		received.ok && handle
			? applyTalentoAndino(received.state, {
					kind: 'retrieve_pending',
					handle,
					actor: 'candidato-1',
				})
			: undefined
	const resolved =
		received.ok && handle
			? applyTalentoAndino(received.state, { kind: 'resolve', handle })
			: undefined
	const correctInterleaving =
		state.policy.publication === 'P1' &&
		early !== undefined &&
		!early.ok &&
		resolved?.ok === true &&
		resolved.state.rejected.some((entry) => entry.fixtureId === 'T04')
	checks.push({
		id: 'TA-C1',
		kind: 'C',
		property:
			'Con P1 el objeto queda pendiente sin cuerpo; con P0 el propietario lo recibe antes del rechazo final.',
		passed: correctInterleaving,
		evidence: `publication=${state.policy.publication}; early=${early?.ok ? 'admitted' : 'pending'}`,
	})

	return buildReport('cwe-434-talentoandino', checks, ['TA-C1'])
}
