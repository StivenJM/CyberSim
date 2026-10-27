import { describe, expect, it } from 'vitest'

import {
	AttemptService,
	type AttemptStore,
	InMemoryAttemptStore,
	studentTests,
	teacherTests,
} from '../src/index.js'

const versions = {
	task: 'andinapay-task-1',
	form: 'A',
	fixtures: 'ap-fixtures-1',
	engine: 'ecs-1',
	verifier: 'ap-verifier-1',
	rubric: 'ap-rubric-1',
	aids: 'aids-1',
} as const

function makeClock(): () => string {
	let tick = 0
	return () => {
		tick += 1
		return `2026-10-27T10:00:${String(tick).padStart(2, '0')}.000Z`
	}
}

function makeService(
	store: AttemptStore = new InMemoryAttemptStore(),
): AttemptService {
	return new AttemptService(store, makeClock())
}

async function createAttempt(service: AttemptService, practice = false) {
	const outcome = await service.create(
		{
			attemptId: 'attempt-1',
			caseId: 'cwe-321-andinapay',
			actorPseudonym: 'actor-1',
			versions,
		},
		{ practice },
	)
	if (outcome.status === 'rejected') throw new Error(outcome.errors.join(', '))
	return outcome.record
}

async function withRevision(service: AttemptService) {
	return service.execute('attempt-1', 'actor-1', {
		kind: 'save-revision',
		operationId: 'op-revision-1',
		expectedRevision: 0,
		diffHash: `sha256:${'a'.repeat(64)}`,
	})
}

class FailingStore implements AttemptStore {
	private readonly inner = new InMemoryAttemptStore()

	async load(attemptId: string) {
		return this.inner.load(attemptId)
	}

	async insert(record: Parameters<AttemptStore['insert']>[0]) {
		return this.inner.insert(record)
	}

	async save(): Promise<{
		ok: false
		code: 'persistence-failure'
		detail: string
	}> {
		return {
			ok: false,
			code: 'persistence-failure',
			detail: 'disk unavailable',
		}
	}
}

