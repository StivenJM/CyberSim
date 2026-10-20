import { spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { Pool } from 'pg'

const url = new URL('postgresql://localhost')
url.hostname = process.env.PGHOST || 'postgres'
url.port = process.env.PGPORT || '5432'
url.username = process.env.PGUSER || 'postgres'
url.password = process.env.PGPASSWORD || 'postgres'
url.pathname = `/${process.env.PGDATABASE || 'cybersim'}`
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== url.toString())
	throw new Error('DATABASE_URL no coincide con PostgreSQL configurado.')
process.env.DATABASE_URL = url.toString()
process.env.DIRECT_URL = url.toString()
const db = new Pool({ connectionString: url.toString() })
try {
	await db.query('SELECT current_database(),version()')
	for (const script of ['migrate:deploy', 'db:seed', 'db:sync-scenarios']) {
		const r = spawnSync(
			'pnpm',
			['--filter', '@cybersim/backend', 'run', script],
			{ stdio: 'inherit', env: process.env, timeout: 180000 },
		)
		if (r.status !== 0)
			throw new Error(`${script} falló. No se resetea la base.`)
	}
	const state = process.env.PREPARATION_DIR || '/state'
	await mkdir(state, { recursive: true })
	const old = (
		await db.query('SELECT * FROM coordinacion_integracion WHERE id=1')
	).rows[0]
	if (!old) {
		let previous = false
		try {
			await readFile(`${state}/installation.json`)
			previous = true
		} catch {}
		await db.query(
			'INSERT INTO coordinacion_integracion(id,pausada,sincronizacion) VALUES(1,$1,$2) ON CONFLICT DO NOTHING',
			[previous, JSON.stringify({ resetDetected: previous })],
		)
		if (previous)
			console.log('Reset detectado: integraciones pausadas hasta reconciliar.')
	}
	const current = (
		await db.query(
			'SELECT installation_id FROM coordinacion_integracion WHERE id=1',
		)
	).rows[0]
	await writeFile(`${state}/installation.json`, JSON.stringify(current), {
		mode: 0o600,
	})
	console.log('Migraciones y configuración funcional comprobadas.')
} finally {
	await db.end()
}
