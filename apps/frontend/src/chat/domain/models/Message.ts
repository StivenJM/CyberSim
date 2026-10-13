/**
 * Solo representa un mensaje del chat
 */

export type MessageSender = "user" | "bot";

export interface GameContext {
  objectName: string;
  contextId: string;
  displayText: string;
  ariaLabel?: string;
  imageUrl?: string;
}

export class Message {
  readonly id: string;
  readonly text: string;
  readonly sender: MessageSender;
  readonly timestamp: Date;
  readonly context?: GameContext;
  readonly audioContent?: string; // Base64 audio

  constructor(
    text: string,
    sender: MessageSender,
    context?: GameContext,
    id?: string,
    timestamp?: Date,
    audioContent?: string
  ) {
    this.id = id || `${Date.now()}-${Math.random()}`;
    this.text = text;
    this.sender = sender;
    this.timestamp = timestamp || new Date();
    this.context = context;
    this.audioContent = audioContent;
  }

  static createUserMessage(text: string, context?: GameContext): Message {
    return new Message(text, "user", context);
  }

  static createBotMessage(text: string, audioContent?: string): Message {
    return new Message(text, "bot", undefined, undefined, undefined, audioContent);
  }

  hasContext(): boolean {
    return this.context !== undefined;
  }

  isFromUser(): boolean {
    return this.sender === "user";
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      sender: this.sender,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      audioContent: this.audioContent,
    };
  }
}
