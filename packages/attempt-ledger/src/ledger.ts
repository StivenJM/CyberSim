import {
	AID_LEVELS,
	type AidLevel,
	type AppliedOperation,
	type AttemptRecord,
	type AttemptTest,
	computeAttemptContentHash,
	getInvestigatedCase,
	validateAttemptRecord,
} from '@cybersim/scenario-contract'

import type { LedgerCommand, LedgerOutcome } from './commands.js'

const aidLevelSet = new Set<string>(AID_LEVELS)

export function currentRevision(record: AttemptRecord): number {
	const last = record.revisions.at(-1)
	return last ? last.revision : 0
}

export function studentTests(record: AttemptRecord): readonly AttemptTest[] {
	return record.tests.filter((test) => test.source === 'student')
}

export function teacherTests(record: AttemptRecord): readonly AttemptTest[] {
	return record.tests.filter((test) => test.source === 'teacher')
}

function reject(
	code: Extract<LedgerOutcome, { status: 'rejected' }>['code'],
	errors: readonly string[],
): LedgerOutcome {
	return { status: 'rejected', code, errors }
}

function commit(
	record: AttemptRecord,
	command: LedgerCommand,
	now: string,
	patch: Partial<AttemptRecord>,
	revisionAfter = currentRevision(record),
): LedgerOutcome {
	const sequence = record.operations.length + 1
	const operation: AppliedOperation = {
		operationId: command.operationId,
		sequence,
		kind: command.kind,
		expectedRevision: command.expectedRevision,
		revisionAfter,
		payloadHash: computeAttemptContentHash(command),
		appliedAt: now,
	}
	const draft = {
		...record,
		...patch,
		sequence,
		operations: [...record.operations, operation],
	}
	const next: AttemptRecord = {
		...draft,
		contentHash: computeAttemptContentHash(draft),
	}

	const validation = validateAttemptRecord(next)
	if (!validation.ok) {
		return reject('invalid-state', validation.errors)
	}

	return { status: 'applied', record: next, operation }
}

function isMutable(record: AttemptRecord): boolean {
	return record.delivery === undefined && record.status !== 'delivered'
}

/**
 * Applies one command to an attempt without touching persistence.
 *
 * The caller owns idempotency (operationId) and concurrency (expectedRevision).
 * This function only enforces the aggregate's own state rules.
 */
