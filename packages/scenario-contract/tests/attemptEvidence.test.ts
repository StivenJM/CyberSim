import { describe, expect, it } from 'vitest'

import {
	ATTEMPT_SCHEMA_VERSION,
	createAttemptRecord,
	isAttemptCompatible,
	validateAttemptRecord,
} from '../src/index.js'

const versions = {
	task: 'andinapay-task-1',
	form: 'A',
	fixtures: 'ap-fixtures-1',
	engine: 'ecs-1',
	verifier: 'ap-verifier-1',
	rubric: 'ap-rubric-1',
	aids: 'aids-1',
}

const baseInput = {
	attemptId: 'attempt-0001',
	caseId: 'cwe-321-andinapay',
	actorPseudonym: 'actor-7f3a91',
	versions,
	createdAt: '2026-10-27T10:00:00.000Z',
}

describe('attempt evidence contract', () => {
	it('creates a reproducible record with a version hash and identity', () => {
		const record = createAttemptRecord(baseInput)
		const twin = createAttemptRecord(baseInput)

		expect(record.schemaVersion).toBe(ATTEMPT_SCHEMA_VERSION)
		expect(record.status).toBe('in-progress')
		expect(record.sequence).toBe(0)
		expect(record.progressKind).toBe('attempt-evidence')
		expect(record.versionHash).toMatch(/^sha256:[a-f0-9]{64}$/)
		expect(record.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/)
		expect(record.versionHash).toBe(twin.versionHash)
		expect(record.contentHash).toBe(twin.contentHash)
		expect(validateAttemptRecord(record)).toEqual({ ok: true, errors: [] })
	})

	it('rejects unknown case identifiers instead of storing free strings', () => {
		const record = createAttemptRecord({
			...baseInput,
			caseId: 'cwe-999-invented',
		})

		const result = validateAttemptRecord(record)
		expect(result.ok).toBe(false)
		expect(result.errors).toContain(
			'caseId: unsupported investigated case "cwe-999-invented"',
		)
	})

	it('rejects unsupported schema versions without interpreting the record', () => {
		const record = {
			...createAttemptRecord(baseInput),
			schemaVersion: 99,
		}

		expect(validateAttemptRecord(record)).toEqual({
			ok: false,
			errors: ['schemaVersion: unsupported version 99'],
		})
	})

	it('rejects duplicate operation identifiers and non-monotonic sequences', () => {
		const record = createAttemptRecord(baseInput)
		const withOperations = {
			...record,
			sequence: 2,
			operations: [
				{
					operationId: 'op-a',
					sequence: 1,
					kind: 'save-revision',
					expectedRevision: 0,
					revisionAfter: 1,
					payloadHash: 'sha256:aa',
				},
				{
					operationId: 'op-a',
					sequence: 2,
					kind: 'run-test',
					expectedRevision: 1,
					revisionAfter: 1,
					payloadHash: 'sha256:bb',
				},
			],
		}

		const result = validateAttemptRecord(withOperations)
		expect(result.ok).toBe(false)
		expect(result.errors).toContain(
			'operations[1]: duplicate operationId "op-a"',
		)
	})

	it('rejects a delivered attempt without a sealed diagnosis', () => {
		const record = {
			...createAttemptRecord(baseInput),
			status: 'delivered',
			sequence: 1,
			operations: [
				{
					operationId: 'op-deliver',
					sequence: 1,
					kind: 'deliver',
					expectedRevision: 0,
					revisionAfter: 1,
					payloadHash: 'sha256:cc',
				},
			],
			delivery: {
				deliveredAt: '2026-10-27T10:05:00.000Z',
				revision: 1,
				evidenceHash: 'sha256:dd',
				teacherBatteryId: 'ap-battery-1',
			},
		}

		const result = validateAttemptRecord(record)
		expect(result.ok).toBe(false)
		expect(result.errors).toContain(
			'delivery: requires a sealed diagnosis before delivery',
		)
	})

	it('rejects duplicated revision numbers, tests and aid segments', () => {
		const record = {
			...createAttemptRecord(baseInput),
			revisions: [
				{
					revision: 1,
					savedAt: '2026-10-27T10:01:00.000Z',
					diffHash: 'sha256:01',
				},
				{
					revision: 1,
					savedAt: '2026-10-27T10:02:00.000Z',
					diffHash: 'sha256:02',
				},
			],
			tests: [
				{ testId: 'student-1', source: 'student', outcome: 'pass' },
				{ testId: 'student-1', source: 'student', outcome: 'fail' },
			],
			aids: [
				{
					segmentId: 'seg-1',
					level: 'A1',
					revealedAt: '2026-10-27T10:03:00.000Z',
				},
				{
					segmentId: 'seg-1',
					level: 'A2',
					revealedAt: '2026-10-27T10:04:00.000Z',
				},
			],
		}

		const result = validateAttemptRecord(record)
		expect(result.ok).toBe(false)
		expect(result.errors).toEqual(
			expect.arrayContaining([
				'revisions[1]: duplicate revision 1',
				'tests[1]: duplicate testId "student-1"',
				'aids[1]: duplicate segmentId "seg-1"',
			]),
		)
	})

	it('validates frozen input without mutating it', () => {
		const record = createAttemptRecord(baseInput)
		const frozen = Object.freeze({ ...record, operations: Object.freeze([]) })

		const before = JSON.stringify(frozen)
		validateAttemptRecord(frozen)
		expect(JSON.stringify(frozen)).toBe(before)
	})

	it('keeps a record interpretable only under its own rubric versions', () => {
		const record = createAttemptRecord(baseInput)

		expect(isAttemptCompatible(record, versions)).toEqual({ compatible: true })

		expect(
			isAttemptCompatible(record, { ...versions, rubric: 'ap-rubric-2' }),
		).toEqual({
			compatible: false,
			reason: 'rubric',
			detail:
				'record was produced with rubric "ap-rubric-1", interpreter expects "ap-rubric-2"',
		})

		expect(
			isAttemptCompatible(record, { ...versions, form: 'B' }),
		).toMatchObject({ compatible: false, reason: 'form' })
	})
})
