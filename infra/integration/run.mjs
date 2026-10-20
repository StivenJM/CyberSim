import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir, open, readFile, unlink, writeFile } from 'node:fs/promises'
import http from 'node:http'
import net from 'node:net'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'
import { Pool } from 'pg'
import { assertDisposableDatabase, assertLocalIntegration } from './safety.mjs'

assertLocalIntegration()
const args = process.argv.slice(2)
const core = args.includes('--core')
const email = !args.includes('--skip-email')
const headless = args.includes('--headless')
const testArgs = args.filter(
	(arg) => !['--core', '--skip-email', '--headless'].includes(arg),
)
for (let i = 0; i < testArgs.length; i++) {
	if (['--headed', '--debug', '--ui', '--list'].includes(testArgs[i])) continue
	if (testArgs[i] === '--grep' && testArgs[i + 1]) {
		i++
		continue
	}
	throw new Error(
		'Opciones: --core, --skip-email, --headless, --headed, --debug, --ui, --list, --grep <expresión>.',
	)
}
const root = fileURLToPath(new URL('../../', import.meta.url))
const backend = path.join(root, 'apps/backend')
const frontend = path.join(root, 'apps/frontend')
const external = {
	...parseEnv(await readFile(path.join(root, '.env'), 'utf8').catch(() => '')),
	...process.env,
}
if (!core && !testArgs.includes('--list')) {
	for (const key of [
		'OPENAI_API_KEY',
		...(email
			? [
					'SMTP_HOST',
					'SMTP_USER',
					'SMTP_PASS',
					'FROM_EMAIL',
					'VERIFY_RECIPIENT',
				]
			: []),
	])
		if (!external[key])
			throw new Error(
				`Falta ${key}. Consulta docs/guides/tests-de-integracion.md. --core ejecuta únicamente flujos sin proveedores externos.`,
			)
}
const id = randomBytes(12).toString('hex')
const project = `cybersim-integration-${id}`
const folder = path.join(root, '.dev/integration', id)
await mkdir(folder, { recursive: true })
const emptyEnv = path.join(folder, 'empty.env')
await writeFile(emptyEnv, '')
const env = {
	...process.env,
	DOTENV_CONFIG_PATH: emptyEnv,
	CYBERSIM_INTEGRATION_RUN: id,
	CYBERSIM_INTEGRATION_CONTAINER: project,
	CYBERSIM_INTEGRATION_KEY: randomBytes(32).toString('hex'),
	INTEGRATION_EXTERNAL: core ? '0' : '1',
	INTEGRATION_EMAIL: email ? '1' : '0',
	INTEGRATION_HEADLESS: headless ? '1' : '0',
	INTEGRATION_RECIPIENT: external.VERIFY_RECIPIENT || '',
}
// Drive y la administración de n8n de desarrollo no forman parte de la suite.
for (const key of [
	'GOOGLE_CLIENT_ID',
	'GOOGLE_CLIENT_SECRET',
	'GOOGLE_DRIVE_FOLDER_ID',
	'N8N_ADMIN_API_KEY',
])
	delete env[key]
for (const key of [
	'JWT_SECRET',
	'INTERNAL_SIGNING_KEY',
	'N8N_ENCRYPTION_KEY',
	'N8N_RUNNERS_AUTH_TOKEN',
	'N8N_TO_BACKEND_TOKEN',
	'BACKEND_TO_N8N_TOKEN',
	'MAINTENANCE_TOKEN',
])
	env[key] = randomBytes(32).toString('hex')
for (const key of [
	'OPENAI_API_KEY',
	'OPENAI_TUTOR_MODEL',
	'OPENAI_COMPLEX_MODEL',
	'OPENAI_EMBEDDING_MODEL',
	'SMTP_HOST',
	'SMTP_PORT',
	'SMTP_SECURE',
	'SMTP_USER',
	'SMTP_PASS',
	'FROM_EMAIL',
])
	env[key] = external[key] || ''
