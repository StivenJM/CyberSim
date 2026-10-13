import React from 'react';
import ChatContainer from './ChatContainer';
import { useChatContext } from '../context/ChatContext';
import styles from '../styles/FloatingChat.module.css';


const FloatingChat: React.FC = () => {
  const { isChatOpen } = useChatContext();

  return (
    <div className={`${styles.floatingChatWrapper} ${!isChatOpen ? styles.hidden : ''}`}>
      <ChatContainer isOpen={isChatOpen} />
    </div>
  );
};

export default FloatingChat;
