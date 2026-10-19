import { CONTEXT_EXPLANATION_PREFIX } from '../prompts/systemPrompt.js'

export interface ChatMessage {
	role: 'user' | 'model'
	content: string
}

export interface ToolResult {
	toolName: string
	result: string
}

export interface ILLMService {
	generateEmbedding(text: string): Promise<number[]>
	chat(
		systemPrompt: string,
		history: ChatMessage[],
		message: string,
		toolResults?: ToolResult[],
	): Promise<string>
}

export interface ITopicAnalyzer {
	analyzeTopicForTool(message: string): 'InformationSecurity' | 'Contexto'
}

interface OpenAIEmbeddingResponse {
	data?: Array<{ embedding?: number[] }>
	error?: { message?: string }
}

interface OpenAIChatResponse {
	choices?: Array<{
		message?: {
			content?: string | null
		}
	}>
	error?: { message?: string }
}

interface GPTConfig {
	apiKey: string
	baseUrl: string
	modelName: string
	embeddingModelName: string
}

export class GPTService implements ILLMService, ITopicAnalyzer {
	private static readonly INFO_SECURITY_KEYWORDS = [
		'troyano',
		'troyanos',
		'trojan',
		'backdoor',
		'banker',
		'clicker',
		'ddos',
		'downloader',
		'dropper',
		'fakeav',
		'red',
		'redes',
		'lan',
		'wan',
		'man',
		'ancho de banda',
		'latencia',
		'firewall',
		'firewalls',
		'cortafuego',
		'filtrado de paquetes',
		'stateful',
		'proxy',
		'next-generation',
		'reglas de firewall',
		'dmz',
		'zona desmilitarizada',
		'vpn',
		'vpns',
		'ipsec',
		'ssl',
		'tls',
		'openvpn',
		'wireguard',
		'l2tp',
		'pptp',
		'túnel',
		'tunneling',
		'split tunneling',
		'encriptación vpn',
		'firma',
		'firmas',
		'certificado',
		'certificados',
		'hash',
		'hashes',
		'clave publica',
		'clave privada',
		'rsa',
		'sha',
		'cifrado',
		'desencriptar',
		'osint',
		'phishing',
		'correo falso',
		'spam',
		'ingenieria social',
		'credenciales',
		'filtracion',
		'social-searcher',
		'phish-matic',
		'nmap',
		'escaner',
		'escaneo',
		'puertos',
		'puerto abierto',
		'net-scan',
		'vulnerabilidad',
		'exploit',
		'cve',
	]

	private readonly config: GPTConfig

	constructor(config: Partial<GPTConfig> = {}) {
		this.config = {
			apiKey: config.apiKey || process.env.OPENAI_API_KEY || '',
			baseUrl: (
				config.baseUrl ||
				process.env.OPENAI_BASE_URL ||
				'https://api.openai.com/v1'
			).replace(/\/$/, ''),
			modelName: config.modelName || process.env.OPENAI_MODEL || 'gpt-4o-mini',
			embeddingModelName:
				config.embeddingModelName ||
				process.env.OPENAI_EMBEDDING_MODEL ||
				'text-embedding-3-small',
		}

		if (!this.config.apiKey) {
			throw new Error('OPENAI_API_KEY is required')
		}
	}

	async generateEmbedding(text: string): Promise<number[]> {
		const response = await this.request<OpenAIEmbeddingResponse>(
			'/embeddings',
			{
				model: this.config.embeddingModelName,
				input: text,
			},
		)

		const embedding = response.data?.[0]?.embedding
		if (!embedding) {
			throw new Error('OpenAI returned no embedding')
		}

		return embedding
	}

	async chat(
		systemPrompt: string,
		conversationHistory: ChatMessage[],
		userMessage: string,
		toolResults?: ToolResult[],
	): Promise<string> {
		const response = await this.request<OpenAIChatResponse>(
			'/chat/completions',
			{
				model: this.config.modelName,
				messages: [
					{ role: 'system', content: systemPrompt },
					...conversationHistory.map((message) => ({
						role: message.role === 'model' ? 'assistant' : 'user',
						content: message.content,
					})),
					{
						role: 'user',
						content: this.buildMessageWithContext(userMessage, toolResults),
					},
				],
			},
		)

		const content = response.choices?.[0]?.message?.content
		if (!content) {
			throw new Error('OpenAI returned no chat response')
		}

		return content
	}

	analyzeTopicForTool(message: string): 'InformationSecurity' | 'Contexto' {
		if (message.startsWith(CONTEXT_EXPLANATION_PREFIX)) {
			return 'Contexto'
		}

		const lowerMessage = message.toLowerCase()
		const matchesInfoSecurity = GPTService.INFO_SECURITY_KEYWORDS.some(
			(keyword) => lowerMessage.includes(keyword),
		)

		return matchesInfoSecurity ? 'InformationSecurity' : 'Contexto'
	}

	private async request<T>(
		path: string,
		body: Record<string, unknown>,
	): Promise<T> {
		const response = await fetch(`${this.config.baseUrl}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.config.apiKey}`,
			},
			body: JSON.stringify(body),
		})

		const data = (await response.json()) as T & { error?: { message?: string } }
		if (!response.ok) {
			const message =
				data.error?.message ||
				`OpenAI request failed with status ${response.status}`
			throw new Error(message)
		}

		return data
	}

	private buildMessageWithContext(
		userMessage: string,
		toolResults?: ToolResult[],
	): string {
		if (!toolResults || toolResults.length === 0) return userMessage

		const contextInfo = toolResults
			.map((toolResult) => `[${toolResult.toolName}]:\n${toolResult.result}`)
			.join('\n\n')

		return `${contextInfo}\n\nPregunta: ${userMessage}`
	}
}
