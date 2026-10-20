import { spawnSync } from 'node:child_process'
import { readFile, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { assertLocalIntegration } from './safety.mjs'

assertLocalIntegration()
const [id, ...extra] = process.argv.slice(2)
if (!id || !/^[a-f0-9]{24}$/.test(id) || extra.length)
	throw new Error(
		'Uso: pnpm test:integration:cleanup <id hexadecimal de 24 caracteres>',
	)
const project = `cybersim-integration-${id}`
const lockPath = fileURLToPath(
	new URL('../../.dev/integration/active.lock', import.meta.url),
)
let active
try {
	active = JSON.parse(await readFile(lockPath, 'utf8'))
} catch {
	/* Sin bloqueo. */
}
if (active?.id === id) {
	let running = true
	try {
		process.kill(active.pid, 0)
	} catch (error) {
		if (error.code === 'ESRCH') running = false
		else throw error
	}
	if (running)
		throw new Error(
			'La suite sigue activa. Ciérrala con Ctrl+C antes de limpiar.',
		)
}
function docker(args) {
	const result = spawnSync('docker', args, { encoding: 'utf8', timeout: 60000 })
	if (result.status !== 0)
		throw new Error('Falló la limpieza Docker del proyecto de integración.')
	return result.stdout.trim().split(/\r?\n/).filter(Boolean)
}
for (const [kind, list, remove] of [
	['container', ['ps', '-aq'], ['rm', '-f']],
	['volume', ['volume', 'ls', '-q'], ['volume', 'rm']],
	['network', ['network', 'ls', '-q'], ['network', 'rm']],
]) {
	const resources = docker([
		...list,
		'--filter',
		`label=com.docker.compose.project=${project}`,
	])
	for (const resource of resources) {
		const expression =
			kind === 'container'
				? '{{index .Config.Labels "com.docker.compose.project"}}'
				: '{{index .Labels "com.docker.compose.project"}}'
		const owner = docker([kind, 'inspect', '--format', expression, resource])
		if (owner[0] !== project)
			throw new Error('Recurso ajeno: limpieza rechazada.')
		docker([...remove, resource])
	}
}
if (active?.id === id) await unlink(lockPath)
console.log(`Recursos desechables eliminados: ${project}`)
