/**
 * AndeanLogix (CWE-306) domain model.
 *
 * A closed request dispatcher over inert business state. Identity comes only
 * from the trusted session registry; request bodies, URLs and `X-Role` never
 * grant permission. Every rejection keeps `shipments` and `drivers` intact and
 * may only grow the observation log.
 */

import {
	applied,
	buildReport,
	type CheckResult,
	type ExerciseReport,
	type OperationResult,
	reject,
} from '../core.js'

export type AlActor =
	| 'anonymous'
	| 'expired'
	| 'tampered'
	| 'customer'
	| 'dispatcher'
	| 'support'

export type AlAction = 'cancel' | 'reassign' | 'reset' | 'tracking'
export type AlNetwork = 'public' | 'ops'
export type AlMethod = 'GET' | 'POST'

export type AlGuard =
	| 'ui_only'
	| 'cancel_only'
	| 'session_only'
	| 'request_roles'
	| 'server_roles'
export type AlIngress = 'public_and_ops' | 'ops_only' | 'closed'

export interface AlConfig {
	readonly guard: AlGuard
	readonly maintenanceBypass: boolean
	readonly adminIngress: AlIngress
	readonly adminService: boolean
	readonly publicTracking: boolean
}

export const AL_CONFIG_INITIAL: AlConfig = {
	guard: 'ui_only',
	maintenanceBypass: true,
	adminIngress: 'public_and_ops',
	adminService: true,
	publicTracking: true,
}

export interface AlShipment {
	readonly id: string
	readonly status: 'in_transit' | 'pending' | 'cancelled'
	readonly route: string
	readonly driver: string
}

export interface AlDriver {
	readonly id: string
	readonly credentialRevision: number
}

export interface AlState {
	readonly shipments: readonly AlShipment[]
	readonly drivers: readonly AlDriver[]
	readonly config: AlConfig
	readonly maintenance: boolean
	readonly audit: readonly string[]
}

export function createAndeanLogixState(
	config: AlConfig = AL_CONFIG_INITIAL,
): AlState {
	return {
		shipments: [
			{ id: 'SH-301', status: 'in_transit', route: 'R1', driver: 'DR-7' },
			{ id: 'SH-302', status: 'pending', route: 'R2', driver: 'DR-8' },
		],
		drivers: [
			{ id: 'DR-7', credentialRevision: 7 },
			{ id: 'DR-8', credentialRevision: 2 },
		],
		config,
		maintenance: false,
		audit: [],
	}
}

export interface AlRequest {
	readonly action: AlAction
	readonly method: AlMethod
	readonly network: AlNetwork
	readonly actor: AlActor
	/** Declared target; the dispatcher only accepts the catalogued ones. */
	readonly target?: string
	readonly payload?: Readonly<Record<string, unknown>>
	readonly headers?: Readonly<Record<string, string>>
}

export interface AlDecision {
	readonly status: number
	readonly reason: string
	readonly state: AlState
	readonly changed: boolean
	/** The request reached the handler instead of being blocked by ingress. */
	readonly reachedHandler: boolean
}

const SESSIONS: Readonly<
	Record<
		AlActor,
		| { valid: false; session: string | null }
		| {
				valid: true
				session: string
				role: 'customer' | 'dispatcher' | 'support'
		  }
	>
> = {
	anonymous: { valid: false, session: null },
	expired: { valid: false, session: 'S-OLD' },
	tampered: { valid: false, session: 'S-CLIENT-FORGED' },
	customer: { valid: true, session: 'S-CUSTOMER', role: 'customer' },
	dispatcher: { valid: true, session: 'S-DISPATCH', role: 'dispatcher' },
	support: { valid: true, session: 'S-SUPPORT', role: 'support' },
}

const REQUIRED_ROLE: Readonly<
	Record<'cancel' | 'reassign' | 'reset', 'dispatcher' | 'support'>
> = {
	cancel: 'dispatcher',
	reassign: 'dispatcher',
	reset: 'support',
}

