import type { ScenarioDefinition } from './defineScenario'
import { validateScenarioDefinition } from './validateScenario'

type ScenarioModule = Record<string, unknown>

const modules = import.meta.glob<ScenarioModule>(
	'../data/escenarios/escenario*.ts',
	{ eager: true },
)

function isScenarioDefinition(value: unknown): value is ScenarioDefinition {
	return (
		!!value &&
		typeof value === 'object' &&
		'schemaVersion' in value &&
		'slug' in value
	)
}

function loadDefinitions(): ScenarioDefinition[] {
	const definitions = Object.values(modules).flatMap((module) =>
		Object.values(module).filter(isScenarioDefinition),
	)
	const ids = new Set<number>()
	const slugs = new Set<string>()

	for (const definition of definitions) {
		const result = validateScenarioDefinition(definition)
		if (!result.ok) {
			throw new Error(
				`Invalid scenario "${definition.slug}":\n- ${result.errors.join('\n- ')}`,
			)
		}
		if (ids.has(definition.id)) {
			throw new Error(`Duplicate scenario id ${definition.id}`)
		}
		if (slugs.has(definition.slug)) {
			throw new Error(`Duplicate scenario slug "${definition.slug}"`)
		}
		ids.add(definition.id)
		slugs.add(definition.slug)
	}

	return definitions.sort((left, right) => left.id - right.id)
}

const allDefinitions = loadDefinitions()
const publishedDefinitions = allDefinitions.filter(
	(definition) => definition.status === 'published',
)

const byId = new Map(
	publishedDefinitions.map((definition) => [definition.id, definition]),
)
const bySlug = new Map(
	publishedDefinitions.map((definition) => [definition.slug, definition]),
)

export const scenarioCatalog = {
	list: (): readonly ScenarioDefinition[] => publishedDefinitions,
	listAll: (): readonly ScenarioDefinition[] => allDefinitions,
	getById: (id: number): ScenarioDefinition | undefined => byId.get(id),
	getBySlug: (slug: string): ScenarioDefinition | undefined => bySlug.get(slug),
}