const children = []
if (testArgs.includes('--list')) {
	const result = spawnSync(
		process.execPath,
		[
			path.join(frontend, 'node_modules/@playwright/test/cli.js'),
			'test',
			'--config',
			'playwright.integration.config.ts',
			...(core ? ['--project', 'core'] : []),
			...testArgs,
		],
		{
			cwd: frontend,
			stdio: 'inherit',
			env: {
				...env,
				INTEGRATION_CONTROL_URL: 'http://127.0.0.1:1',
				INTEGRATION_BASE_URL: 'http://127.0.0.1:1',
			},
		},
	)
	process.exit(result.status ?? 1)
}
let created = false,
	lock,
	pool,
	control
const composeFile = path.join(folder, 'compose.json')
const composeArgs = [
	'compose',
	'--project-directory',
	root,
	'--env-file',
	emptyEnv,
	'-f',
	composeFile,
	'--project-name',
	project,
]
function docker(args, capture = false) {
	const result = spawnSync('docker', args, {
		cwd: root,
		env,
		encoding: 'utf8',
		stdio: capture ? 'pipe' : 'inherit',
		timeout: 300000,
	})
	if (result.status !== 0)
		throw new Error(capture ? result.stderr : 'Falló Docker.')
	return result.stdout?.trim()
}
const compose = (args, capture = false) =>
	docker([...composeArgs, ...args], capture)
