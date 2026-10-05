/**
 * Orquestar el envío de un mensaje de texto normal
 */
import type { IChatRepository } from "../../domain/repositories/IChatRepository.js";
import { Message } from "../../domain/models/Message.js";
import { ChatSession } from "../../domain/models/ChatSession.js";

export class SendMessageUseCase {
  constructor(private readonly chatRepository: IChatRepository) { }

  async execute(
    messageText: string,
    session: ChatSession,
    onStateChange?: () => void
  ): Promise<Message> {
    if (!messageText.trim()) {
      throw new Error("El mensaje no puede estar vacío");
    }

    const userMessage = Message.createUserMessage(messageText);
    session.addMessage(userMessage);

    onStateChange?.(); // Notificar cambio inmediatamente (mensaje del usuario agregado)
    session.setTyping(true); // Enviar a la API
    onStateChange?.(); // notificar cambio (para el estado de typing)

    try {
      const response = await this.chatRepository.sendMessage({
        message: messageText,
        sessionId: session.sessionId,
        timestamp: new Date().toISOString(),
      });

      const botMessage = Message.createBotMessage(response.message, response.audio);
      session.addMessage(botMessage);

      return botMessage;
    } catch (error) {
      const errorMessage = Message.createBotMessage(
        "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo."
      );
      session.addMessage(errorMessage);
      throw error;
    } finally {
      session.setTyping(false);

      onStateChange?.(); // notificar cambio final (quitar typing y agregar mensaje del bot)
    }
  }
}
