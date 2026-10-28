import type { Server } from 'node:http'
import {
	AttemptService,
	InMemoryAttemptStore,
	type LedgerCommand,
} from '@cybersim/attempt-ledger'
import express, {
	type NextFunction,
	type Request,
	type Response,
} from 'express'
import { afterEach, describe, expect, it } from 'vitest'

import {
	type AttemptRouterOptions,
	createAttemptRouter,
} from '../src/attempt/infrastructure/AttemptController.js'

const versions = {
	task: 'andinapay-task-1',
	form: 'A',
	fixtures: 'ap-fixtures-1',
	engine: 'ecs-1',
	verifier: 'ap-verifier-1',
	rubric: 'ap-rubric-1',
	aids: 'aids-1',
}

interface Harness {
	readonly base: string
	readonly close: () => Promise<void>
}

const servers: Server[] = []

afterEach(async () => {
	await Promise.all(
		servers.splice(0).map(
			(server) =>
				new Promise<void>((resolve) => {
					server.close(() => resolve())
				}),
		),
	)
})

async function start(
	options: Partial<AttemptRouterOptions> = {},
): Promise<Harness> {
	let counter = 0
	const service =
		options.service ??
		new AttemptService(
			new InMemoryAttemptStore(),
			() => '2026-10-28T10:00:00.000Z',
		)
	const app = express()
	app.use(express.json())
	app.use((request, _response, next) => {
		const actor = request.get('x-test-actor')
		if (actor) {
			;(request as Request & { user?: { id_usuario_auth: number } }).user = {
				id_usuario_auth: Number(actor),
			}
		}
		next()
	})
	app.use(
		'/attempts',
		createAttemptRouter({
			service,
			actorId: (request) => request.user?.id_usuario_auth ?? null,
			newAttemptId: () => `attempt-${++counter}`,
			...options,
		}),
	)
	app.use(
		(
			error: { status?: number; code?: string },
			_request: Request,
			response: Response,
			_next: NextFunction,
		) => {
			response.status(error.status ?? 500).json({ code: error.code ?? 'ERROR' })
		},
	)
	const server = app.listen(0)
	servers.push(server)
	await new Promise<void>((resolve) => server.once('listening', resolve))
	const address = server.address()
	if (address === null || typeof address === 'string') {
		throw new Error('no port')
	}
	return {
		base: `http://127.0.0.1:${address.port}/attempts`,
		close: async () => {
			await new Promise<void>((resolve) => server.close(() => resolve()))
		},
	}
}

async function create(
	base: string,
	actor: string,
	body: Record<string, unknown> = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
	const response = await fetch(base, {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-test-actor': actor },
		body: JSON.stringify({
			caseId: 'cwe-321-andinapay',
			versions,
			...body,
		}),
	})
	return { status: response.status, body: (await response.json()) as never }
}

describe('attempt HTTP surface', () => {
	it('creates an attempt with a derived pseudonym and ignores a body actor', async () => {
		const harness = await start()
		const created = await create(harness.base, '7', {
			actorPseudonym: 'actor-forged',
		})

		expect(created.status).toBe(201)
		const record = created.body.record as {
			attemptId: string
			actor: { pseudonym: string }
			caseId: string
		}
		expect(record.attemptId).toBe('attempt-1')
		expect(record.caseId).toBe('cwe-321-andinapay')
		expect(record.actor.pseudonym).toMatch(/^actor-[a-f0-9]{32}$/)
		expect(record.actor.pseudonym).not.toBe('actor-forged')
	})

	it('rejects an unknown case and an unauthenticated request', async () => {
		const harness = await start()
		const unknown = await create(harness.base, '7', { caseId: 'cwe-999' })
		expect(unknown.status).toBe(422)

		const anonymous = await fetch(harness.base, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ caseId: 'cwe-321-andinapay', versions }),
		})
		expect(anonymous.status).toBe(401)
	})

	it('reads only the owner attempt', async () => {
		const harness = await start()
		await create(harness.base, '7')

		const owner = await fetch(`${harness.base}/attempt-1`, {
			headers: { 'x-test-actor': '7' },
		})
		expect(owner.status).toBe(200)

		const other = await fetch(`${harness.base}/attempt-1`, {
			headers: { 'x-test-actor': '8' },
		})
		expect(other.status).toBe(403)

		const missing = await fetch(`${harness.base}/attempt-missing`, {
			headers: { 'x-test-actor': '7' },
		})
		expect(missing.status).toBe(404)
	})

	it('applies a command, replays it and rejects a stale revision', async () => {
		const harness = await start()
		await create(harness.base, '7')
		const command: LedgerCommand = {
			kind: 'save-revision',
			operationId: 'op-1',
			expectedRevision: 0,
			diffHash: `sha256:${'a'.repeat(64)}`,
		}
		const send = (body: unknown, actor = '7') =>
			fetch(`${harness.base}/attempt-1/commands`, {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-test-actor': actor },
				body: JSON.stringify(body),
			})

		const applied = await send(command)
		expect(applied.status).toBe(200)
		expect(((await applied.json()) as { status: string }).status).toBe(
			'applied',
		)

		const replayed = await send(command)
		expect(replayed.status).toBe(200)
		expect(((await replayed.json()) as { status: string }).status).toBe(
			'replayed',
		)

		const stale = await send({ ...command, operationId: 'op-2' })
		expect(stale.status).toBe(409)

		const foreign = await send({ ...command, operationId: 'op-3' }, '8')
		expect(foreign.status).toBe(403)
	})

	it('refuses a client-supplied teacher battery', async () => {
		const harness = await start()
		await create(harness.base, '7')

		const response = await fetch(`${harness.base}/attempt-1/commands`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'x-test-actor': '7' },
			body: JSON.stringify({
				kind: 'deliver',
				operationId: 'deliver-1',
				expectedRevision: 0,
				evidenceHash: `sha256:${'b'.repeat(64)}`,
				teacherBattery: {
					batteryId: 'forged',
					tests: [{ testId: 'C1', source: 'teacher', outcome: 'pass' }],
				},
			}),
		})

		expect(response.status).toBe(422)
		expect(((await response.json()) as { code: string }).code).toBe(
			'TEACHER_BATTERY_SERVER_ONLY',
		)
	})

	it('rejects a malformed command before touching the ledger', async () => {
		const harness = await start()
		await create(harness.base, '7')

		const response = await fetch(`${harness.base}/attempt-1/commands`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'x-test-actor': '7' },
			body: JSON.stringify({
				kind: 'save-revision',
				expectedRevision: 0,
				diffHash: `sha256:${'a'.repeat(64)}`,
			}),
		})
		expect(response.status).toBe(400)
	})
})
