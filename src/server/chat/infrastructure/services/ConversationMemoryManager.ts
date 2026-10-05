import type { ChatMessage } from "./GeminiService.js";

export interface IConversationMemory {
  getHistory(sessionId: string): ChatMessage[];
  addUserMessage(sessionId: string, content: string): void;
  addModelMessage(sessionId: string, content: string): void;
  clearSession(sessionId: string): void;
  hasSession(sessionId: string): boolean;
  getStats(): MemoryStats;
}

export interface MemoryStats {
  activeSessions: number;
  totalMessages: number;
}

interface ConversationEntry {
  messages: ChatMessage[];
  lastAccess: Date;
}

interface MemoryConfig {
  maxMessages: number;
  sessionTimeoutMs: number;
  cleanupIntervalMs: number;
}

export class ConversationMemoryManager implements IConversationMemory {
  private readonly conversations = new Map<string, ConversationEntry>();
  private readonly config: MemoryConfig;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<MemoryConfig>) {
    this.config = {
      maxMessages: (config && config.maxMessages) || parseInt(process.env.CHAT_MEMORY_MAX_MESSAGES || "20", 10),
      sessionTimeoutMs: (config && config.sessionTimeoutMs) || 60 * 60 * 1000,
      cleanupIntervalMs: (config && config.cleanupIntervalMs) || 30 * 60 * 1000,
    };
    this.startCleanupJob();
  }

  getHistory(sessionId: string): ChatMessage[] {
    const entry = this.conversations.get(sessionId);
    if (!entry) return [];

    entry.lastAccess = new Date();
    return [...entry.messages];
  }

  addUserMessage(sessionId: string, content: string): void {
    this.addMessage(sessionId, { role: "user", content });
  }

  addModelMessage(sessionId: string, content: string): void {
    this.addMessage(sessionId, { role: "model", content });
  }

  clearSession(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  hasSession(sessionId: string): boolean {
    return this.conversations.has(sessionId);
  }

  getStats(): MemoryStats {
    let totalMessages = 0;
    for (const entry of this.conversations.values()) {
      totalMessages += entry.messages.length;
    }
    return { activeSessions: this.conversations.size, totalMessages };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private addMessage(sessionId: string, message: ChatMessage): void {
    let entry = this.conversations.get(sessionId);

    if (!entry) {
      entry = { messages: [], lastAccess: new Date() };
      this.conversations.set(sessionId, entry);
    }

    entry.messages.push(message);
    entry.lastAccess = new Date();

    if (entry.messages.length > this.config.maxMessages) {
      entry.messages = entry.messages.slice(-this.config.maxMessages);
    }
  }

  private startCleanupJob(): void {
    this.cleanupInterval = setInterval(() => this.cleanupInactiveSessions(), this.config.cleanupIntervalMs);
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    for (const [sessionId, entry] of this.conversations.entries()) {
      if (now - entry.lastAccess.getTime() > this.config.sessionTimeoutMs) {
        this.conversations.delete(sessionId);
      }
    }
  }
}

let instance: ConversationMemoryManager | null = null;

export function getMemoryManager(): ConversationMemoryManager {
  if (!instance) {
    instance = new ConversationMemoryManager();
  }
  return instance;
}
