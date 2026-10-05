import React from 'react';
import styles from '../styles/MessageBubble.module.css';
import type { Message } from '../../../../../server/chat';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface MessageBubbleProps {
  message: Message;
}

const Mensaje: React.FC<MessageBubbleProps> = ({ message }) => {
  const { isPlaying, play, currentAudioId } = useAudioPlayer();
  const isThisPlaying = isPlaying && currentAudioId === message.id;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlayAudio = () => {
    if (message.audioContent) {
      play(message.audioContent, message.id);
    }
  };

  return (
    <div className={`${styles.messageBubble} ${styles[message.sender]}`}>
      <div className={styles.messageContent}>
        {message.context && (
          <div className={styles.messageContext}>
            {message.context.imageUrl && (
              <img
                src={message.context.imageUrl}
                alt={message.context.displayText || message.context.contextId}
                className={styles.messageContextImage}
              />
            )}
            <div className={styles.messageContextInfo}>
              <strong>{message.context.contextId}</strong>
            </div>
          </div>
        )}
        <p>{message.text}</p>
        <div className={styles.messageFooter}>
          {message.audioContent && message.sender === 'bot' && (
            <button
              className={`${styles.audioButton} ${isThisPlaying ? styles.audioPlaying : ''}`}
              onClick={handlePlayAudio}
              title={isThisPlaying ? "Pausar audio" : "Reproducir audio"}
              aria-label={isThisPlaying ? "Pausar audio" : "Reproducir audio"}
            >
              {isThisPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 4h4v16H6zm8 0h4v16h-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77" />
                </svg>
              )}
            </button>
          )}
          <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default Mensaje;
