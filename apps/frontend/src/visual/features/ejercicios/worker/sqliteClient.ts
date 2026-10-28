import type {
	AdapterVerification,
	BibliotecaVivaConfig,
	ExerciseReport,
} from '@cybersim/exercises'

const TIMEOUT_MS = 4000

interface WorkerReply {
	readonly id: number
	readonly kind: 'ok' | 'error'
	readonly report?: ExerciseReport
	readonly message?: string
}

let worker: Worker | null = null
let sequence = 0
const pending = new Map<number, (value: AdapterVerification) => void>()

function settle(id: number, value: AdapterVerification) {
	const resolve = pending.get(id)
	if (!resolve) return
	pending.delete(id)
	resolve(value)
}

function ensureWorker(): Worker {
	if (worker) return worker
	const created = new Worker(new URL('./bv.worker.ts', import.meta.url), {
		type: 'module',
	})
	created.onmessage = (event: MessageEvent<WorkerReply>) => {
		const reply = event.data
		settle(
			reply.id,
			reply.kind === 'ok' && reply.report
				? { kind: 'ok', report: reply.report }
				: {
						kind: 'unavailable',
						reason: reply.message ?? 'El banco SQL no devolvió un informe.',
					},
		)
	}
	created.onerror = () => {
		for (const id of pending.keys()) {
			settle(id, {
				kind: 'unavailable',
				reason: 'El Worker SQL falló al cargar el motor.',
			})
		}
		created.terminate()
		worker = null
	}
	worker = created
	return created
}

/**
 * Verifies BibliotecaViva inside an isolated module Worker.
 *
 * The budget is enforced on the main thread; on timeout the Worker is
 * terminated and its result discarded, so a hung bench is a technical incident
 * rather than a domain verdict.
 */
export function verifyBibliotecaVivaInWorker(
	config: BibliotecaVivaConfig,
): Promise<AdapterVerification> {
	const instance = ensureWorker()
	const id = ++sequence
	return new Promise<AdapterVerification>((resolve) => {
		const timer = setTimeout(() => {
			pending.delete(id)
			instance.terminate()
			worker = null
			resolve({
				kind: 'unavailable',
				reason:
					'El banco SQL superó el presupuesto de 4 s; el Worker se cerró y el resultado se descartó.',
			})
		}, TIMEOUT_MS)
		pending.set(id, (value) => {
			clearTimeout(timer)
			resolve(value)
		})
		instance.postMessage({ id, config })
	})
}
