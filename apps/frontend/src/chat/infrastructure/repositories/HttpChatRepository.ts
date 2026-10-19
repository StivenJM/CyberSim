import { authorizedFetch, errorMessage } from '../../../shared/http.js'
import type {
	ChatMessagePayload,
	ChatResponse,
	IChatRepository,
} from '../../domain/repositories/IChatRepository.js'
export class HttpChatRepository implements IChatRepository {
	private session: { sessionId: string; memoryEpoch: string } | null = null
	private ownerToken: string | null = null
	constructor(private readonly baseUrl: string) {}
	private url(route: string) {
		return `${this.baseUrl.replace(/\/api\/?$/, '')}/api/chat${route}`
	}
	async sendMessage(payload: ChatMessagePayload): Promise<ChatResponse> {
		const token = localStorage.getItem('authToken')
		if (token !== this.ownerToken) {
			this.session = null
			this.ownerToken = token
		}
		if (!this.session) {
			const created = await authorizedFetch(this.url('/session'), {
				method: 'POST',
			})
			const data = await created.json()
			if (!created.ok) throw new Error(errorMessage(data))
			this.session = data
		}
		const response = await authorizedFetch(this.url(''), {
			method: 'POST',
			body: JSON.stringify({
				...payload,
				...this.session,
				requestId: crypto.randomUUID(),
			}),
			signal: AbortSignal.timeout(121000),
		})
		const data = await response.json()
		if (!response.ok) {
			if (data.error?.code === 'CONTEXT_LOST') this.session = null
			throw new Error(errorMessage(data))
		}
		if (data.warnings?.includes('AUDIO_UNAVAILABLE'))
			data.message += '\n\nAudio no disponible.'
		return data
	}
	async checkHealth(): Promise<boolean> {
		try {
			const r = await fetch(
				`${this.baseUrl.replace(/\/api\/?$/, '')}/api/health/ready`,
			)
			return r.ok && (await r.json()).state === 'listo'
		} catch {
			return false
		}
	}
}
