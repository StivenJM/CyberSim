import {
	createScenarioManifest,
	type ScenarioCapability,
	type ScenarioManifest,
	type ScenarioStatus,
} from '@cybersim/scenario-contract'

import type { DefinicionEscenario } from '../shared/types/EscenarioTypes'

export type ScenarioDefinition = ScenarioManifest<DefinicionEscenario>

export interface DefineScenarioOptions {
	revision?: number
	status?: ScenarioStatus
	environmentProfile?:
		| 'office-3d'
		| 'network-topology'
		| 'terminal-lab'
		| 'security-dashboard'
	environmentVersion?: string
	engineVersion?: string
	assetCatalogVersion?: string
	seed?: number
}

function collectManagedObjects(definition: DefinicionEscenario): string[] {
	const candidates: unknown[] = [
		...definition.accionesEsperadas,
		...definition.eventos.map((event) => event.infoAdicional),
		...definition.ataques.map((attack) => attack.condicionMitigacion),
	]
	return candidates.flatMap((value) => {
		if (!value || typeof value !== 'object' || !('objeto' in value)) return []
		return [String((value as { objeto?: unknown }).objeto ?? '')]
	})
}

function inferCapabilities(
	definition: DefinicionEscenario,
): ScenarioCapability[] {
	const capabilities = new Set<ScenarioCapability>()
	const eventTypes = definition.eventos.map((event) => String(event.tipoEvento))
	const managedObjects = collectManagedObjects(definition)

	if (eventTypes.includes('Tráfico de red')) capabilities.add('network-traffic')
	if (eventTypes.includes('Conexión VPN')) capabilities.add('vpn')
	if (eventTypes.includes('Verificación de firma')) {
		capabilities.add('digital-signature')
	}
	if (eventTypes.includes('Envío de activo')) capabilities.add('asset-transfer')
	if (eventTypes.includes('Envío de correo')) capabilities.add('phishing-email')
	if (definition.ataques.length > 0) capabilities.add('attack-simulation')
	if (managedObjects.includes('configuración de firewall')) {
		capabilities.add('firewall')
	}
	if (managedObjects.includes('configuración de workstation')) {
		capabilities.add('hardening')
	}
	if (managedObjects.includes('comando de terminal/CLI')) {
		capabilities.add('terminal')
	}

	return [...capabilities].sort()
}

export function defineScenario(
	definition: DefinicionEscenario,
	options: DefineScenarioOptions = {},
): ScenarioDefinition {
	return createScenarioManifest(definition, {
		revision: options.revision ?? 1,
		status: options.status ?? 'draft',
		capabilities: inferCapabilities(definition),
		environment: {
			profile: options.environmentProfile ?? 'office-3d',
			version: options.environmentVersion ?? '1',
		},
		engineVersion: options.engineVersion ?? 'ecs-1',
		assetCatalogVersion: options.assetCatalogVersion ?? 'built-in-1',
		seed: options.seed ?? definition.id,
	})
}
