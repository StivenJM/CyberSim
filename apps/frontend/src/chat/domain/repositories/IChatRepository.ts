import type { GameContext } from "../models/Message.js";

export interface ChatMessagePayload {
  message: string;
  sessionId: string;
  timestamp: string;
  context?: GameContext | null;
}

export interface ChatResponse {
  message: string;
  success?: boolean;
  audio?: string; // Base64 audio desde n8n
}

/**
 * Permite cambiar la implementación (n8n, OpenAI, etc.) sin afectar la lógica de negocio
 */
export interface IChatRepository {
  sendMessage(payload: ChatMessagePayload): Promise<ChatResponse>;
  checkHealth?(): Promise<boolean>;
}
