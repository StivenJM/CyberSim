import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai";
import { CONTEXT_EXPLANATION_PREFIX } from "../prompts/systemPrompt.js";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ToolResult {
  toolName: string;
  result: string;
}

export interface ILLMService {
  generateEmbedding(text: string): Promise<number[]>;
  chat(systemPrompt: string, history: ChatMessage[], message: string, toolResults?: ToolResult[]): Promise<string>;
}

export interface ITopicAnalyzer {
  analyzeTopicForTool(message: string): "InformationSecurity" | "Contexto";
}

export class GeminiService implements ILLMService, ITopicAnalyzer {
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;
  private readonly embeddingModelName: string;

  private static readonly INFO_SECURITY_KEYWORDS = [
    "troyano", "troyanos", "trojan", "backdoor", "banker", "clicker", "ddos",
    "downloader", "dropper", "fakeav", "red", "redes", "lan", "wan", "man",
    "ancho de banda", "latencia", "firewall", "firewalls", "cortafuego",
    "filtrado de paquetes", "stateful", "proxy", "next-generation",
    "reglas de firewall", "dmz", "zona desmilitarizada",
    "vpn", "vpns", "ipsec", "ssl", "tls", "openvpn", "wireguard", "l2tp", "pptp",
    "túnel", "tunneling", "split tunneling", "encriptación vpn",
    "firma", "firmas", "certificado", "certificados", "hash", "hashes",
    "clave publica", "clave privada", "rsa", "sha", "cifrado", "desencriptar",
    "osint", "phishing", "correo falso", "spam", "ingenieria social", "credenciales",
    "filtracion", "social-searcher", "phish-matic",
    "nmap", "escaner", "escaneo", "puertos", "puerto abierto", "net-scan",
    "vulnerabilidad", "exploit", "cve"
  ];

  constructor(apiKey: string = "") {
    const key = apiKey || process.env.GOOGLE_GEMINI_API_KEY || "";
    if (!key) throw new Error("GOOGLE_GEMINI_API_KEY is required");

    this.genAI = new GoogleGenerativeAI(key);
    this.modelName = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    this.embeddingModelName = process.env.GEMINI_EMBEDDING_MODEL || "models/gemini-embedding-001";
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: this.embeddingModelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async chat(
    systemPrompt: string,
    conversationHistory: ChatMessage[],
    userMessage: string,
    toolResults?: ToolResult[]
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
    });

    const history: Content[] = conversationHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }] as Part[],
    }));

    const messageWithContext = this.buildMessageWithContext(userMessage, toolResults);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(messageWithContext);

    return result.response.text();
  }

  analyzeTopicForTool(message: string): "InformationSecurity" | "Contexto" {
    if (message.startsWith(CONTEXT_EXPLANATION_PREFIX)) {
      return "Contexto";
    }

    const lowerMessage = message.toLowerCase();
    const matchesInfoSecurity = GeminiService.INFO_SECURITY_KEYWORDS
      .some(keyword => lowerMessage.includes(keyword));

    return matchesInfoSecurity ? "InformationSecurity" : "Contexto";
  }

  private buildMessageWithContext(userMessage: string, toolResults?: ToolResult[]): string {
    if (!toolResults || toolResults.length === 0) return userMessage;

    const contextInfo = toolResults
      .map(tr => `[${tr.toolName}]:\n${tr.result}`)
      .join("\n\n");

    return `${contextInfo}\n\nPregunta: ${userMessage}`;
  }
}
