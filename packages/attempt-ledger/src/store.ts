import type { AttemptRecord } from '@cybersim/scenario-contract'

export type StoreSaveResult =
	| { readonly ok: true }
	| {
			readonly ok: false
			readonly code: 'revision-conflict' | 'persistence-failure'
			readonly detail?: string
	  }

/**
 * Persistence port.
 *
 * `save` compares the stored command sequence (compare-and-swap) so two
 * concurrent writers cannot both append. `expectedSequence` is always the
 * sequence the caller loaded, never a client-supplied value.
 */
export interface AttemptStore {
	load(attemptId: string): Promise<AttemptRecord | undefined>
	insert(record: AttemptRecord): Promise<StoreSaveResult>
	save(
		record: AttemptRecord,
		expectedSequence: number,
	): Promise<StoreSaveResult>
}

export class InMemoryAttemptStore implements AttemptStore {
	private readonly records = new Map<string, AttemptRecord>()

	async load(attemptId: string): Promise<AttemptRecord | undefined> {
		const record = this.records.get(attemptId)
		return record ? structuredClone(record) : undefined
	}

	async insert(record: AttemptRecord): Promise<StoreSaveResult> {
		if (this.records.has(record.attemptId)) {
			return {
				ok: false,
				code: 'revision-conflict',
				detail: `attempt "${record.attemptId}" already exists`,
			}
		}
		this.records.set(record.attemptId, structuredClone(record))
		return { ok: true }
	}

	async save(
		record: AttemptRecord,
		expectedSequence: number,
	): Promise<StoreSaveResult> {
		const current = this.records.get(record.attemptId)
		if (!current) {
			return {
				ok: false,
				code: 'persistence-failure',
				detail: `attempt "${record.attemptId}" is not persisted`,
			}
		}
		if (current.sequence !== expectedSequence) {
			return {
				ok: false,
				code: 'revision-conflict',
				detail: `stored sequence ${current.sequence}, expected ${expectedSequence}`,
			}
		}
		this.records.set(record.attemptId, structuredClone(record))
		return { ok: true }
	}
}
