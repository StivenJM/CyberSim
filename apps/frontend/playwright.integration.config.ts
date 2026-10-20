import { defineConfig, devices } from '@playwright/test'

if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITHUB_RUN_ID)
	throw new Error('La suite de integración con reset no se ejecuta en CI.')
if (
	!process.env.CYBERSIM_INTEGRATION_RUN ||
	!process.env.INTEGRATION_CONTROL_URL
)
	throw new Error(
		'Ejecuta pnpm test:integration desde la raíz; no invoques esta configuración directamente.',
	)

export default defineConfig({
	testDir: './tests/integration',
	fullyParallel: false,
	workers: 1,
	retries: 0,
	forbidOnly: true,
	timeout: 180000,
	expect: { timeout: 15000 },
	outputDir: './test-results/integration',
	reporter: [
		['list'],
		['html', { outputFolder: 'playwright-report/integration', open: 'never' }],
	],
	use: {
		...devices['Desktop Chrome'],
		viewport: { width: 1440, height: 1000 },
		headless: process.env.INTEGRATION_HEADLESS === '1',
		baseURL: process.env.INTEGRATION_BASE_URL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'off',
		navigationTimeout: 60000,
		actionTimeout: 15000,
		launchOptions:
			process.env.INTEGRATION_SOFTWARE_WEBGL === '1'
				? {
						args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
					}
				: {},
	},
	projects: [
		{
			name: 'core',
			testMatch: /.*\.spec\.ts/,
			testIgnore: /externos\.spec\.ts/,
		},
		{ name: 'servicios-reales', testMatch: /externos\.spec\.ts/ },
	],
})
