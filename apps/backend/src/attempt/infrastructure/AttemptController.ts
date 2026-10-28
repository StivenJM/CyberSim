import { randomUUID } from 'node:crypto'
import type {
	AttemptService,
	LedgerCommand,
	LedgerOutcome,
	ReadAttemptOutcome,
} from '@cybersim/attempt-ledger'
import {
	ATTEMPT_OPERATION_KINDS,
	type AttemptVersionSet,
} from '@cybersim/scenario-contract'
import { type Request, Router } from 'express'

import { ServiceError } from '../../integrations/config.js'
import { attemptPseudonym } from '../domain/pseudonym.js'

export interface AttemptRouterOptions {
	readonly service: AttemptService
	/** Authenticated auth id, or null when the request carries no valid session. */
	readonly actorId: (request: Request) => number | null
	/** Injectable for deterministic tests; defaults to a random UUID. */
	readonly newAttemptId?: () => string
}

const HTTP_STATUS: Readonly<Record<string, number>> = {
	'not-found': 404,
	forbidden: 403,
	'revision-conflict': 409,
	'version-mismatch': 409,
	'invalid-state': 422,
	'unknown-case': 422,
	'persistence-failure': 503,
}

function badRequest(code: string): ServiceError {
	return new ServiceError(code, 400)
}

function parseCreate(body: unknown): {
	readonly caseId: string
	readonly versions: AttemptVersionSet
	readonly practice: boolean
} {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		throw badRequest('INVALID_ATTEMPT')
	}
	const value = body as Record<string, unknown>
	if (typeof value.caseId !== 'string' || !value.caseId) {
		throw badRequest('INVALID_ATTEMPT')
	}
	if (
		!value.versions ||
		typeof value.versions !== 'object' ||
		Array.isArray(value.versions)
	) {
		throw badRequest('INVALID_ATTEMPT')
	}
	return {
		caseId: value.caseId,
		versions: value.versions as unknown as AttemptVersionSet,
		practice: value.practice === true,
	}
}

function parseCommand(body: unknown): LedgerCommand {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		throw badRequest('INVALID_COMMAND')
	}
	const value = body as Record<string, unknown>
	if (typeof value.operationId !== 'string' || !value.operationId.trim()) {
		throw badRequest('INVALID_COMMAND')
	}
	if (
		typeof value.expectedRevision !== 'number' ||
		!Number.isInteger(value.expectedRevision) ||
		value.expectedRevision < 0
	) {
		throw badRequest('INVALID_COMMAND')
	}
	if (
		typeof value.kind !== 'string' ||
		!(ATTEMPT_OPERATION_KINDS as readonly string[]).includes(value.kind)
	) {
		throw badRequest('INVALID_COMMAND')
	}
	if (value.kind === 'deliver') {
		const battery = value.teacherBattery as { tests?: unknown } | undefined
		if (battery && Array.isArray(battery.tests) && battery.tests.length > 0) {
			throw new ServiceError('TEACHER_BATTERY_SERVER_ONLY', 422)
		}
		return {
			...(value as unknown as LedgerCommand),
			teacherBattery: { batteryId: 'server-battery-pending', tests: [] },
		} as LedgerCommand
	}
	return value as unknown as LedgerCommand
}

function sendOutcome(
	outcome: LedgerOutcome,
	successStatus: number,
): { readonly status: number; readonly body: unknown } {
	if (outcome.status === 'rejected') {
		return {
			status: HTTP_STATUS[outcome.code] ?? 422,
			body: { status: 'rejected', code: outcome.code, errors: outcome.errors },
		}
	}
	return {
		status: successStatus,
		body: {
			status: outcome.status,
			record: outcome.record,
			operation: outcome.operation ?? null,
			exposure:
				outcome.status === 'applied' ? (outcome.exposure ?? null) : null,
		},
	}
}

/**
 * HTTP surface for attempt evidence.
 *
 * The actor is resolved from the authenticated request, never from the body, so
 * copying an `attemptId` is not enough to read or mutate someone else's record.
 */
export function createAttemptRouter(options: AttemptRouterOptions): Router {
	const router = Router()
	const newId = options.newAttemptId ?? randomUUID

	const actorOf = (request: Request): number => {
		const id = options.actorId(request)
		if (id === null) throw new ServiceError('AUTH_REQUIRED', 401)
		return id
	}

	router.post('/', async (request, response) => {
		const input = parseCreate(request.body)
		const outcome = await options.service.create(
			{
				attemptId: newId(),
				caseId: input.caseId,
				actorPseudonym: attemptPseudonym(actorOf(request)),
				versions: input.versions,
			},
			{ practice: input.practice },
		)
		const result = sendOutcome(outcome, 201)
		response.status(result.status).json(result.body)
	})

	router.get('/:attemptId', async (request, response) => {
		const outcome: ReadAttemptOutcome = await options.service.read(
			request.params.attemptId,
			attemptPseudonym(actorOf(request)),
		)
		if (outcome.status === 'rejected') {
			response.status(HTTP_STATUS[outcome.code] ?? 422).json({
				status: 'rejected',
				code: outcome.code,
				errors: outcome.errors,
			})
			return
		}
		response.status(200).json({ status: 'ok', record: outcome.record })
	})

	router.post('/:attemptId/commands', async (request, response) => {
		const command = parseCommand(request.body)
		const outcome = await options.service.execute(
			request.params.attemptId,
			attemptPseudonym(actorOf(request)),
			command,
		)
		const result = sendOutcome(outcome, 200)
		response.status(result.status).json(result.body)
	})

	return router
}
