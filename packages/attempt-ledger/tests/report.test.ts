import {
	type AttemptRecord,
	computeAttemptContentHash,
	createAttemptRecord,
} from '@cybersim/scenario-contract'
import { describe, expect, it } from 'vitest'

import { AttemptService, InMemoryAttemptStore } from '../src/index.js'
import { buildAttemptReport, reportHasAggregateScore } from '../src/report.js'

const versions = {
	task: 'andinapay-task-1',
	form: 'A',
	fixtures: 'ap-fixtures-1',
	engine: 'ecs-1',
	verifier: 'ap-verifier-1',
	rubric: 'ap-rubric-1',
	aids: 'aids-1',
} as const

const clock = () => '2026-10-27T10:00:00.000Z'
const diff = (seed: string) => `sha256:${seed.repeat(64)}`

async function delivered(): Promise<AttemptRecord> {
	const service = new AttemptService(new InMemoryAttemptStore(), clock)
	const created = await service.create({
		attemptId: 'attempt-report',
		caseId: 'cwe-321-andinapay',
		actorPseudonym: 'actor-1',
		versions,
	})
	if (created.status === 'rejected') throw new Error(created.errors.join(','))
	await service.execute('attempt-report', 'actor-1', {
		kind: 'save-revision',
		operationId: 'r1',
		expectedRevision: 0,
		diffHash: diff('a'),
	})
	await service.execute('attempt-report', 'actor-1', {
		kind: 'save-diagnosis',
		operationId: 'd1',
		expectedRevision: 1,
		frontierId: 'AP-F1',
		citedArtifactIds: ['AP-H1', 'logs/application.log'],
		claim: 'La clave histórica cifró R01 y R02.',
	})
	await service.execute('attempt-report', 'actor-1', {
		kind: 'run-test',
		operationId: 't1',
		expectedRevision: 1,
		testId: 'B1',
		fixtureId: 'AP-H1',
		outcome: 'pass',
	})
	const deliveredOutcome = await service.execute('attempt-report', 'actor-1', {
		kind: 'deliver',
		operationId: 'deliver',
		expectedRevision: 1,
		evidenceHash: diff('b'),
		teacherBattery: {
			batteryId: 'ap-battery-1',
			tests: [
				{ testId: 'C1', source: 'teacher', outcome: 'pass' },
				{ testId: 'Q1', source: 'teacher', outcome: 'fail' },
			],
		},
	})
	if (deliveredOutcome.status !== 'applied') throw new Error('delivery failed')
	const explained = await service.execute('attempt-report', 'actor-1', {
		kind: 'record-explanation',
		operationId: 'e1',
		expectedRevision: 1,
		promptId: 'D2',
		text: 'Migré la copia operativa y comprobé la lectura; la copia antigua sigue legible.',
	})
	if (explained.status !== 'applied') throw new Error('explanation failed')
	return explained.record
}

function withAid(record: AttemptRecord, revealedAt: string): AttemptRecord {
	const next = {
		...record,
		aids: [
			...record.aids,
			{ segmentId: 'A2', level: 'A2' as const, revealedAt },
		],
	}
	return { ...next, contentHash: computeAttemptContentHash(next) }
}

describe('attempt report', () => {
	it('builds one ordinal profile per dimension with cited evidence', async () => {
		const record = await delivered()
		const report = buildAttemptReport(record, {
			B: true,
			Q: false,
			C: { C1: true },
		})

		expect(report.dimensions.map((entry) => entry.dimension)).toEqual([
			'D1',
			'D2',
			'D3',
			'D4',
		])
		const d1 = report.dimensions.find((entry) => entry.dimension === 'D1')
		expect(d1?.evidence).toEqual([
			'diagnosis:AP-F1',
			'artifact:AP-H1',
			'artifact:logs/application.log',
		])
		expect(d1?.status).toBe('requires_review')
	})

	it('keeps student-chosen tests and the teacher battery apart', async () => {
		const report = buildAttemptReport(await delivered())

		expect(report.studentTests.map((test) => test.testId)).toEqual(['B1'])
		expect(report.teacherTests.map((test) => test.testId)).toEqual(['C1', 'Q1'])
		expect(
			report.dimensions.find((entry) => entry.dimension === 'D4')?.evidence,
		).toEqual(['test:B1:pass:AP-H1'])
	})

	it('does not invent a total, percentage or grade', async () => {
		const report = buildAttemptReport(await delivered())
		expect(reportHasAggregateScore(report)).toBe(false)
		expect(report.limits.join(' ')).toContain('no se promedian')
	})

	it('marks missing evidence as no_attempt instead of zero', () => {
		const record = createAttemptRecord({
			attemptId: 'empty',
			caseId: 'cwe-321-andinapay',
			actorPseudonym: 'actor-1',
			versions,
			createdAt: clock(),
		})
		const report = buildAttemptReport(record)
		for (const dimension of report.dimensions) {
			expect(dimension.status).toBe('no_attempt')
			expect(dimension.level).toBeNull()
		}
	})

	it('distinguishes a blocking technical incident from not knowing', async () => {
		const service = new AttemptService(new InMemoryAttemptStore(), clock)
		const created = await service.create({
			attemptId: 'incident',
			caseId: 'cwe-321-andinapay',
			actorPseudonym: 'actor-1',
			versions,
		})
		if (created.status === 'rejected') throw new Error('create failed')
		const outcome = await service.execute('incident', 'actor-1', {
			kind: 'record-incident',
			operationId: 'i1',
			expectedRevision: 0,
			incidentId: 'i1',
			incidentKind: 'timeout',
			detail: 'WebCrypto worker exceeded the budget',
			blocking: true,
		})
		if (outcome.status !== 'applied') throw new Error('incident rejected')

		const report = buildAttemptReport(outcome.record)
		for (const dimension of report.dimensions) {
			expect(dimension.status).toBe('technical_error')
		}
	})

	it('records a disagreement when human judgment contradicts the automatic battery', async () => {
		const record = await delivered()
		const adjudicated = {
			...record,
			adjudication: [
				{
					dimension: 'D3' as const,
					level: '3' as const,
					kind: 'human' as const,
					evidenceRefs: ['revision:1'],
				},
			],
		}
		const withHash = {
			...adjudicated,
			contentHash: computeAttemptContentHash(adjudicated),
		}
		const report = buildAttemptReport(withHash, { B: true, Q: false, C: {} })
		expect(report.disagreements).toHaveLength(1)
		expect(report.disagreements[0]).toMatchObject({
			dimension: 'D3',
			humanLevel: '3',
			automatic: 'Q=false',
		})
	})

	it('classifies aid exposure before and after delivery without erasing it', async () => {
		const record = await delivered()
		const before = withAid(record, '2026-10-27T09:59:00.000Z')
		const after = withAid(record, '2026-10-27T10:01:00.000Z')

		expect(buildAttemptReport(before).aidTimeline[0]?.timing).toBe(
			'before-delivery',
		)
		expect(buildAttemptReport(after).aidTimeline[0]?.timing).toBe(
			'after-delivery',
		)
	})

	it('preserves the original explanation text verbatim', async () => {
		const record = await delivered()
		const report = buildAttemptReport(record)
		expect(report.originalTexts).toEqual([
			{
				promptId: 'D2',
				text: 'Migré la copia operativa y comprobé la lectura; la copia antigua sigue legible.',
				recordedAt: '2026-10-27T10:00:00.000Z',
			},
		])
	})
})