function headerRole(
	headers: Readonly<Record<string, string>> | undefined,
): string | undefined {
	if (!headers) return undefined
	for (const [key, value] of Object.entries(headers)) {
		if (key.toLowerCase() === 'x-role') return value
	}
	return undefined
}

function validReason(
	payload: Readonly<Record<string, unknown>> | undefined,
): boolean {
	if (!payload) return false
	const keys = Object.keys(payload)
	if (keys.length !== 1 || keys[0] !== 'reason') return false
	const value = payload.reason
	if (typeof value !== 'string') return false
	const trimmed = value.trim()
	return [...trimmed].length >= 1 && [...trimmed].length <= 120
}

function validRoute(
	payload: Readonly<Record<string, unknown>> | undefined,
): boolean {
	if (!payload) return false
	const keys = Object.keys(payload)
	return (
		keys.length === 1 &&
		keys[0] === 'route' &&
		typeof payload.route === 'string' &&
		['R1', 'R2', 'R3'].includes(payload.route)
	)
}

function decideAuthorization(
	state: AlState,
	action: 'cancel' | 'reassign' | 'reset',
	actor: AlActor,
	headers: Readonly<Record<string, string>> | undefined,
	bypass: boolean,
): { status: number; reason: string } {
	if (bypass) return { status: 200, reason: 'maintenance_bypass' }
	const session = SESSIONS[actor]
	const guard = state.config.guard

	if (guard === 'ui_only') {
		if (action === 'reset') {
			return session.valid
				? { status: 200, reason: 'session_only' }
				: { status: 401, reason: 'unauthenticated' }
		}
		return { status: 200, reason: 'ui_only' }
	}

	if (guard === 'cancel_only' && action !== 'cancel') {
		if (action === 'reset') {
			return session.valid
				? { status: 200, reason: 'session_only' }
				: { status: 401, reason: 'unauthenticated' }
		}
		return { status: 200, reason: 'ui_only' }
	}

	if (!session.valid) return { status: 401, reason: 'unauthenticated' }
	if (guard === 'session_only') return { status: 200, reason: 'session_only' }

	const role =
		guard === 'request_roles'
			? (headerRole(headers) ?? session.role)
			: session.role
	if (role !== REQUIRED_ROLE[action]) {
		return { status: 403, reason: 'forbidden' }
	}
	return { status: 200, reason: 'role_checked' }
}

