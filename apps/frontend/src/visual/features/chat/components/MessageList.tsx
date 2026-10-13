import React, { useEffect, useRef } from 'react';
import type { Message } from '../../../../chat';
import TypingIndicator from './TypingIndicator';
import styles from '../styles/MessageList.module.css';
import Mensaje from './Mensaje';

interface MessageListProps {
  messages: readonly Message[];
  isTyping: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className={styles.messageList}>
      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <p>¡Hola! Envía un mensaje para comenzar.</p>
        </div>
      ) : (
        messages.map((message) => (
          <Mensaje key={message.id} message={message} />
        ))
      )}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
