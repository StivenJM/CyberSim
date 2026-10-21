// Scripts de base que ejecuta el arranque. El seed de demostración crea cuentas
// con contraseñas conocidas, por lo que solo se ejecuta con un valor explícito.
// El catálogo de escenarios sí se sincroniza siempre: es contenido real y no
// crea identidades.
export function startupScripts(seedDemoData) {
	const scripts = ['migrate:deploy']
	if (seedDemoData === true || seedDemoData === 'true') scripts.push('db:seed')
	scripts.push('db:sync-scenarios')
	return scripts
}