export function dispatchAndeanLogix(
	state: AlState,
	request: AlRequest,
): AlDecision {
	const deny = (
		status: number,
		reason: string,
		reachedHandler = true,
	): AlDecision => ({
		status,
		reason,
		state,
		changed: false,
		reachedHandler,
	})

	if (request.action === 'tracking') {
		if (!state.config.publicTracking) return deny(503, 'unavailable', false)
		if (request.method !== 'GET') return deny(405, 'method_not_allowed')
		const shipment = state.shipments.find((entry) => entry.id === 'SH-301')
		return {
			status: 200,
			reason: `tracking:${shipment?.status ?? 'unknown'}`,
			state,
			changed: false,
			reachedHandler: true,
		}
	}

	if (!state.config.adminService) return deny(503, 'unavailable', false)
	if (state.config.adminIngress === 'closed') {
		return deny(503, 'connection_blocked', false)
	}
	if (
		state.config.adminIngress === 'ops_only' &&
		request.network === 'public'
	) {
		return deny(503, 'connection_blocked', false)
	}
	if (request.method !== 'POST') return deny(405, 'method_not_allowed')

	const bypass = state.maintenance && state.config.maintenanceBypass
	const authorization = decideAuthorization(
		state,
		request.action,
		request.actor,
		request.headers,
		bypass,
	)
	if (authorization.status !== 200) {
		return deny(authorization.status, authorization.reason)
	}

	if (request.action === 'reassign') {
		if (!validRoute(request.payload)) return deny(422, 'invalid_payload')
		const target = request.target ?? 'SH-302'
		const shipment = state.shipments.find((entry) => entry.id === target)
		if (!shipment) return deny(404, 'not_found')
		if (shipment.route === request.payload?.route) return deny(409, 'conflict')
		const next: AlState = {
			...state,
			shipments: state.shipments.map((entry) =>
				entry.id === target
					? { ...entry, route: String(request.payload?.route) }
					: entry,
			),
			audit: [
				...state.audit,
				`reassign:${target}:${String(request.payload?.route)}`,
			],
		}
		return {
			status: 200,
			reason: 'reassigned',
			state: next,
			changed: true,
			reachedHandler: true,
		}
	}

	if (!validReason(request.payload)) return deny(422, 'invalid_payload')

	if (request.action === 'reset') {
		const target = request.target ?? 'DR-7'
		const driver = state.drivers.find((entry) => entry.id === target)
		if (!driver) return deny(404, 'not_found')
		const next: AlState = {
			...state,
			drivers: state.drivers.map((entry) =>
				entry.id === target
					? { ...entry, credentialRevision: entry.credentialRevision + 1 }
					: entry,
			),
			audit: [...state.audit, `reset:${target}`],
		}
		return {
			status: 200,
			reason: 'reset_queued',
			state: next,
			changed: true,
			reachedHandler: true,
		}
	}

	const target = request.target ?? 'SH-301'
	const shipment = state.shipments.find((entry) => entry.id === target)
	if (!shipment) return deny(404, 'not_found')
	if (shipment.status === 'cancelled') return deny(409, 'conflict')
	const next: AlState = {
		...state,
		shipments: state.shipments.map((entry) =>
			entry.id === target ? { ...entry, status: 'cancelled' as const } : entry,
		),
		audit: [...state.audit, `cancel:${target}`],
	}
	return {
		status: 200,
		reason: 'cancelled',
		state: next,
		changed: true,
		reachedHandler: true,
	}
}

export type AlCommand =
	| {
			readonly kind: 'configure'
			readonly field: keyof AlConfig
			readonly value: string | boolean
	  }
	| { readonly kind: 'set_maintenance'; readonly value: boolean }

const AL_VALUES: Readonly<
	Record<keyof AlConfig, readonly (string | boolean)[]>
> = {
	guard: [
		'ui_only',
		'cancel_only',
		'session_only',
		'request_roles',
		'server_roles',
	],
	maintenanceBypass: [true, false],
	adminIngress: ['public_and_ops', 'ops_only', 'closed'],
	adminService: [true, false],
	publicTracking: [true, false],
}

export function applyAndeanLogix(
	state: AlState,
	command: AlCommand,
): OperationResult<AlState> {
	if (command.kind === 'set_maintenance') {
		return applied(
			{ ...state, maintenance: command.value },
			`maintenance:${command.value}`,
		)
	}
	if (!AL_VALUES[command.field].includes(command.value)) {
		return reject(
			'CONFIGURATION_REJECTED',
			`Valor no admitido para ${command.field}: ${String(command.value)}`,
		)
	}
	return applied(
		{
			...state,
			config: { ...state.config, [command.field]: command.value },
		},
		`config:${command.field}=${String(command.value)}`,
	)
}

/**
 * Expected outcome of a request against the supplied policy under the declared
 * role matrix. This oracle is written from the ficha, independently of the
 * guard implementation it judges.
 */
function expected(
	config: AlConfig,
	request: AlRequest,
	maintenance: boolean,
): { status: number; changed: boolean } {
	if (!config.adminService) return { status: 503, changed: false }
	if (config.adminIngress === 'closed') return { status: 503, changed: false }
	if (config.adminIngress === 'ops_only' && request.network === 'public') {
		return { status: 503, changed: false }
	}
	if (request.method === 'GET') return { status: 405, changed: false }
	if (maintenance && config.maintenanceBypass) {
		// Only a policy that keeps the bypass can reach here; the oracle never
		// allows it, so the mismatch is reported as a failure.
		return { status: 401, changed: false }
	}
	const session = SESSIONS[request.actor]
	if (!session.valid) return { status: 401, changed: false }
	if (
		session.role !==
		REQUIRED_ROLE[request.action as 'cancel' | 'reassign' | 'reset']
	) {
		return { status: 403, changed: false }
	}
	return { status: 200, changed: true }
}

