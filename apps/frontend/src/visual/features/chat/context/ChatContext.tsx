import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  isContextModeActive: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setContextModeActive: (active: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isContextModeActive, setIsContextModeActive] = useState(false);

  const toggleChat = () => setIsChatOpen((prev) => !prev);
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const setContextModeActive = (active: boolean) => setIsContextModeActive(active);

  return (
    <ChatContext.Provider value={{
      isChatOpen,
      isContextModeActive,
      toggleChat,
      openChat,
      closeChat,
      setContextModeActive
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
