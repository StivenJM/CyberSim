import type {
  IChatRepository,
  ChatMessagePayload,
  ChatResponse,
} from "../../domain/repositories/IChatRepository.js";

export class HttpChatRepository implements IChatRepository {
  constructor(private readonly baseUrl: string) {}

  async sendMessage(payload: ChatMessagePayload): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error communicating with chat API:", error);
      throw new Error(
        "Failed to send message. Please try again."
      );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