const ACTORS: readonly AlActor[] = [
	'anonymous',
	'expired',
	'tampered',
	'customer',
	'dispatcher',
	'support',
]
const ACTIONS = ['cancel', 'reassign', 'reset'] as const
const METHODS: readonly AlMethod[] = ['GET', 'POST']
const NETWORKS: readonly AlNetwork[] = ['public', 'ops']

export function verifyAndeanLogix(state: AlState): ExerciseReport {
	const checks: CheckResult[] = []
	const config = state.config

	const b1 = (() => {
		let copy = createAndeanLogixState(config)
		const cancel = dispatchAndeanLogix(copy, {
			action: 'cancel',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			payload: { reason: 'Prueba autorizada' },
		})
		const cancelOk =
			cancel.status === 200 &&
			cancel.state.shipments.find((entry) => entry.id === 'SH-301')?.status ===
				'cancelled'
		copy = cancel.state
		const reassign = dispatchAndeanLogix(copy, {
			action: 'reassign',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			payload: { route: 'R3' },
		})
		const reassignOk =
			reassign.status === 200 &&
			reassign.state.shipments.find((entry) => entry.id === 'SH-302')?.route ===
				'R3'
		copy = reassign.state
		const reset = dispatchAndeanLogix(copy, {
			action: 'reset',
			method: 'POST',
			network: 'ops',
			actor: 'support',
			payload: { reason: 'Prueba autorizada' },
		})
		const resetOk =
			reset.status === 200 &&
			reset.state.drivers.find((entry) => entry.id === 'DR-7')
				?.credentialRevision === 8
		const tracking = dispatchAndeanLogix(copy, {
			action: 'tracking',
			method: 'GET',
			network: 'public',
			actor: 'anonymous',
		})
		const trackingOps = dispatchAndeanLogix(copy, {
			action: 'tracking',
			method: 'GET',
			network: 'ops',
			actor: 'anonymous',
		})
		return {
			passed:
				cancelOk &&
				reassignOk &&
				resetOk &&
				tracking.status === 200 &&
				trackingOps.status === 200,
			detail: `cancel=${cancel.status}; reassign=${reassign.status}; reset=${reset.status}; tracking=${tracking.status}/${trackingOps.status}`,
		}
	})()
	checks.push({
		id: 'B306',
		kind: 'B',
		property:
			'Las tres operaciones legítimas y el seguimiento público mantienen su función exacta.',
		passed: b1.passed,
		evidence: b1.detail,
	})

	const mismatches: string[] = []
	let evaluated = 0
	for (const actor of ACTORS) {
		for (const action of ACTIONS) {
			for (const method of METHODS) {
				for (const network of NETWORKS) {
					for (const maintenance of [false, true]) {
						evaluated += 1
						const base = createAndeanLogixState(config)
						const candidate = { ...base, maintenance }
						const request: AlRequest = {
							action,
							method,
							network,
							actor,
							payload:
								action === 'reassign'
									? { route: 'R3' }
									: { reason: 'Prueba autorizada' },
						}
						const decision = dispatchAndeanLogix(candidate, request)
						const oracle = expected(config, request, maintenance)
						if (decision.status !== oracle.status) {
							mismatches.push(
								`${actor}/${action}/${method}/${network}/maint=${maintenance}: ${decision.status}≠${oracle.status}`,
							)
						} else if (oracle.status !== 200 && decision.changed) {
							mismatches.push(
								`${actor}/${action}/${method}/${network}: mutación en rechazo`,
							)
						}
					}
				}
			}
		}
	}
	checks.push({
		id: 'Q306',
		kind: 'Q',
		property:
			'La matriz de 144 peticiones se cumple con y sin mantenimiento, sin mutar en rechazos.',
		passed: mismatches.length === 0,
		evidence:
			mismatches.length === 0
				? `${evaluated} peticiones correctas`
				: mismatches.slice(0, 3).join(' | '),
	})

	const forged: string[] = []
	for (const action of ACTIONS) {
		for (const maintenance of [false, true]) {
			const base = createAndeanLogixState({
				...config,
				maintenanceBypass: false,
			})
			const candidate = { ...base, maintenance }
			const role = action === 'reset' ? 'support' : 'dispatcher'
			const decision = dispatchAndeanLogix(candidate, {
				action,
				method: 'POST',
				network: 'ops',
				actor: 'customer',
				payload:
					action === 'reassign'
						? { route: 'R3' }
						: { reason: 'Prueba autorizada' },
				headers: { 'X-Role': role, 'x-role': role },
			})
			if (decision.status !== 403 || decision.changed) {
				forged.push(`${action}/maint=${maintenance}: ${decision.status}`)
			}
		}
	}
	checks.push({
		id: 'Q306-forged',
		kind: 'Q',
		property: 'Un encabezado X-Role no amplía permisos.',
		passed: forged.length === 0,
		evidence:
			forged.length === 0 ? '6/6 rechazadas con 403' : forged.join(' | '),
	})

	const invalidPayloads: readonly AlRequest[] = [
		{
			action: 'cancel',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			payload: { reason: '   ' },
		},
		{
			action: 'reassign',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			payload: { route: 'R9' },
		},
		{
			action: 'reset',
			method: 'POST',
			network: 'ops',
			actor: 'support',
			payload: { reason: 'Prueba autorizada', role: 'admin' },
		},
		{
			action: 'cancel',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			target: 'SH-NOT-FOUND',
			payload: { reason: 'Prueba autorizada' },
		},
	]
	const invalidResults = invalidPayloads.map((request, index) => {
		const candidate = createAndeanLogixState({
			...config,
			maintenanceBypass: false,
		})
		const decision = dispatchAndeanLogix(candidate, request)
		const expectedStatus = index === 3 ? 404 : 422
		return {
			status: decision.status,
			changed: decision.changed,
			expectedStatus,
		}
	})
	checks.push({
		id: 'Q306-invalid',
		kind: 'Q',
		property:
			'Payloads inválidos y recursos inexistentes no cambian el negocio.',
		passed: invalidResults.every(
			(entry) => entry.status === entry.expectedStatus && !entry.changed,
		),
		evidence: invalidResults
			.map((entry) => `${entry.status}${entry.changed ? '!' : ''}`)
			.join(','),
	})

	const unauthorizedNetwork = (() => {
		const candidate = createAndeanLogixState(config)
		const publicAttempt = dispatchAndeanLogix(candidate, {
			action: 'cancel',
			method: 'POST',
			network: 'public',
			actor: 'dispatcher',
			payload: { reason: 'Prueba autorizada' },
		})
		const opsAttempt = dispatchAndeanLogix(candidate, {
			action: 'cancel',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			payload: { reason: 'Prueba autorizada' },
		})
		const tracking = dispatchAndeanLogix(candidate, {
			action: 'tracking',
			method: 'GET',
			network: 'public',
			actor: 'anonymous',
		})
		return {
			passed:
				config.adminIngress === 'ops_only' &&
				config.adminService &&
				config.publicTracking &&
				publicAttempt.status === 503 &&
				publicAttempt.reason === 'connection_blocked' &&
				opsAttempt.status === 200 &&
				tracking.status === 200,
			detail: `ingress=${config.adminIngress}; public=${publicAttempt.status}; ops=${opsAttempt.status}; tracking=${tracking.status}`,
		}
	})()
	checks.push({
		id: 'C306',
		kind: 'C',
		property:
			'ops_only bloquea el panel desde la red pública sin romper Operaciones ni el seguimiento.',
		passed: unauthorizedNetwork.passed,
		evidence: unauthorizedNetwork.detail,
	})

	return buildReport('cwe-306-andeanlogix', checks, ['C306'])
}
