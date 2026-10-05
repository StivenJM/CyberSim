import type { IChatRepository } from "../../domain/repositories/IChatRepository.js";
import { Message, type GameContext } from "../../domain/models/Message.js";
import { ChatSession } from "../../domain/models/ChatSession.js";

export class SendContextUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(
    context: GameContext,
    session: ChatSession,
    onStateChange?: () => void
  ): Promise<Message> {
    const userMessage = Message.createUserMessage("", context);
    session.addMessage(userMessage);

    /* 
    Hace lo mismo que sendMessageUseCase. 
    Revisar allí, es muy similar
    */
    onStateChange?.();
    session.setTyping(true);
    onStateChange?.();

    try {
      const response = await this.chatRepository.sendMessage({
        message: "",
        sessionId: session.sessionId,
        timestamp: new Date().toISOString(),
        context,
      });

      const botMessage = Message.createBotMessage(response.message, response.audio);
      session.addMessage(botMessage);

      return botMessage;
    } catch (error) {
      const errorMessage = Message.createBotMessage(
        "Lo siento, hubo un error al procesar la selección. Por favor, intenta de nuevo."
      );
      session.addMessage(errorMessage);
      throw error;
    } finally {
      session.setTyping(false);

      onStateChange?.();
    }
  }
}
