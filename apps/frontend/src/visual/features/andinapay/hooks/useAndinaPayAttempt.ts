import {
	type AndinaPayState,
	type ExerciseReport,
	sha256Hex,
} from '@cybersim/exercises'
import { useCallback, useEffect, useRef, useState } from 'react'

import { API_BASE_URL } from '../../../../shared/config/apiConfig'

const VERSIONS = {
	task: 'cybersim-2.0-andinapay',
	form: 'A',
	fixtures: 'andinapay-fixtures-1',
	engine: 'ecs-1',
	verifier: 'andinapay-verifier-1',
	rubric: 'andinapay-rubric-1',
	aids: 'A0-A3',
} as const

const ATTEMPT_STORAGE = 'cybersim:andinapay:attempt'

interface AttemptRecordShape {
	readonly attemptId: string
	readonly revisions: readonly { readonly revision: number }[]
	readonly status: string
}

interface LedgerResponse {
	readonly status: string
	readonly record?: AttemptRecordShape
	readonly code?: string
	readonly errors?: readonly string[]
}

function operationId(): string {
	const cryptoObject = globalThis.crypto
	if (cryptoObject && 'randomUUID' in cryptoObject) {
		return cryptoObject.randomUUID()
	}
	return `op-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function authToken(): string | null {
	return localStorage.getItem('authToken')
}

function revisionOf(record: AttemptRecordShape | undefined): number {
	if (!record) return 0
	return record.revisions.at(-1)?.revision ?? 0
}

async function hashState(state: AndinaPayState): Promise<string> {
	return `sha256:${await sha256Hex(JSON.stringify(state))}`
}

function fixtureFor(checkId: string): string {
	switch (checkId) {
		case 'B2':
			return 'R04'
		case 'Q2':
		case 'Q3':
			return 'K2'
		case 'C2':
			return 'R03'
		case 'C4':
			return 'AP-H3'
		default:
			return 'R01'
	}
}

export interface AndinaPayAttempt {
	readonly ready: boolean
	readonly attemptId: string | null
	readonly error: string | null
	readonly createIfNeeded: () => Promise<void>
	readonly saveDiagnosis: (
		claim: string,
		citedArtifactIds: readonly string[],
	) => Promise<void>
	readonly saveRevision: (state: AndinaPayState) => Promise<void>
	readonly recordTests: (report: ExerciseReport) => Promise<void>
	readonly deliver: (
		state: AndinaPayState,
		report: ExerciseReport,
	) => Promise<void>
	readonly recordExplanation: (text: string) => Promise<void>
}

/**
 * Best-effort adapter to the attempt ledger. The exercise keeps working when
 * the backend is unavailable: the local reducer is the source of truth and the
 * ledger records the evidence that can be persisted.
 */
export function useAndinaPayAttempt(): AndinaPayAttempt {
	const [ready, setReady] = useState(false)
	const [attemptId, setAttemptId] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const revisionRef = useRef(0)
	const attemptRef = useRef<string | null>(null)

	const request = useCallback(
		async (path: string, body?: unknown): Promise<LedgerResponse | null> => {
			const token = authToken()
			if (!token) return null
			try {
				const response = await fetch(`${API_BASE_URL}${path}`, {
					method: body === undefined ? 'GET' : 'POST',
					headers: {
						'content-type': 'application/json',
						authorization: `Bearer ${token}`,
					},
					body: body === undefined ? undefined : JSON.stringify(body),
				})
				const payload = (await response.json()) as LedgerResponse
				if (!response.ok) {
					setError(payload.code ?? `HTTP ${response.status}`)
					return null
				}
				if (payload.record) {
					revisionRef.current = revisionOf(payload.record)
				}
				return payload
			} catch (cause) {
				setError(cause instanceof Error ? cause.message : 'Fallo de red')
				return null
			}
		},
		[],
	)

	const create = useCallback(async () => {
		const stored = localStorage.getItem(ATTEMPT_STORAGE)
		if (stored) {
			const existing = await request(`/attempts/${stored}`)
			if (existing?.record) {
				attemptRef.current = existing.record.attemptId
				setAttemptId(existing.record.attemptId)
				setReady(true)
				return
			}
			localStorage.removeItem(ATTEMPT_STORAGE)
		}

		let created = await request('/attempts', {
			caseId: 'cwe-321-andinapay',
			versions: VERSIONS,
		})
		if (!created?.record) {
			// El backend puede estar terminando de arrancar; un segundo intento
			// evita degradar el caso a modo local por una carrera de arranque.
			await new Promise((resolve) => setTimeout(resolve, 700))
			created = await request('/attempts', {
				caseId: 'cwe-321-andinapay',
				versions: VERSIONS,
			})
		}
		if (created?.record) {
			localStorage.setItem(ATTEMPT_STORAGE, created.record.attemptId)
			attemptRef.current = created.record.attemptId
			setAttemptId(created.record.attemptId)
			setError(null)
		}
		setReady(true)
	}, [request])

	const command = useCallback(
		async (body: Record<string, unknown>): Promise<boolean> => {
			const id = attemptRef.current
			if (!id) return false
			const result = await request(`/attempts/${id}/commands`, {
				...body,
				operationId: operationId(),
				expectedRevision: revisionRef.current,
			})
			return result !== null
		},
		[request],
	)

	const saveDiagnosis = useCallback(
		async (claim: string, citedArtifactIds: readonly string[]) => {
			await command({
				kind: 'save-diagnosis',
				frontierId: 'AP-F1',
				citedArtifactIds,
				claim,
			})
		},
		[command],
	)

	const saveRevision = useCallback(
		async (state: AndinaPayState) => {
			await command({
				kind: 'save-revision',
				diffHash: await hashState(state),
			})
		},
		[command],
	)

	const recordTests = useCallback(
		async (report: ExerciseReport) => {
			for (const check of report.checks) {
				await command({
					kind: 'run-test',
					testId: check.id,
					fixtureId: fixtureFor(check.id),
					outcome: check.passed ? 'pass' : 'fail',
				})
			}
		},
		[command],
	)

	const deliver = useCallback(
		async (state: AndinaPayState, report: ExerciseReport) => {
			await recordTests(report)
			await command({
				kind: 'deliver',
				evidenceHash: await hashState(state),
				teacherBattery: { batteryId: 'server-battery-pending', tests: [] },
			})
		},
		[command, recordTests],
	)

	const recordExplanation = useCallback(
		async (text: string) => {
			await command({
				kind: 'record-explanation',
				promptId: 'andinapay-report',
				text,
			})
		},
		[command],
	)

	useEffect(() => {
		void create()
	}, [create])

	return {
		ready,
		attemptId,
		error,
		createIfNeeded: create,
		saveDiagnosis,
		saveRevision,
		recordTests,
		deliver,
		recordExplanation,
	}
}
