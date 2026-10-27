import type {
	AdjudicationKind,
	AidLevel,
	AppliedOperation,
	AttemptRecord,
	AttemptTest,
	EvidenceOutcome,
	IncidentKind,
	RubricDimension,
	RubricLevel,
} from '@cybersim/scenario-contract'

export interface CommandBase {
	/** Idempotency key. Replaying the same value returns the stored receipt. */
	readonly operationId: string
	/** Evidence revision the client acted on. A stale value is a conflict. */
	readonly expectedRevision: number
}

export interface SaveDiagnosisCommand extends CommandBase {
	readonly kind: 'save-diagnosis'
	readonly frontierId: string
	readonly citedArtifactIds: readonly string[]
	readonly claim: string
}

export interface SaveRevisionCommand extends CommandBase {
	readonly kind: 'save-revision'
	readonly diffHash: string
}

export interface RunTestCommand extends CommandBase {
	readonly kind: 'run-test'
	readonly testId: string
	readonly fixtureId: string
	readonly outcome: EvidenceOutcome
}

export interface RevealAidCommand extends CommandBase {
	readonly kind: 'reveal-aid'
	readonly segmentId: string
	readonly level: AidLevel
}

export interface DeliverCommand extends CommandBase {
	readonly kind: 'deliver'
	readonly evidenceHash: string
	readonly teacherBattery: {
		readonly batteryId: string
		readonly tests: readonly AttemptTest[]
	}
}

export interface RecordExplanationCommand extends CommandBase {
	readonly kind: 'record-explanation'
	readonly promptId: string
	readonly text: string
}

export interface AdjudicateCommand extends CommandBase {
	readonly kind: 'adjudicate'
	readonly dimension: RubricDimension
	readonly level: RubricLevel
	readonly adjudicationKind: AdjudicationKind
	readonly evidenceRefs: readonly string[]
	readonly note?: string
}

export interface RecordIncidentCommand extends CommandBase {
	readonly kind: 'record-incident'
	readonly incidentId: string
	readonly incidentKind: IncidentKind
	readonly detail: string
	readonly blocking?: boolean
}

export interface PauseCommand extends CommandBase {
	readonly kind: 'pause'
}

export interface ResumeCommand extends CommandBase {
	readonly kind: 'resume'
}

export interface ResetCommand extends CommandBase {
	readonly kind: 'reset'
	readonly diffHash: string
}

export type LedgerCommand =
	| SaveDiagnosisCommand
	| SaveRevisionCommand
	| RunTestCommand
	| RevealAidCommand
	| DeliverCommand
	| RecordExplanationCommand
	| AdjudicateCommand
	| RecordIncidentCommand
	| PauseCommand
	| ResumeCommand
	| ResetCommand

export const LEDGER_REJECTION_CODES = [
	'revision-conflict',
	'invalid-state',
	'forbidden',
	'not-found',
	'persistence-failure',
	'unknown-case',
] as const

export type LedgerRejectionCode = (typeof LEDGER_REJECTION_CODES)[number]

export interface AidExposure {
	readonly segmentId: string
	readonly level: AidLevel
	readonly revealedAt: string
}

export type LedgerOutcome =
	| {
			readonly status: 'applied'
			readonly record: AttemptRecord
			readonly operation?: AppliedOperation
			readonly exposure?: AidExposure
	  }
	| {
			readonly status: 'replayed'
			readonly record: AttemptRecord
			readonly operation?: AppliedOperation
	  }
	| {
			readonly status: 'rejected'
			readonly code: LedgerRejectionCode
			readonly errors: readonly string[]
	  }
