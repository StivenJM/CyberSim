export function assertLocalIntegration(env = process.env) {
	if (env.CI || env.GITHUB_ACTIONS || env.GITHUB_RUN_ID)
		throw new Error(
			'La integración con reset está bloqueada en CI/GitHub Actions.',
		)
}

export function assertDisposableDatabase(env = process.env) {
	assertLocalIntegration(env)
	const id = env.CYBERSIM_INTEGRATION_RUN
	if (!id || !/^[a-f0-9]{24}$/.test(id))
		throw new Error(
			'Usa pnpm test:integration para crear un entorno desechable.',
		)
	const url = new URL(env.DATABASE_URL)
	if (
		url.protocol !== 'postgresql:' ||
		url.hostname !== '127.0.0.1' ||
		Number(url.port) < 1024 ||
		url.pathname !== `/cybersim_integration_${id}` ||
		env.DIRECT_URL !== env.DATABASE_URL ||
		env.CYBERSIM_INTEGRATION_CONTAINER !== `cybersim-integration-${id}`
	)
		throw new Error(
			'Reset rechazado: el destino no es la base desechable de esta ejecución.',
		)
	return url
}
