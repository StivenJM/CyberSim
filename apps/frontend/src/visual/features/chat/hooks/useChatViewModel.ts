import { useState, useCallback, useEffect, useMemo } from "react";

import { useChatContext } from "../context/ChatContext";
import {
  ChatFacade,
  type IChatRepository,
  type IContextModeManager,
  type Message,
  type GameContext,
} from "../../../../chat";

export interface ChatViewModel {
  messages: readonly Message[];
  isTyping: boolean;
  isContextMode: boolean;

  sendMessage: (text: string) => Promise<void>;
  toggleContextMode: () => void;
  clearMessages: () => void;
}

export const useChatViewModel = (
  repository: IChatRepository,
  contextManager: IContextModeManager
): ChatViewModel => {
  const { openChat, closeChat, setContextModeActive } = useChatContext();

  const chatFacade = useMemo(() => {
    return new ChatFacade(repository, contextManager);
  }, [repository, contextManager]);

  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isContextMode, setIsContextMode] = useState(false);

  const syncState = useCallback(() => {
    setMessages(chatFacade.getMessages());
    setIsTyping(chatFacade.isTyping());
    setIsContextMode(chatFacade.isContextModeActive());
  }, [chatFacade]);

  const handleContextSelected = useCallback(
    async (context: GameContext) => {
      try {
        openChat();
        await chatFacade.sendContext(context);
      } catch (error) {
        console.error("Error al enviar contexto:", error);
        syncState();
      }
    },
    [chatFacade, syncState, openChat]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      try {
        await chatFacade.sendMessage(text);
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        syncState();
      }
    },
    [chatFacade, syncState]
  );

  const toggleContextMode = useCallback(() => {
    const wasActive = chatFacade.isContextModeActive();

    chatFacade.toggleContextMode(handleContextSelected);

    const isNowActive = chatFacade.isContextModeActive();
    setIsContextMode(isNowActive);
    setContextModeActive(isNowActive);

    if (!wasActive && isNowActive) {
      closeChat();
    }
  }, [chatFacade, handleContextSelected, closeChat, setContextModeActive]);

  const clearMessages = useCallback(() => {
    chatFacade.clearMessages();
    syncState();
  }, [chatFacade, syncState]);

  useEffect(() => {
    syncState();

    const unsubscribe = chatFacade.subscribe(() => {
      syncState();
    });

    return unsubscribe;
  }, [syncState, chatFacade]);

  return {
    messages,
    isTyping,
    isContextMode,
    sendMessage,
    toggleContextMode,
    clearMessages,
  };
};
