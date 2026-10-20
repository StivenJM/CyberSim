import {
	type ScenarioValidationResult,
	validateScenarioEnvelope,
	verifyScenarioContentHash,
} from '@cybersim/scenario-contract'

import type { ScenarioDefinition } from './defineScenario'

function duplicateValues(
	values: Array<string | number>,
): Array<string | number> {
	const seen = new Set<string | number>()
	const duplicates = new Set<string | number>()
	for (const value of values) {
		if (seen.has(value)) duplicates.add(value)
		seen.add(value)
	}
	return [...duplicates]
}

export function validateScenarioDefinition(
	manifest: ScenarioDefinition,
): ScenarioValidationResult {
	const envelope = validateScenarioEnvelope(manifest)
	const errors = [...envelope.errors]
	if (!verifyScenarioContentHash(manifest)) {
		errors.push('contentHash: does not match the manifest content')
	}

	const phaseIds = manifest.fases.map((phase) => phase.id)
	for (const duplicate of duplicateValues(phaseIds)) {
		errors.push(`fases: duplicate id ${duplicate}`)
	}
	const knownPhases = new Set(phaseIds)
	manifest.eventos.forEach((event, index) => {
		if (!knownPhases.has(event.fase)) {
			errors.push(`eventos[${index}].fase: unknown phase ${event.fase}`)
		}
	})

	const deviceNames: string[] = []
	const deviceIds: number[] = []
	const zoneIds = manifest.zonas.map((zone) => zone.id)
	for (const duplicate of duplicateValues(zoneIds)) {
		errors.push(`zones: duplicate id ${duplicate}`)
	}
	for (const zone of manifest.zonas) {
		const networks = new Set(zone.redes.map((network) => network.nombre))
		const officeIds = zone.oficinas.map((office) => office.id)
		for (const duplicate of duplicateValues(officeIds)) {
			errors.push(`zone "${zone.nombre}": duplicate office id ${duplicate}`)
		}
		for (const office of zone.oficinas) {
			const spaceIds = office.espacios.map((space) => space.id)
			for (const duplicate of duplicateValues(spaceIds)) {
				errors.push(
					`office "${office.nombre}": duplicate space id ${duplicate}`,
				)
			}
			for (const space of office.espacios) {
				for (const device of space.dispositivos) {
					deviceIds.push(device.id)
					deviceNames.push(device.nombre)
					device.redes.forEach((network) => {
						if (!networks.has(network) && network !== 'Internet') {
							errors.push(
								`device "${device.nombre}": unknown network "${network}" in zone "${zone.nombre}"`,
							)
						}
					})
				}
			}
		}
	}
	for (const duplicate of duplicateValues(deviceIds)) {
		errors.push(`devices: duplicate id ${duplicate}`)
	}
	for (const duplicate of duplicateValues(deviceNames)) {
		errors.push(`devices: duplicate name "${duplicate}"`)
	}

	const knownDevices = new Set(deviceNames)
	manifest.ataques.forEach((attack, index) => {
		if (!knownPhases.has(attack.fase)) {
			errors.push(`ataques[${index}].fase: unknown phase ${attack.fase}`)
		}
		if (!knownDevices.has(attack.dispositivoAAtacar)) {
			errors.push(
				`ataques[${index}].dispositivoAAtacar: unknown device "${attack.dispositivoAAtacar}"`,
			)
		}
	})

	return { ok: errors.length === 0, errors }
}
