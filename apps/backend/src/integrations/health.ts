export type HealthComponents = Record<string, unknown>

export type Readiness = {
	ready: boolean
	state: 'ready' | 'not_ready'
	components: { database: unknown; coordinator: unknown }
}

/**
 * Readiness responde si el proceso puede atender tráfico, no si todas las
 * dependencias externas están disponibles. Qdrant, Piper, SMTP, Drive, OpenAI
 * y la verificación pertenecen al diagnóstico (/health/status): si se exigieran
 * aquí, una dependencia opcional caída retiraría de servicio una aplicación que
 * sigue pudiendo autenticar y persistir progreso.
 */
export function readinessFrom(components: HealthComponents): Readiness {
	const database = components.database
	const coordinator = components.coordinator
	const ready = database === 'ready' && coordinator === 'ready'
	return {
		ready,
		state: ready ? 'ready' : 'not_ready',
		components: { database, coordinator },
	}
}
