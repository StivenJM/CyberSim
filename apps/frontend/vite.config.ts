import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	const backendTarget = env.BACKEND_URL || 'http://localhost:3000'

	// El proxy /api se comparte entre el server de dev y el de preview, porque
	// `vite preview` no hereda la config de `server`.
	const apiProxy = {
		'/api': {
			target: backendTarget,
			changeOrigin: true,
			rewrite: (url: string) =>
				url.startsWith('/api/chat') || url.startsWith('/api/agent-malvado')
					? url
					: url.slice(4),
		},
	}

	return {
		plugins: [
			react(),
			{
				name: 'cybersim-dev-fingerprint',
				configureServer(server) {
					server.middlewares.use('/__dev/fingerprint', (_req, res) => {
						const hash = crypto.createHash('sha256')
						const walk = (dir: string) => {
							for (const entry of fs
								.readdirSync(dir, { withFileTypes: true })
								.sort((a, b) => a.name.localeCompare(b.name))) {
								const file = path.join(dir, entry.name)
								if (entry.isDirectory()) walk(file)
								else if (
									['.ts', '.tsx', '.json'].includes(path.extname(file))
								) {
									hash.update(file)
									hash.update(fs.readFileSync(file))
								}
							}
						}
						walk(path.resolve('src'))
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ hash: hash.digest('hex') }))
					})
				},
			},
		],
		server: {
			allowedHosts: ['localhost', 'frontend'],
			proxy: apiProxy,
		},
		preview: {
			proxy: apiProxy,
		},
		test: {
			// Los specs E2E (tests/e2e) los corre Playwright, no Vitest.
			exclude: [...configDefaults.exclude, 'tests/e2e/**'],
			coverage: {
				provider: 'v8',
				exclude: [
					'**/EscenarioController.ts',
					'**/ProgresoController.ts',
					'**/RedController.ts',
					'**/EscenarioBuilder.ts',
					'**/FirewallBuilder.ts',
					'**/apiConfig.ts',
				],
			},
		},
	}
})
