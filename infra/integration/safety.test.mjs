import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { assertDisposableDatabase, assertLocalIntegration } from './safety.mjs'

const id = '0123456789abcdef01234567'
const local = {
	CYBERSIM_INTEGRATION_RUN: id,
	CYBERSIM_INTEGRATION_CONTAINER: `cybersim-integration-${id}`,
	DATABASE_URL: `postgresql://postgres:local@127.0.0.1:55432/cybersim_integration_${id}`,
	DIRECT_URL: `postgresql://postgres:local@127.0.0.1:55432/cybersim_integration_${id}`,
}
test('bloquea toda ejecución en CI y GitHub, incluso CI=false como texto', () => {
	for (const key of ['CI', 'GITHUB_ACTIONS', 'GITHUB_RUN_ID'])
		assert.throws(() => assertLocalIntegration({ [key]: 'false' }), /bloqueada/)
})
test('el comando público rechaza GitHub Actions antes de preparar Docker o resetear', () => {
	const result = spawnSync(
		process.execPath,
		[fileURLToPath(new URL('./run.mjs', import.meta.url))],
		{
			env: { ...process.env, GITHUB_ACTIONS: 'true' },
			encoding: 'utf8',
			timeout: 10000,
		},
	)
	assert.equal(result.status, 1)
	assert.match(result.stderr, /bloqueada en CI\/GitHub Actions/)
	assert.doesNotMatch(result.stdout, /Integración:/)
})
test('acepta solo la base efímera y rechaza URL de desarrollo, remota o divergente', () => {
	assert.doesNotThrow(() => assertDisposableDatabase(local))
	for (const url of [
		'postgresql://localhost:5432/cybersim',
		'postgresql://prod.example:5432/cybersim',
		`postgresql://127.0.0.1:543/cybersim_integration_${id}`,
	])
		assert.throws(
			() =>
				assertDisposableDatabase({
					...local,
					DATABASE_URL: url,
					DIRECT_URL: url,
				}),
			/Reset rechazado/,
		)
	assert.throws(
		() =>
			assertDisposableDatabase({
				...local,
				DIRECT_URL: 'postgresql://localhost/cybersim',
			}),
		/Reset rechazado/,
	)
	assert.throws(
		() => assertDisposableDatabase({ ...local, CYBERSIM_INTEGRATION_RUN: '' }),
		/pnpm test:integration/,
	)
	assert.throws(
		() =>
			assertDisposableDatabase({
				...local,
				CYBERSIM_INTEGRATION_CONTAINER: 'cybersim',
			}),
		/Reset rechazado/,
	)
})
