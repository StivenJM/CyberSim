/**
 * Gestiona el estado y la lógica de una sesión de chat
 */

import { Message } from "./Message.js";

export class ChatSession {
  readonly sessionId: string;
  private messages: Message[] = [];
  private isTyping: boolean = false;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addMessage(message: Message): void {
    this.messages.push(message);
  }

  getMessages(): readonly Message[] {
    return [...this.messages];
  }

  /**
   * Obtiene el último mensaje
   */
  getLastMessage(): Message | undefined {
    return this.messages[this.messages.length - 1];
  }

  /**
   * Establece el estado de "escribiendo"
   */
  setTyping(isTyping: boolean): void {
    this.isTyping = isTyping;
  }

  /**
   * Verifica si el bot está escribiendo
   */
  getIsTyping(): boolean {
    return this.isTyping;
  }

  /**
   * Limpia todos los mensajes de la sesión
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * Obtiene el número de mensajes
   */
  getMessageCount(): number {
    return this.messages.length;
  }
}
