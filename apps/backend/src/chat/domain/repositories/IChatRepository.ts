import type { GameContext } from '../models/Message.js'

export interface ChatMessagePayload {
	message: string
	sessionId: string
	timestamp: string
	context?: GameContext | null
}

export interface ChatResponse {
	message: string
	success?: boolean
	audio?: string
}

export interface IChatRepository {
	sendMessage(payload: ChatMessagePayload): Promise<ChatResponse>
	checkHealth?(): Promise<boolean>
}
