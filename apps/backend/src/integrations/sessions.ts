import { randomUUID } from 'node:crypto'
import { ServiceError } from './config.js'
export interface Session {
	id: string
	owner: number
	touched: number
	messages: { role: 'user' | 'assistant'; content: string }[]
	busy: boolean
}
export class Sessions {
	readonly epoch = randomUUID()
	private sessions = new Map<string, Session>()
	constructor(private readonly now = () => Date.now()) {}
	create(owner: number) {
		this.clean()
		const own = [...this.sessions.values()].filter((s) => s.owner === owner)
		if (own.length >= 3) {
			const oldest = own
				.filter((s) => !s.busy)
				.sort((a, b) => a.touched - b.touched)[0]
			if (!oldest) throw new ServiceError('SESSION_CAPACITY', 429)
			this.sessions.delete(oldest.id)
		}
		if (this.sessions.size >= 50) {
			const oldest = [...this.sessions.values()]
				.filter((s) => !s.busy)
				.sort((a, b) => a.touched - b.touched)[0]
			if (!oldest) throw new ServiceError('SESSION_CAPACITY', 429)
			this.sessions.delete(oldest.id)
		}
		const s: Session = {
			id: randomUUID(),
			owner,
			touched: this.now(),
			messages: [],
			busy: false,
		}
		this.sessions.set(s.id, s)
		return { sessionId: s.id, memoryEpoch: this.epoch }
	}
	get(id: string, epoch: string, owner: number): Session {
		this.clean()
		const session = this.sessions.get(id)
		if (epoch !== this.epoch || !session)
			throw new ServiceError(
				'CONTEXT_LOST',
				409,
				'Se perdió el contexto. Se creó una conversación nueva; vuelve a enviar tu mensaje.',
			)
		if (session.owner !== owner)
			throw new ServiceError('SESSION_NOT_FOUND', 404)
		session.touched = this.now()
		return session
	}
	remove(id: string, owner: number) {
		const s = this.sessions.get(id)
		if (!s || s.owner !== owner)
			throw new ServiceError('SESSION_NOT_FOUND', 404)
		if (s.busy) throw new ServiceError('SESSION_BUSY', 409)
		this.sessions.delete(id)
	}
	clean() {
		for (const [id, s] of this.sessions)
			if (!s.busy && this.now() - s.touched >= 3600000) this.sessions.delete(id)
	}
}
export const sessions = new Sessions()
const timer = setInterval(() => sessions.clean(), 300000)
timer.unref()
