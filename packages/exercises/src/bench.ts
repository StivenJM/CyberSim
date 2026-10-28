import type { AttemptIncident } from '@cybersim/scenario-contract'

export const BENCH_DEFAULT_TIMEOUT_MS = 2000

export type BenchFailureCode = 'BENCH_TIMEOUT' | 'BENCH_CRASH'

export type BenchOutcome<T> =
	| { readonly status: 'ok'; readonly value: T; readonly elapsedMs: number }
	| {
			readonly status: 'technical_error'
			readonly code: BenchFailureCode
			readonly detail: string
			readonly elapsedMs: number
	  }

class BenchTimeout extends Error {}

export interface BenchOptions {
	readonly timeoutMs?: number
	readonly now?: () => number
}

/**
 * Runs one test-bench operation under a fixed budget.
 *
 * A timeout or a crash is a technical incident, never a domain rejection: it
 * must not be presented as "the attack was blocked" nor scored as knowledge.
 * The work is not cancelled, but its result is discarded once the budget ends.
 */
export async function runInBench<T>(
	work: () => Promise<T>,
	options: BenchOptions = {},
): Promise<BenchOutcome<T>> {
	const timeoutMs = options.timeoutMs ?? BENCH_DEFAULT_TIMEOUT_MS
	const now = options.now ?? (() => Date.now())
	const started = now()
	let timer: ReturnType<typeof setTimeout> | undefined

	try {
		const value = await Promise.race([
			work(),
			new Promise<never>((_resolve, rejectTimeout) => {
				timer = setTimeout(() => rejectTimeout(new BenchTimeout()), timeoutMs)
			}),
		])
		return { status: 'ok', value, elapsedMs: now() - started }
	} catch (error) {
		const elapsedMs = now() - started
		if (error instanceof BenchTimeout) {
			return {
				status: 'technical_error',
				code: 'BENCH_TIMEOUT',
				detail: `El banco superó el presupuesto de ${timeoutMs} ms.`,
				elapsedMs,
			}
		}
		return {
			status: 'technical_error',
			code: 'BENCH_CRASH',
			detail: error instanceof Error ? error.message : String(error),
			elapsedMs,
		}
	} finally {
		if (timer !== undefined) clearTimeout(timer)
	}
}

export function benchIncident(
	outcome: Extract<BenchOutcome<unknown>, { status: 'technical_error' }>,
	incidentId: string,
	occurredAt: string,
): AttemptIncident {
	return {
		incidentId,
		kind: outcome.code === 'BENCH_TIMEOUT' ? 'timeout' : 'crash',
		detail: outcome.detail,
		occurredAt,
	}
}
