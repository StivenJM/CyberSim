import React from 'react';
import EstrellasIcon from '../../../common/icons/EstrellasIcon';
import ChatContainer from './ChatContainer';
import { useChatContext } from '../context/ChatContext';

const ChatLauncher: React.FC = () => {
  const { isChatOpen, toggleChat } = useChatContext();
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => toggleChat()}
        aria-label={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
        data-chat-toggle="true"
        className={`botonIa ${isChatOpen ? 'IaActivo' : ''}`}
      >
        Chatbot <EstrellasIcon />
      </button>
      <ChatContainer isOpen={isChatOpen} />
    </div>
  );
};

export default ChatLauncher;