function node(args) {
	const result = spawnSync(process.execPath, args, {
		cwd: backend,
		env,
		stdio: 'inherit',
		timeout: 180000,
	})
	if (result.status !== 0)
		throw new Error('Falló Prisma; no se ejecutan pruebas.')
}
async function freePort() {
	const server = net.createServer()
	await new Promise((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, '127.0.0.1', resolve)
	})
	const port = server.address().port
	await new Promise((resolve) => server.close(resolve))
	return port
}
async function waitFor(url, ms = 120000) {
	const end = Date.now() + ms
	while (Date.now() < end) {
		try {
			if ((await fetch(url, { signal: AbortSignal.timeout(2000) })).ok) return
		} catch {
			/* Arranque en curso. */
		}
		await sleep(500)
	}
	throw new Error(`Servicio no disponible: ${new URL(url).pathname}`)
}
let stopping = false
async function diagnostics() {
	const secrets = Object.entries(env)
		.filter(
			([key, value]) => /KEY|TOKEN|SECRET|PASS/.test(key) && value.length > 6,
		)
		.map(([, value]) => value)
	const redact = (text) =>
		secrets.reduce((out, secret) => out.replaceAll(secret, '[REDACTED]'), text)
	if (created) {
		const result = spawnSync(
			'docker',
			[...composeArgs, 'logs', '--no-color', '--tail', '150'],
			{
				cwd: root,
				env,
				encoding: 'utf8',
				timeout: 30000,
			},
		)
		await writeFile(
			path.join(folder, 'services.log'),
			redact(`${result.stdout || ''}\n${result.stderr || ''}`),
		)
	}
	if (created && !core && env.N8N_ADMIN_API_KEY) {
		try {
			const headers = { 'X-N8N-API-KEY': env.N8N_ADMIN_API_KEY }
			const response = await fetch(
				`${env.N8N_URL}/api/v1/executions?status=error&limit=20`,
				{ headers, signal: AbortSignal.timeout(5000) },
			)
			const errors = []
			for (const item of (await response.json()).data || []) {
				const detail = await fetch(
					`${env.N8N_URL}/api/v1/executions/${item.id}?includeData=true`,
					{ headers, signal: AbortSignal.timeout(5000) },
				).then((r) => r.json())
				errors.push({
					id: item.id,
					workflowId: item.workflowId,
					lastNode: detail.data?.resultData?.lastNodeExecuted,
					error: detail.data?.resultData?.error,
				})
			}
			await writeFile(
				path.join(folder, 'workflow-errors.json'),
				redact(JSON.stringify(errors, null, 2)),
			)
		} catch {
			console.warn('No se pudo recoger el diagnóstico de n8n.')
		}
	}
}
async function cleanup() {
	if (stopping) return
	stopping = true
	control?.close()
	for (const child of children.reverse()) {
		if (child.exitCode !== null) continue
		if (process.platform === 'win32')
			spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
				stdio: 'ignore',
			})
		else {
			child.kill('SIGTERM')
			await Promise.race([
				new Promise((r) => child.once('exit', r)),
				sleep(3000),
			])
			if (child.exitCode === null) child.kill('SIGKILL')
		}
	}
	await pool?.end()
	if (created) {
		if (project !== `cybersim-integration-${id}` || !/^[a-f0-9]{24}$/.test(id))
			throw new Error('Limpieza insegura.')
		compose(['down', '--volumes', '--remove-orphans'])
	}
	if (lock) {
		await lock.close()
		await unlink(path.join(root, '.dev/integration/active.lock'))
	}
}
process.once('SIGINT', () => {
	void cleanup().finally(() => process.exit(130))
})
process.once('SIGTERM', () => {
	void cleanup().finally(() => process.exit(143))
})
try {
	try {
		lock = await open(path.join(root, '.dev/integration/active.lock'), 'wx')
		await lock.writeFile(JSON.stringify({ id, pid: process.pid }))
	} catch {
		throw new Error(
			'Ya hay una suite activa en este checkout. Consulta la guía para limpiar una ejecución interrumpida.',
		)
	}
	const config = JSON.parse(
		await readFile(path.join(root, 'compose.yaml'), 'utf8'),
	)
	const names = core
		? ['postgres', 'backend']
		: ['postgres', 'backend', 'qdrant', 'n8n', 'runner', 'piper']
	const services = Object.fromEntries(
		names.map((name) => [name, config.services[name]]),
	)
	for (const [name, service] of Object.entries(services)) {
		delete service.develop
		delete service.ports
		if (name === 'postgres') delete service.depends_on
		if (name === 'backend')
			service.depends_on = { postgres: { condition: 'service_healthy' } }
	}
	const pgPort = await freePort(),
		apiPort = await freePort(),
		internalPort = await freePort(),
		frontPort = await freePort()
	const database = `cybersim_integration_${id}`
	const password = randomBytes(24).toString('hex')
	services.postgres.environment = {
		POSTGRES_USER: 'postgres',
		POSTGRES_PASSWORD: password,
		POSTGRES_DB: database,
	}
	services.postgres.ports = [`127.0.0.1:${pgPort}:5432`]
	services.backend.ports = [
		`127.0.0.1:${apiPort}:3000`,
		`127.0.0.1:${internalPort}:3001`,
	]
	Object.assign(services.backend.environment, {
		PGDATABASE: database,
		PGPASSWORD: password,
		FRONTEND_URL: `http://127.0.0.1:${frontPort}`,
	})
	// La imagen recién construida contiene las fuentes y Prisma de Linux.
	// Evitar bind de src generado en Windows y el watcher durante las pruebas.
	services.backend.command = [
		'pnpm',
		'--filter',
		'@cybersim/backend',
		'exec',
		'tsx',
		'src/server.ts',
	]
	if (!core) {
		for (const [name, port] of [
			['n8n', 5678],
			['qdrant', 6333],
			['piper', 5000],
		]) {
			const hostPort = await freePort()
			services[name].ports = [`127.0.0.1:${hostPort}:${port}`]
			env[`${name.toUpperCase()}_URL`] = `http://127.0.0.1:${hostPort}`
		}
		services.piper.image = 'cybersim-piper:latest'
	}
	const volumes = Object.fromEntries(
		Object.keys(config.volumes).map((name) => [name, {}]),
	)
	await writeFile(
		composeFile,
		JSON.stringify({ name: project, services, volumes }, null, 2),
		{ mode: 0o600 },
	)
	env.DATABASE_URL = `postgresql://postgres:${password}@127.0.0.1:${pgPort}/${database}`
	env.DIRECT_URL = env.DATABASE_URL
	env.INTEGRATION_API_URL = `http://127.0.0.1:${apiPort}`
	env.INTEGRATION_BASE_URL = `http://127.0.0.1:${frontPort}`
	env.BACKEND_INTERNAL_URL = `http://127.0.0.1:${internalPort}`
	env.BACKEND_URL = env.INTEGRATION_API_URL
	env.PREPARATION_DIR = path.join(folder, 'preparation')
	assertDisposableDatabase(env)
	console.log(
		`Integración: ${project}. Base aislada; proveedores ${core ? 'fuera de este comando' : 'reales'}.`,
	)
	created = true
	compose(['build', 'backend'])
	compose(['up', '--detach', '--wait', 'postgres'])
	node(['node_modules/prisma/build/index.js', 'generate'])
	node(['node_modules/prisma/build/index.js', 'migrate', 'reset', '--force'])
	node(['node_modules/tsx/dist/cli.mjs', 'prisma/seed.ts'])
	pool = new Pool({ connectionString: env.DATABASE_URL })
	await pool.query('INSERT INTO coordinacion_integracion(id) VALUES(1)')
	compose(['up', '--detach', ...names.filter((name) => name !== 'postgres')])
	await waitFor(`${env.INTEGRATION_API_URL}/health/live`)
	if (!core) {
		node([
			path.join(frontend, 'node_modules/tsx/dist/cli.mjs'),
			path.join(frontend, 'scripts/export-rag-knowledge.ts'),
		])
		await waitFor(`${env.N8N_URL}/healthz`)
		// /healthz responde antes de que n8n termine de montar sus controladores REST.
		const readyDeadline = Date.now() + 120000
		while (true) {
			const ready = await fetch(`${env.N8N_URL}/rest/settings`, {
				signal: AbortSignal.timeout(5000),
			}).catch(() => null)
			if (
				ready?.ok &&
				ready.headers.get('content-type')?.includes('application/json')
			)
				break
			if (Date.now() > readyDeadline)
				throw new Error('La API REST de n8n no quedó lista.')
			await sleep(1000)
		}
		const setup = await fetch(`${env.N8N_URL}/rest/owner/setup`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'integration@example.invalid',
				firstName: 'Integration',
				lastName: 'CyberSim',
				password: `It1!${randomBytes(18).toString('hex')}`,
			}),
		})
		if (
			!setup.ok ||
			!setup.headers.get('content-type')?.includes('application/json')
		)
			throw new Error(
				`Inicialización n8n: HTTP ${setup.status}, tipo ${setup.headers.get('content-type')}`,
			)
		const cookie = setup.headers
			.getSetCookie()
			.map((item) => item.split(';')[0])
			.join('; ')
		const scopeResponse = await fetch(`${env.N8N_URL}/rest/api-keys/scopes`, {
			headers: { Cookie: cookie },
		})
		if (
			!scopeResponse.ok ||
			!scopeResponse.headers.get('content-type')?.includes('application/json')
		)
			throw new Error(
				`Scopes n8n: HTTP ${scopeResponse.status}, tipo ${scopeResponse.headers.get('content-type')}`,
			)
		const scopeBody = await scopeResponse.json()
		const keyResponse = await fetch(`${env.N8N_URL}/rest/api-keys`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Cookie: cookie },
			body: JSON.stringify({
				label: 'CyberSim integration',
				expiresAt: null,
				scopes: scopeBody.data,
			}),
		})
		if (
			!keyResponse.ok ||
			!keyResponse.headers.get('content-type')?.includes('application/json')
		)
			throw new Error(
				`Crear clave n8n: HTTP ${keyResponse.status}, tipo ${keyResponse.headers.get('content-type')}`,
			)
		const keyBody = await keyResponse.json()
		env.N8N_ADMIN_API_KEY = keyBody.data?.rawApiKey || keyBody.data?.apiKey
		if (!keyResponse.ok || !env.N8N_ADMIN_API_KEY)
			throw new Error(`Clave n8n: HTTP ${keyResponse.status}`)
		const prepare = spawn(process.execPath, ['infra/tools.mjs', 'prepare'], {
			cwd: root,
			env,
			stdio: 'inherit',
		})
		children.push(prepare)
		console.log(
			'Preparando workflows y conocimiento reales; puede tardar varios minutos.',
		)
		const deadline = Date.now() + 900000
		while (true) {
			if (
				(
					await pool.query(
						'SELECT revision_id FROM coordinacion_integracion WHERE id=1',
					)
				).rows[0].revision_id
			)
				break
			if (Date.now() > deadline)
				throw new Error('El índice real no quedó disponible en 15 minutos.')
			await sleep(2000)
		}
	}
	control = http.createServer(async (req, res) => {
		try {
			assertDisposableDatabase(env)
			if (
				req.headers.authorization !== `Bearer ${env.CYBERSIM_INTEGRATION_KEY}`
			) {
				res.writeHead(403).end()
				return
			}
			const url = new URL(req.url, 'http://127.0.0.1')
			let result
			if (req.method === 'POST' && url.pathname === '/reset') {
				const busy = await pool.query(
					"SELECT 1 FROM operacion_integracion WHERE clase <> 'index' AND estado IN ('activa','esperando','incierta') LIMIT 1",
				)
				if (busy.rowCount)
					throw new Error(
						'Hay operaciones de usuario pendientes; no es seguro resetear todavía.',
					)
				node([
					'node_modules/tsx/dist/cli.mjs',
					'tests/browser-integration/reset-domain.ts',
				])
				result = { success: true }
			} else if (req.method === 'GET' && url.pathname === '/account-token') {
				if (url.searchParams.get('email') !== env.INTEGRATION_RECIPIENT)
					throw new Error('Destinatario no autorizado.')
				result = (
					await pool.query(
						'SELECT token_confirmacion,token_recuperacion,confirmado FROM usuario_auth WHERE correo_electronico=$1',
						[env.INTEGRATION_RECIPIENT],
					)
				).rows[0]
			} else if (req.method === 'GET' && url.pathname === '/baseline') {
				result = (
					await pool.query(
						'SELECT (SELECT count(*)::int FROM usuario_auth) accounts,(SELECT count(*)::int FROM estudiante) students,(SELECT count(*)::int FROM profesor) teachers,(SELECT count(*)::int FROM curso) courses,(SELECT count(*)::int FROM matricula) enrollments,(SELECT count(*)::int FROM progreso) attempts',
					)
				).rows[0]
			} else {
				res.writeHead(404).end()
				return
			}
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify(result))
		} catch {
			res
				.writeHead(500)
				.end('Falló el control de integración; revisar la consola local.')
		}
	})
	await new Promise((resolve) => control.listen(0, '127.0.0.1', resolve))
	env.INTEGRATION_CONTROL_URL = `http://127.0.0.1:${control.address().port}`
	const vite = spawn(
		process.execPath,
		[
			path.join(frontend, 'node_modules/vite/bin/vite.js'),
			'--host',
			'127.0.0.1',
			'--port',
			String(frontPort),
			'--strictPort',
		],
		{
			cwd: frontend,
			env: { ...env, NODE_ENV: 'development' },
			stdio: 'inherit',
		},
	)
	children.push(vite)
	await waitFor(env.INTEGRATION_BASE_URL)
	const playwright = spawn(
		process.execPath,
		[
			path.join(frontend, 'node_modules/@playwright/test/cli.js'),
			'test',
			'--config',
			'playwright.integration.config.ts',
			...(core ? ['--project', 'core'] : []),
			...testArgs,
		],
		{ cwd: frontend, env, stdio: 'inherit' },
	)
	children.push(playwright)
	process.exitCode = await new Promise((resolve) =>
		playwright.once('exit', (code) => resolve(code ?? 1)),
	)
} catch (error) {
	console.error(error.message)
	process.exitCode = 1
} finally {
	await diagnostics().catch(() => console.warn('Diagnóstico no disponible.'))
	await cleanup()
}
