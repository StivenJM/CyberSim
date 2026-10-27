import {
	type AttemptRecord,
	type CreateAttemptRecordInput,
	computeAttemptContentHash,
	createAttemptRecord,
} from '@cybersim/scenario-contract'

import type { LedgerCommand, LedgerOutcome } from './commands.js'
import { applyCommand } from './ledger.js'
import type { AttemptStore } from './store.js'

export interface CreateAttemptOptions {
	/** Practice attempts never replace or contaminate a measured attempt. */
	readonly practice?: boolean
}

function rejected(
	code: Extract<LedgerOutcome, { status: 'rejected' }>['code'],
	errors: readonly string[],
): LedgerOutcome {
	return { status: 'rejected', code, errors }
}

export class AttemptService {
	constructor(
		private readonly store: AttemptStore,
		private readonly now: () => string = () => new Date().toISOString(),
	) {}

	async create(
		input: CreateAttemptRecordInput,
		options: CreateAttemptOptions = {},
	): Promise<LedgerOutcome> {
		const created = createAttemptRecord({ ...input, createdAt: this.now() })
		const record: AttemptRecord = options.practice
			? {
					...created,
					status: 'practice',
					contentHash: computeAttemptContentHash({
						...created,
						status: 'practice',
					}),
				}
			: created

		const inserted = await this.store.insert(record)
		if (!inserted.ok) {
			return rejected('invalid-state', [
				inserted.detail ?? `attempt "${record.attemptId}" is already stored`,
			])
		}
		return { status: 'applied', record }
	}

	async execute(
		attemptId: string,
		actorPseudonym: string,
		command: LedgerCommand,
	): Promise<LedgerOutcome> {
		const record = await this.store.load(attemptId)
		if (!record) {
			return rejected('not-found', [`attempt "${attemptId}" does not exist`])
		}
		if (record.actor.pseudonym !== actorPseudonym) {
			return rejected('forbidden', [
				'attempt: the requested attempt belongs to another actor',
			])
		}

		const previous = record.operations.find(
			(operation) => operation.operationId === command.operationId,
		)
		if (previous) {
			return { status: 'replayed', record, operation: previous }
		}

		const outcome = applyCommand(record, command, this.now())
		if (outcome.status !== 'applied') return outcome

		const saved = await this.store.save(outcome.record, record.sequence)
		if (!saved.ok) {
			return rejected(
				saved.code === 'revision-conflict'
					? 'revision-conflict'
					: 'persistence-failure',
				[saved.detail ?? 'attempt: persistence did not confirm the command'],
			)
		}

		return outcome
	}
}
