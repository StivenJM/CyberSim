export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  context?: GameContext;
}

export interface GameContext {
  objectName: string;
  contextId: string;
  displayText: string;
  ariaLabel?: string;
  imageUrl?: string;
}

export interface N8nWebhookResponse {
  message: string;
  success?: boolean;
}

export interface ChatConfig {
  webhookUrl: string;
  sessionId?: string;
}
