import { QdrantClient } from '@qdrant/js-client-rest'

export interface SearchResult {
	content: string
	score: number
	metadata?: Record<string, unknown>
}

export interface IVectorSearchService {
	searchInformationSecurity(embedding: number[]): Promise<SearchResult[]>
	searchContexto(embedding: number[]): Promise<SearchResult[]>
	checkHealth(): Promise<boolean>
}

interface QdrantConfig {
	url: string
	apiKey: string
	securityCollection: string
	contextCollection: string
	topK: number
	scoreThreshold: number
	port: number
	https: boolean
}

export class QdrantService implements IVectorSearchService {
	private readonly client: QdrantClient
	private readonly config: QdrantConfig

	private static readonly CONTENT_FIELDS = [
		'text',
		'content',
		'document',
		'page_content',
		'chunk',
	]

	constructor(config: Partial<QdrantConfig> = {}) {
		this.config = this.buildConfig(config)

		const cleanUrl = this.config.url
			.replace(/\/$/, '')
			.replace('/dashboard', '')
			.replace(/^https?:\/\//, '')

		const protocol = this.config.https ? 'https' : 'http'
		const port = this.config.port

		if (!this.config.https && process.env.NODE_ENV === 'production') {
			console.warn(
				'[QdrantService] WARNING: Using HTTP in production is insecure!',
			)
		}

		this.client = new QdrantClient({
			url: `${protocol}://${cleanUrl}`,
			apiKey: this.config.apiKey,
			port,
		})
	}

	private buildConfig({
		url = process.env.QDRANT_URL || '',
		apiKey = process.env.QDRANT_API_KEY || '',
		securityCollection = process.env.QDRANT_COLLECTION_SECURITY ||
			'ciberseguridad',
		contextCollection = process.env.QDRANT_COLLECTION_CONTEXT ||
			'ContextoCiberSeguridad',
		topK = parseInt(process.env.RAG_TOP_K || '20', 10),
		scoreThreshold = parseFloat(process.env.RAG_SCORE_THRESHOLD || '0.7'),
		port = parseInt(process.env.QDRANT_PORT || '6333', 10),
		https = process.env.QDRANT_HTTPS !== 'false',
	}: Partial<QdrantConfig>): QdrantConfig {
		if (!url) throw new Error('QDRANT_URL is required')

		return {
			url,
			apiKey,
			securityCollection,
			contextCollection,
			topK,
			scoreThreshold,
			port,
			https,
		}
	}

	async searchInformationSecurity(
		embedding: number[],
	): Promise<SearchResult[]> {
		return this.search(this.config.securityCollection, embedding)
	}

	async searchContexto(embedding: number[]): Promise<SearchResult[]> {
		return this.search(this.config.contextCollection, embedding)
	}

	async checkHealth(): Promise<boolean> {
		try {
			await this.client.getCollections()
			return true
		} catch {
			return false
		}
	}

	private async search(
		collection: string,
		embedding: number[],
	): Promise<SearchResult[]> {
		try {
			const results = await this.client.search(collection, {
				vector: embedding,
				limit: this.config.topK,
				score_threshold: this.config.scoreThreshold,
				with_payload: true,
			})

			return results.map((point) => ({
				content: this.extractContent(point.payload),
				score: point.score,
				metadata: point.payload as Record<string, unknown>,
			}))
		} catch (error) {
			console.error('Search error in Qdrant collection', { collection, error })
			return []
		}
	}

	private extractContent(
		payload: Record<string, unknown> | null | undefined,
	): string {
		if (!payload) return ''

		for (const field of QdrantService.CONTENT_FIELDS) {
			const value = payload[field]
			if (typeof value === 'string' && value.length > 0) {
				return value
			}
		}

		return JSON.stringify(payload)
	}
}