export function applyCommand(
	record: AttemptRecord,
	command: LedgerCommand,
	now: string,
): LedgerOutcome {
	switch (command.kind) {
		case 'save-diagnosis': {
			if (!isMutable(record) || record.status === 'practice') {
				return reject('invalid-state', [
					'command save-diagnosis: attempt is not in an active measured state',
				])
			}
			if (command.expectedRevision !== currentRevision(record)) {
				return reject('revision-conflict', [
					`command save-diagnosis: expected revision ${command.expectedRevision}, stored revision ${currentRevision(record)}`,
				])
			}
			if (record.diagnosis !== undefined) {
				return reject('invalid-state', [
					'command save-diagnosis: the diagnosis is already sealed',
				])
			}
			return commit(record, command, now, {
				diagnosis: {
					frontierId: command.frontierId,
					citedArtifactIds: [...command.citedArtifactIds],
					claim: command.claim,
					sealedAt: now,
					sealedBeforeMenu: true,
				},
			})
		}

		case 'save-revision':
		case 'reset': {
			if (!isMutable(record) || record.status === 'practice') {
				return reject('invalid-state', [
					`command ${command.kind}: attempt is not in an active measured state`,
				])
			}
			if (command.expectedRevision !== currentRevision(record)) {
				return reject('revision-conflict', [
					`command ${command.kind}: expected revision ${command.expectedRevision}, stored revision ${currentRevision(record)}`,
				])
			}
			const revision = currentRevision(record) + 1
			return commit(
				record,
				command,
				now,
				{
					revisions: [
						...record.revisions,
						{ revision, savedAt: now, diffHash: command.diffHash },
					],
				},
				revision,
			)
		}

		case 'run-test': {
			if (!isMutable(record)) {
				return reject('invalid-state', [
					'command run-test: the attempt is delivered and frozen',
				])
			}
			if (record.status === 'practice') {
				return reject('invalid-state', [
					'command run-test: practice attempts keep no measured evidence',
				])
			}
			if (command.expectedRevision !== currentRevision(record)) {
				return reject('revision-conflict', [
					`command run-test: expected revision ${command.expectedRevision}, stored revision ${currentRevision(record)}`,
				])
			}
			if (
				record.tests.some(
					(test) => test.testId === command.testId && test.source === 'student',
				)
			) {
				return reject('invalid-state', [
					`command run-test: duplicate testId "${command.testId}"`,
				])
			}
			const definition = getInvestigatedCase(record.caseId)
			if (!definition) {
				return reject('unknown-case', [
					`command run-test: unsupported investigated case "${record.caseId}"`,
				])
			}
			if (!definition.verifiers.includes(command.testId)) {
				return reject('invalid-state', [
					`command run-test: verifier "${command.testId}" is not defined for this case`,
				])
			}
			if (!definition.fixtures.includes(command.fixtureId)) {
				return reject('invalid-state', [
					`command run-test: fixture "${command.fixtureId}" is not defined for this case`,
				])
			}
			return commit(record, command, now, {
				tests: [
					...record.tests,
					{
						testId: command.testId,
						source: 'student',
						outcome: command.outcome,
						fixtureId: command.fixtureId,
						expectedRevision: command.expectedRevision,
					},
				],
			})
		}

		case 'reveal-aid': {
			if (!isMutable(record)) {
				return reject('invalid-state', [
					'command reveal-aid: the attempt is delivered and frozen',
				])
			}
			if (command.expectedRevision !== currentRevision(record)) {
				return reject('revision-conflict', [
					`command reveal-aid: expected revision ${command.expectedRevision}, stored revision ${currentRevision(record)}`,
				])
			}
			const definition = getInvestigatedCase(record.caseId)
			if (!definition) {
				return reject('unknown-case', [
					`command reveal-aid: unsupported investigated case "${record.caseId}"`,
				])
			}
			if (!definition.aidSegments.includes(command.segmentId)) {
				return reject('invalid-state', [
					`command reveal-aid: segment "${command.segmentId}" is not defined for this case`,
				])
			}
			if (!aidLevelSet.has(command.level)) {
				return reject('invalid-state', [
					`command reveal-aid: unsupported aid level "${command.level}"`,
				])
			}
			if (record.aids.some((aid) => aid.segmentId === command.segmentId)) {
				return reject('invalid-state', [
					`command reveal-aid: segment "${command.segmentId}" is already exposed`,
				])
			}
			const outcome = commit(record, command, now, {
				aids: [
					...record.aids,
					{
						segmentId: command.segmentId,
						level: command.level,
						revealedAt: now,
					},
				],
			})
			if (outcome.status !== 'applied') return outcome
			return {
				...outcome,
				exposure: {
					segmentId: command.segmentId,
					level: command.level as AidLevel,
					revealedAt: now,
				},
			}
		}

		case 'deliver': {
			if (!isMutable(record)) {
				return reject('invalid-state', [
					'command deliver: the attempt is already delivered',
				])
			}
			if (record.status === 'practice') {
				return reject('invalid-state', [
					'command deliver: practice attempts are not measured deliveries',
				])
			}
			if (record.diagnosis === undefined) {
				return reject('invalid-state', [
					'command deliver: the sealed diagnosis is required before delivery',
				])
			}
			if (currentRevision(record) === 0) {
				return reject('invalid-state', [
					'command deliver: at least one saved revision is required',
				])
			}
			if (command.expectedRevision !== currentRevision(record)) {
				return reject('revision-conflict', [
					`command deliver: expected revision ${command.expectedRevision}, stored revision ${currentRevision(record)}`,
				])
			}

			const teacher: AttemptTest[] = command.teacherBattery.tests.map(
				(test) => ({
					...test,
					source: 'teacher',
					expectedRevision: command.expectedRevision,
				}),
			)
			const outcome = commit(
				record,
				command,
				now,
				{
					status: 'delivered',
					tests: [...record.tests, ...teacher],
					delivery: {
						deliveredAt: now,
						revision: currentRevision(record),
						evidenceHash: command.evidenceHash,
						teacherBatteryId: command.teacherBattery.batteryId,
					},
				},
				currentRevision(record),
			)
			return outcome
		}

		case 'record-explanation': {
			if (record.delivery === undefined) {
				return reject('invalid-state', [
					'command record-explanation: explanations belong to a delivered attempt',
				])
			}
			return commit(record, command, now, {
				explanations: [
					...record.explanations,
					{ promptId: command.promptId, recordedAt: now, text: command.text },
				],
			})
		}

		case 'adjudicate': {
			if (record.delivery === undefined) {
				return reject('invalid-state', [
					'command adjudicate: human adjudication belongs to a delivered attempt',
				])
			}
			return commit(record, command, now, {
				adjudication: [
					...record.adjudication,
					{
						dimension: command.dimension,
						level: command.level,
						kind: command.adjudicationKind,
						evidenceRefs: [...command.evidenceRefs],
						note: command.note,
					},
				],
			})
		}

		case 'record-incident': {
			if (
				record.incidents.some(
					(incident) => incident.incidentId === command.incidentId,
				)
			) {
				return reject('invalid-state', [
					`command record-incident: duplicate incidentId "${command.incidentId}"`,
				])
			}
			return commit(record, command, now, {
				status: command.blocking ? 'technical-incident' : record.status,
				incidents: [
					...record.incidents,
					{
						incidentId: command.incidentId,
						kind: command.incidentKind,
						detail: command.detail,
						occurredAt: now,
					},
				],
			})
		}

		case 'pause': {
			if (record.status !== 'in-progress') {
				return reject('invalid-state', [
					`command pause: attempt status "${record.status}" cannot be paused`,
				])
			}
			return commit(record, command, now, { status: 'paused' })
		}

		case 'resume': {
			if (record.status !== 'paused') {
				return reject('invalid-state', [
					`command resume: attempt status "${record.status}" cannot be resumed`,
				])
			}
			return commit(record, command, now, { status: 'in-progress' })
		}
	}
}