describe('attempt cycle', () => {
	it('replays a duplicated command without duplicating evidence', async () => {
		const service = makeService()
		await createAttempt(service)

		const first = await withRevision(service)
		const duplicate = await withRevision(service)

		expect(first.status).toBe('applied')
		expect(duplicate.status).toBe('replayed')
		if (duplicate.status !== 'replayed') return
		expect(duplicate.record.revisions).toHaveLength(1)
		expect(duplicate.record.operations).toHaveLength(1)
		expect(duplicate.operation?.operationId).toBe('op-revision-1')
	})

	it('replays after a lost response, reading the stored receipt', async () => {
		const store = new InMemoryAttemptStore()
		const service = makeService(store)
		await createAttempt(service)
		await withRevision(service)

		const reconnected = makeService(store)
		const retry = await reconnected.execute('attempt-1', 'actor-1', {
			kind: 'save-revision',
			operationId: 'op-revision-1',
			expectedRevision: 0,
			diffHash: `sha256:${'a'.repeat(64)}`,
		})

		expect(retry.status).toBe('replayed')
		if (retry.status !== 'replayed') return
		expect(retry.record.revisions).toHaveLength(1)
	})

	it('lets only one of two concurrent writes append', async () => {
		const service = makeService()
		await createAttempt(service)

		const [left, right] = await Promise.all([
			service.execute('attempt-1', 'actor-1', {
				kind: 'save-revision',
				operationId: 'op-left',
				expectedRevision: 0,
				diffHash: `sha256:${'b'.repeat(64)}`,
			}),
			service.execute('attempt-1', 'actor-1', {
				kind: 'save-revision',
				operationId: 'op-right',
				expectedRevision: 0,
				diffHash: `sha256:${'c'.repeat(64)}`,
			}),
		])

		const statuses = [left.status, right.status].sort()
		expect(statuses).toEqual(['applied', 'rejected'])
		const rejected = [left, right].find(
			(outcome) => outcome.status === 'rejected',
		)
		expect(rejected).toMatchObject({
			status: 'rejected',
			code: 'revision-conflict',
		})
	})

	it('rejects a stale revision without overwriting the stored one', async () => {
		const service = makeService()
		await createAttempt(service)
		await withRevision(service)

		const stale = await service.execute('attempt-1', 'actor-1', {
			kind: 'run-test',
			operationId: 'op-test-stale',
			expectedRevision: 0,
			testId: 'student-1',
			fixtureId: 'fixture-1',
			outcome: 'pass',
		})

		expect(stale).toMatchObject({
			status: 'rejected',
			code: 'revision-conflict',
		})
	})

	it('keeps the same revision and exposure when pausing and resuming', async () => {
		const service = makeService()
		await createAttempt(service)
		await withRevision(service)
		await service.execute('attempt-1', 'actor-1', {
			kind: 'reveal-aid',
			operationId: 'op-aid-1',
			expectedRevision: 1,
			segmentId: 'A1',
			level: 'A1',
		})

		const paused = await service.execute('attempt-1', 'actor-1', {
			kind: 'pause',
			operationId: 'op-pause',
			expectedRevision: 1,
		})
		expect(paused.status).toBe('applied')

		const resumed = await service.execute('attempt-1', 'actor-1', {
			kind: 'resume',
			operationId: 'op-resume',
			expectedRevision: 1,
		})
		expect(resumed.status).toBe('applied')
		if (resumed.status !== 'applied') return
		expect(resumed.record.status).toBe('in-progress')
		expect(resumed.record.revisions).toHaveLength(1)
		expect(resumed.record.aids).toHaveLength(1)
	})

	it('refuses to resume a delivered attempt without losing the delivery', async () => {
		const service = makeService()
		await createAttempt(service)
		await withRevision(service)
		await service.execute('attempt-1', 'actor-1', {
			kind: 'save-diagnosis',
			operationId: 'op-diagnosis',
			expectedRevision: 1,
			frontierId: 'AP-F1',
			citedArtifactIds: ['AP-H1'],
			claim:
				'La clave de escritura es la misma que cifró los registros históricos.',
		})
		const delivered = await service.execute('attempt-1', 'actor-1', {
			kind: 'deliver',
			operationId: 'op-deliver',
			expectedRevision: 1,
			evidenceHash: `sha256:${'d'.repeat(64)}`,
			teacherBattery: { batteryId: 'ap-battery-1', tests: [] },
		})
		expect(delivered.status).toBe('applied')

		const resume = await service.execute('attempt-1', 'actor-1', {
			kind: 'resume',
			operationId: 'op-resume',
			expectedRevision: 1,
		})

		expect(resume.status).toBe('rejected')
		if (resume.status !== 'rejected') return
		expect(resume.code).toBe('invalid-state')
		const stored = await service.execute('attempt-1', 'actor-1', {
			kind: 'record-explanation',
			operationId: 'op-explanation',
			expectedRevision: 1,
			promptId: 'D2',
			text: 'Reutilicé la clave expuesta antes de retirarla.',
		})
		expect(stored).toMatchObject({ status: 'applied' })
		if (stored.status !== 'applied') return
		expect(stored.record.delivery?.teacherBatteryId).toBe('ap-battery-1')
	})

	it('records a mid-run technical error without discarding earlier tests', async () => {
		const service = makeService()
		await createAttempt(service)
		await withRevision(service)
		await service.execute('attempt-1', 'actor-1', {
			kind: 'run-test',
			operationId: 'op-test-1',
			expectedRevision: 1,
			testId: 'B1',
			fixtureId: 'envelope-AP-R01-K1',
			outcome: 'pass',
		})
		await service.execute('attempt-1', 'actor-1', {
			kind: 'run-test',
			operationId: 'op-test-2',
			expectedRevision: 1,
			testId: 'Q1',
			fixtureId: 'envelope-AP-R01-K1',
			outcome: 'technical-error',
		})
		const incident = await service.execute('attempt-1', 'actor-1', {
			kind: 'record-incident',
			operationId: 'op-incident',
			expectedRevision: 1,
			incidentId: 'incident-1',
			incidentKind: 'timeout',
			detail: 'WebCrypto worker exceeded the configured budget',
			blocking: true,
		})

		expect(incident.status).toBe('applied')
		if (incident.status !== 'applied') return
		expect(incident.record.status).toBe('technical-incident')
		expect(incident.record.tests).toHaveLength(2)
		expect(incident.record.delivery).toBeUndefined()
	})

	it('persists an aided reset as a new revision of the same attempt', async () => {
		const service = makeService()
		const created = await createAttempt(service)
		await withRevision(service)
		await service.execute('attempt-1', 'actor-1', {
			kind: 'reveal-aid',
			operationId: 'op-aid-2',
			expectedRevision: 1,
			segmentId: 'A2a',
			level: 'A2',
		})

		const reset = await service.execute('attempt-1', 'actor-1', {
			kind: 'reset',
			operationId: 'op-reset',
			expectedRevision: 1,
			diffHash: `sha256:${'e'.repeat(64)}`,
		})

		expect(reset.status).toBe('applied')
		if (reset.status !== 'applied') return
		expect(reset.record.attemptId).toBe(created.attemptId)
		expect(reset.record.revisions.map((revision) => revision.revision)).toEqual(
			[1, 2],
		)
		expect(reset.record.aids).toHaveLength(1)
		expect(reset.record.sequence).toBe(3)
	})

	it('refuses an attempt owned by another actor', async () => {
		const store = new InMemoryAttemptStore()
		const service = makeService(store)
		await createAttempt(service)

		const stolen = await service.execute('attempt-1', 'actor-2', {
			kind: 'save-revision',
			operationId: 'op-stolen',
			expectedRevision: 0,
			diffHash: `sha256:${'f'.repeat(64)}`,
		})

		expect(stolen).toMatchObject({
			status: 'rejected',
			code: 'forbidden',
		})
		const stored = await store.load('attempt-1')
		expect(stored?.sequence).toBe(0)
	})

	it('does not expose an aid when persistence fails', async () => {
		const service = makeService(new FailingStore())
		await createAttempt(service)
		const outcome = await service.execute('attempt-1', 'actor-1', {
			kind: 'reveal-aid',
			operationId: 'op-aid-fail',
			expectedRevision: 0,
			segmentId: 'A1',
			level: 'A1',
		})

		expect(outcome).toMatchObject({
			status: 'rejected',
			code: 'persistence-failure',
		})
		expect(outcome).not.toHaveProperty('exposure')
	})

	it('keeps the teacher battery separate from student-chosen tests', async () => {
		const service = makeService()
		await createAttempt(service)
		await withRevision(service)
		await service.execute('attempt-1', 'actor-1', {
			kind: 'run-test',
			operationId: 'op-test-own',
			expectedRevision: 1,
			testId: 'own-check',
			fixtureId: 'envelope-AP-R01-K1',
			outcome: 'pass',
		})
		await service.execute('attempt-1', 'actor-1', {
			kind: 'save-diagnosis',
			operationId: 'op-diagnosis',
			expectedRevision: 1,
			frontierId: 'AP-F1',
			citedArtifactIds: [],
			claim: 'Diagnóstico provisional.',
		})
		const delivered = await service.execute('attempt-1', 'actor-1', {
			kind: 'deliver',
			operationId: 'op-deliver',
			expectedRevision: 1,
			evidenceHash: `sha256:${'0'.repeat(64)}`,
			teacherBattery: {
				batteryId: 'ap-battery-1',
				tests: [
					{ testId: 'B1', source: 'teacher', outcome: 'pass' },
					{ testId: 'Q1', source: 'teacher', outcome: 'pass' },
				],
			},
		})
		if (delivered.status !== 'applied') {
			throw new Error('delivery failed')
		}

		expect(studentTests(delivered.record).map((test) => test.testId)).toEqual([
			'own-check',
		])
		expect(teacherTests(delivered.record).map((test) => test.testId)).toEqual([
			'B1',
			'Q1',
		])
		expect(delivered.record.delivery?.teacherBatteryId).toBe('ap-battery-1')
	})

	it('keeps practice attempts out of the measured evidence', async () => {
		const service = makeService()
		const practice = await createAttempt(service, true)
		expect(practice.status).toBe('practice')

		const revision = await service.execute('attempt-1', 'actor-1', {
			kind: 'save-revision',
			operationId: 'op-practice-revision',
			expectedRevision: 0,
			diffHash: `sha256:${'1'.repeat(64)}`,
		})
		expect(revision).toMatchObject({
			status: 'rejected',
			code: 'invalid-state',
		})
	})

	it('requires a sealed diagnosis before delivery', async () => {
		const service = makeService()
		await createAttempt(service)
		await withRevision(service)

		const delivery = await service.execute('attempt-1', 'actor-1', {
			kind: 'deliver',
			operationId: 'op-deliver',
			expectedRevision: 1,
			evidenceHash: `sha256:${'2'.repeat(64)}`,
			teacherBattery: { batteryId: 'ap-battery-1', tests: [] },
		})

		expect(delivery).toMatchObject({
			status: 'rejected',
			code: 'invalid-state',
		})
	})
})
