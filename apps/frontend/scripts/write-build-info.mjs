import { mkdir, writeFile } from 'node:fs/promises'

// El agente de despliegue compara este archivo con el manifiesto del release.
// La versión y el commit llegan como variables de build; no son secretos.
const info = {
	artifact: 'web',
	version: process.env.BUILD_VERSION || 'dev',
	commit: process.env.BUILD_COMMIT || 'dev',
	builtAt: new Date().toISOString(),
}

await mkdir('dist', { recursive: true })
await writeFile(
	'dist/build-info.json',
	`${JSON.stringify(info, null, 2)}\n`,
	'utf8',
)
console.log(`build-info.json: ${info.version} (${info.commit})`)
