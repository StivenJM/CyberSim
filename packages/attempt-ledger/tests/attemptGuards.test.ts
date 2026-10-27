import { describe, expect, it } from 'vitest'

import {
	AttemptService,
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

const diff = (seed: string) => `sha256:${seed.repeat(64)}`
const now = () => '2026-10-27T10:00:00.000Z'

async function measured(store = new InMemoryAttemptStore()) {
	const service = new AttemptService(store, now)
	await service.create({
		attemptId: 'a1',
		caseId: 'cwe-321-andinapay',
		actorPseudonym: 'actor-1',
		versions,
		createdAt: now(),
	})
	await service.execute('a1', 'actor-1', {
		kind: 'save-revision',
		operationId: 'r1',
		expectedRevision: 0,
		diffHash: diff('a'),
	})
	return { service, store }
}

describe('creation rejects unknown or empty identifiers', () => {
	it('does not persist an attempt for an unknown case', async () => {
		const store = new InMemoryAttemptStore()
		const service = new AttemptService(store, now)
		const outcome = await service.create({
			attemptId: 'bad-1',
			caseId: 'cwe-999-unknown',
			actorPseudonym: 'actor-1',
			versions,
			createdAt: now(),
		})

		expect(outcome).toMatchObject({ status: 'rejected', code: 'invalid-state' })
		expect(await store.load('bad-1')).toBeUndefined()
	})

	it('does not persist an attempt with an empty identifier or version', async () => {
		const store = new InMemoryAttemptStore()
		const service = new AttemptService(store, now)
		const outcome = await service.create({
			attemptId: '',
			caseId: 'cwe-321-andinapay',
			actorPseudonym: 'actor-1',
			versions: { ...versions, rubric: '' },
			createdAt: now(),
		})

		expect(outcome).toMatchObject({ status: 'rejected', code: 'invalid-state' })
		expect(await store.load('')).toBeUndefined()
	})
})

describe('delivery with the authoritative battery', () => {
	it('delivers when the teacher battery repeats a student test id', async () => {
		const { service } = await measured()
		await service.execute('a1', 'actor-1', {
			kind: 'run-test',
			operationId: 'st1',
			expectedRevision: 1,
			testId: 'B1',
			fixtureId: 'AP-H1',
			outcome: 'pass',
		})
		await service.execute('a1', 'actor-1', {
			kind: 'save-diagnosis',
			operationId: 'd1',
			expectedRevision: 1,
			frontierId: 'AP-F1',
			citedArtifactIds: [],
			claim: 'Claim.',
		})

		const delivered = await service.execute('a1', 'actor-1', {
			kind: 'deliver',
			operationId: 'del-1',
			expectedRevision: 1,
			evidenceHash: diff('d'),
			teacherBattery: {
				batteryId: 'ap-battery-1',
				tests: [{ testId: 'B1', source: 'teacher', outcome: 'pass' }],
			},
		})

		expect(delivered.status).toBe('applied')
		if (delivered.status !== 'applied') return
		expect(studentTests(delivered.record).map((test) => test.testId)).toEqual([
			'B1',
		])
		expect(teacherTests(delivered.record).map((test) => test.testId)).toEqual([
			'B1',
		])
	})
})

describe('sealed diagnosis honours the client revision', () => {
	it('rejects a stale expectedRevision instead of sealing', async () => {
		const { service, store } = await measured()

		const stale = await service.execute('a1', 'actor-1', {
			kind: 'save-diagnosis',
			operationId: 'd1',
			expectedRevision: 0,
			frontierId: 'AP-F1',
			citedArtifactIds: [],
			claim: 'Claim.',
		})

		expect(stale).toMatchObject({
			status: 'rejected',
			code: 'revision-conflict',
		})
		expect((await store.load('a1'))?.diagnosis).toBeUndefined()
	})
})

describe('student tests use the closed case registry', () => {
	it('rejects a verifier the ficha never defined', async () => {
		const { service } = await measured()

		const outcome = await service.execute('a1', 'actor-1', {
			kind: 'run-test',
			operationId: 'st-unknown',
			expectedRevision: 1,
			testId: 'not-a-verifier',
			fixtureId: 'AP-H1',
			outcome: 'pass',
		})

		expect(outcome).toMatchObject({
			status: 'rejected',
			code: 'invalid-state',
		})
	})

	it('rejects a fixture the ficha never defined', async () => {
		const { service } = await measured()

		const outcome = await service.execute('a1', 'actor-1', {
			kind: 'run-test',
			operationId: 'st-unknown-fixture',
			expectedRevision: 1,
			testId: 'B1',
			fixtureId: 'not-a-fixture',
			outcome: 'pass',
		})

		expect(outcome).toMatchObject({
			status: 'rejected',
			code: 'invalid-state',
		})
	})
})

describe('interpreter versions', () => {
	it('refuses to read an attempt under another rubric', async () => {
		const store = new InMemoryAttemptStore()
		await measured(store)
		const interpreter = new AttemptService(store, now, {
			interpreter: { ...versions, rubric: 'ap-rubric-2' },
		})

		const outcome = await interpreter.execute('a1', 'actor-1', {
			kind: 'pause',
			operationId: 'p1',
			expectedRevision: 1,
		})

		expect(outcome).toMatchObject({
			status: 'rejected',
			code: 'version-mismatch',
		})
	})

	it('accepts the attempt under its own versions', async () => {
		const store = new InMemoryAttemptStore()
		await measured(store)
		const interpreter = new AttemptService(store, now, {
			interpreter: versions,
		})

		const outcome = await interpreter.execute('a1', 'actor-1', {
			kind: 'pause',
			operationId: 'p1',
			expectedRevision: 1,
		})

		expect(outcome.status).toBe('applied')
	})
})
