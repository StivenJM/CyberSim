export { Message } from "./domain/models/Message.js";
export { ChatSession } from "./domain/models/ChatSession.js";
export type { MessageSender, GameContext } from "./domain/models/Message.js";

export type {
  IChatRepository,
  ChatMessagePayload,
  ChatResponse,
} from "./domain/repositories/IChatRepository.js";

export type {
  IContextModeManager,
  ContextModeState,
  ContextSelectedCallback,
} from "./domain/repositories/IContextModeManager.js";

export { ChatFacade } from "./application/ChatFacade.js";
export { SendMessageUseCase } from "./application/useCases/SendMessageUseCase.js";
export { SendContextUseCase } from "./application/useCases/SendContextUseCase.js";
export { ToggleContextModeUseCase } from "./application/useCases/ToggleContextModeUseCase.js";

export { HttpChatRepository } from "./infrastructure/repositories/HttpChatRepository.js";
export { NativeChatRepository } from "./infrastructure/repositories/NativeChatRepository.js";
export { ContextModeManager } from "./infrastructure/context-mode/ContextModeManager.js";
