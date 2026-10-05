import type { IChatRepository, ChatMessagePayload, ChatResponse } from "../../domain/repositories/IChatRepository.js";
import type { ILLMService, ITopicAnalyzer, ToolResult } from "../services/GeminiService.js";
import type { IVectorSearchService } from "../services/QdrantService.js";
import type { ITTSService } from "../services/PiperTTSService.js";
import type { IConversationMemory } from "../services/ConversationMemoryManager.js";
import { GeminiService } from "../services/GeminiService.js";
import { QdrantService } from "../services/QdrantService.js";
import { PiperTTSService } from "../services/PiperTTSService.js";
import { getMemoryManager } from "../services/ConversationMemoryManager.js";
import { CYBERSECURITY_SYSTEM_PROMPT, CONTEXT_EXPLANATION_PREFIX } from "../prompts/systemPrompt.js";

interface ChatDependencies {
  llmService: ILLMService & ITopicAnalyzer;
  vectorService: IVectorSearchService;
  ttsService: ITTSService;
  memoryManager: IConversationMemory;
}

export class NativeChatRepository implements IChatRepository {
  private readonly llmService: ILLMService & ITopicAnalyzer;
  private readonly vectorService: IVectorSearchService;
  private readonly ttsService: ITTSService;
  private readonly memoryManager: IConversationMemory;

  constructor({
    llmService = new GeminiService(), 
    vectorService = new QdrantService(),
    ttsService = new PiperTTSService(),
    memoryManager = getMemoryManager()
  }: Partial<ChatDependencies> = {}) { 
    this.llmService = llmService;
    this.vectorService = vectorService;
    this.ttsService = ttsService;
    this.memoryManager = memoryManager;
  }

  async sendMessage(payload: ChatMessagePayload): Promise<ChatResponse> {
    try {
      const userMessage = this.resolveMessage(payload);
      if (!userMessage) {
        return { message: "No valid message provided.", success: false };
      }

      const history = this.memoryManager.getHistory(payload.sessionId);
      const toolResults = await this.searchRelevantContext(userMessage);

      const responseText = await this.llmService.chat(
        CYBERSECURITY_SYSTEM_PROMPT,
        history,
        userMessage,
        toolResults
      );

      this.memoryManager.addUserMessage(payload.sessionId, userMessage);
      this.memoryManager.addModelMessage(payload.sessionId, responseText);

      const audio = await this.generateAudioSafe(responseText);

      return { message: responseText, success: true, audio: audio || undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[NativeChatRepository] Error:", errorMessage);
      return { message: "Error processing your message. Please try again.", success: false };
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      return await this.vectorService.checkHealth();
    } catch {
      return false;
    }
  }

  private resolveMessage(payload: ChatMessagePayload): string | null {
    if (payload.message) return payload.message;
    if (payload.context && payload.context.contextId) return `${CONTEXT_EXPLANATION_PREFIX} ${payload.context.contextId}`;
    return null;
  }

  private async searchRelevantContext(message: string): Promise<ToolResult[] | undefined> {
    const tool = this.llmService.analyzeTopicForTool(message);
    const embedding = await this.llmService.generateEmbedding(message);

    const results = tool === "InformationSecurity"
      ? await this.vectorService.searchInformationSecurity(embedding)
      : await this.vectorService.searchContexto(embedding);

    if (!results.length) return undefined;

    return [{ toolName: tool, result: results.map(r => r.content).join("\n\n") }];
  }

  private async generateAudioSafe(text: string): Promise<string | null> {
    try {
      return await this.ttsService.synthesize(text);
    } catch {
      return null;
    }
  }
}
