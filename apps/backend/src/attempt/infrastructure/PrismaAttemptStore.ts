import type { AttemptStore, StoreSaveResult } from '@cybersim/attempt-ledger'
import {
	type AttemptRecord,
	validateAttemptRecord,
} from '@cybersim/scenario-contract'

import { prisma } from '../../auth/infrastructure/db/prisma.js'
import { ServiceError } from '../../integrations/config.js'

function rowOf(record: AttemptRecord) {
	return {
		id_intento: record.attemptId,
		actor_pseudonym: record.actor.pseudonym,
		case_id: record.caseId,
		schema_version: record.schemaVersion,
		sequence: record.sequence,
		status: record.status,
		content_hash: record.contentHash,
		record: JSON.parse(JSON.stringify(record)) as object,
	}
}

function isUniqueViolation(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		(error as { code?: unknown }).code === 'P2002'
	)
}

function detailOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

/**
 * Durable store for attempt evidence.
 *
 * The whole signed record lives in `record`; `sequence` is the compare-and-swap
 * token so two concurrent writers cannot both append. The table is additive and
 * does not touch the legacy `progreso` rows.
 */
export class PrismaAttemptStore implements AttemptStore {
	async load(attemptId: string): Promise<AttemptRecord | undefined> {
		const row = await prisma.intento_evidencia.findUnique({
			where: { id_intento: attemptId },
		})
		if (!row) return undefined
		const record = row.record as unknown as AttemptRecord
		const validation = validateAttemptRecord(record)
		if (!validation.ok) {
			throw new ServiceError(
				'ATTEMPT_CORRUPT',
				500,
				validation.errors.join('; '),
			)
		}
		return record
	}

	async insert(record: AttemptRecord): Promise<StoreSaveResult> {
		try {
			await prisma.intento_evidencia.create({ data: rowOf(record) })
			return { ok: true }
		} catch (error) {
			if (isUniqueViolation(error)) {
				return {
					ok: false,
					code: 'revision-conflict',
					detail: `attempt "${record.attemptId}" already exists`,
				}
			}
			return { ok: false, code: 'persistence-failure', detail: detailOf(error) }
		}
	}

	async save(
		record: AttemptRecord,
		expectedSequence: number,
	): Promise<StoreSaveResult> {
		try {
			const updated = await prisma.intento_evidencia.updateMany({
				where: { id_intento: record.attemptId, sequence: expectedSequence },
				data: {
					sequence: record.sequence,
					status: record.status,
					content_hash: record.contentHash,
					record: JSON.parse(JSON.stringify(record)) as object,
				},
			})
			if (updated.count === 1) return { ok: true }

			const current = await prisma.intento_evidencia.findUnique({
				where: { id_intento: record.attemptId },
				select: { sequence: true },
			})
			return current
				? {
						ok: false,
						code: 'revision-conflict',
						detail: `stored sequence ${current.sequence}, expected ${expectedSequence}`,
					}
				: {
						ok: false,
						code: 'persistence-failure',
						detail: `attempt "${record.attemptId}" is not persisted`,
					}
		} catch (error) {
			return { ok: false, code: 'persistence-failure', detail: detailOf(error) }
		}
	}
}
