import { accounts, expect, login, test } from './fixtures'

/**
 * Integración real de los cinco ejercicios investigados.
 *
 * Usa el stack completo: Vite, Express, PostgreSQL y el reset de datos del
 * fixture. El estudiante inicia sesión con una cuenta sembrada, recorre cada
 * caso y el intento se persiste a través de `/api/attempts`.
 */

const CASES = [
	{ id: 'cwe-321-andinapay', tab: /Respuesta de claves/ },
	{ id: 'cwe-89-bibliotecaviva', tab: /Editor de cambios/ },
	{ id: 'cwe-434-talentoandino', tab: /Solicitudes de carga/ },
	{ id: 'cwe-306-andeanlogix', tab: /Peticiones/ },
	{ id: 'cwe-502-nubeandina', tab: /Inspector de payload/ },
] as const

const VERSIONS = {
	task: 'integration-task-1',
	form: 'A',
	fixtures: 'integration-fixtures-1',
	engine: 'integration-engine-1',
	verifier: 'integration-verifier-1',
	rubric: 'integration-rubric-1',
	aids: 'integration-aids-1',
} as const

async function abrirCaso(page: import('@playwright/test').Page, id: string) {
	await page.goto(`/ejercicios/${id}`)
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
		timeout: 60_000,
	})
}

async function sellarDiagnostico(page: import('@playwright/test').Page) {
	await page
		.getByLabel('Afirmación provisional')
		.fill('Diagnóstico de integración sobre el expediente real.')
	await page.getByRole('button', { name: 'Sellar diagnóstico D1' }).click()
	await expect(
		page.getByRole('button', { name: 'Diagnóstico sellado' }),
	).toBeVisible()
}

async function verificarBancoActual(page: import('@playwright/test').Page) {
	await page.getByRole('tab', { name: /Comprobaciones/ }).click()
	await page.getByRole('button', { name: 'Verificar banco actual' }).click()
	await expect(page.getByRole('table')).toBeVisible({ timeout: 30_000 })
}

test.describe('ejercicios investigados con el stack real', () => {
	test('el estudiante autenticado ve los cinco casos', async ({ page }) => {
		await login(page)
		await page.goto('/ejercicios')

		await expect(
			page.getByRole('heading', { name: 'Ejercicios', level: 1 }),
		).toBeVisible({ timeout: 60_000 })
		for (const entry of CASES) {
			await expect(
				page.locator(`a[href="/ejercicios/${entry.id}"]`),
			).toHaveCount(1)
		}
		await expect(page.locator('ul li a')).toHaveCount(5)
	})

	for (const entry of CASES) {
		test(`${entry.id}: A0, D1 obligatorio y verificación inicial`, async ({
			page,
		}) => {
			await login(page)
			await abrirCaso(page, entry.id)

			await expect(
				page.getByRole('tab', { name: /Expediente/ }),
			).toHaveAttribute('aria-selected', 'true')
			await expect(
				page.getByRole('heading', { name: 'Materiales A0' }),
			).toBeVisible()

			const comprobaciones = page.getByRole('tab', {
				name: /Comprobaciones/,
			})
			await expect(comprobaciones).toHaveAttribute('aria-disabled', 'true')
			await comprobaciones.click({ force: true })
			await expect(
				page.getByRole('heading', { name: 'Materiales A0' }),
			).toBeVisible()

			await sellarDiagnostico(page)
			await expect(comprobaciones).toHaveAttribute('aria-disabled', 'false')

			await verificarBancoActual(page)
			await expect(page.getByText('Protección Q: falla')).toBeVisible()
			await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(
				0,
			)
		})
	}

	test('andinapay: recuperación completa desde la interfaz', async ({
		page,
	}) => {
		await login(page)
		await abrirCaso(page, 'cwe-321-andinapay')
		await sellarDiagnostico(page)
		await page.getByRole('tab', { name: /Respuesta de claves/ }).click()

		for (const label of [
			'Preparar K2 para migración',
			'Fijar fuente de clave restringida',
			'Recifrar R01 y R02 en staged',
			'Publicar recuperación',
			'Configurar prevención',
		]) {
			await page.getByRole('button', { name: label }).click()
		}

		await page.getByRole('button', { name: 'Verificar estado actual' }).click()
		await expect(page.getByText('Función legítima B: pasa')).toBeVisible({
			timeout: 30_000,
		})
		await expect(page.getByText('Protección Q: pasa')).toBeVisible()
	})

	test('bibliotecaviva: Worker SQLite/WASM con la ruta de referencia', async ({
		page,
	}) => {
		await login(page)
		await abrirCaso(page, 'cwe-89-bibliotecaviva')
		await sellarDiagnostico(page)
		await page.getByRole('tab', { name: /Editor de cambios/ }).click()

		await page
			.getByRole('combobox', { name: 'constructor', exact: true })
			.selectOption('named')
		await page
			.getByRole('combobox', { name: 'actorSource', exact: true })
			.selectOption('session')
		await page
			.getByRole('combobox', { name: 'validation', exact: true })
			.selectOption('typed')
		await page
			.getByRole('combobox', { name: 'errorPolicy', exact: true })
			.selectOption('public_id')
		await page
			.getByRole('combobox', { name: 'dbRole', exact: true })
			.selectOption('history_readonly')

		await page.getByRole('button', { name: 'Verificar estado actual' }).click()
		await expect(page.getByText('Función legítima B: pasa')).toBeVisible({
			timeout: 30_000,
		})
		await expect(page.getByText('Protección Q: pasa')).toBeVisible()
	})

	test('talentoandino: política e inventario de referencia', async ({
		page,
	}) => {
		await login(page)
		await abrirCaso(page, 'cwe-434-talentoandino')
		await sellarDiagnostico(page)
		await page.getByRole('tab', { name: /Solicitudes de carga/ }).click()

		const policy: Record<string, string> = {
			validation: 'V2',
			size: 'L1',
			name: 'N1',
			storage: 'S1',
			delivery: 'D1',
			publication: 'P1',
		}
		for (const [control, value] of Object.entries(policy)) {
			await page
				.getByRole('combobox', { name: control, exact: true })
				.selectOption(value)
		}
		for (const label of [
			'Cuarentenar LG02',
			'Cuarentenar LG03',
			'Migrar LG01',
		]) {
			await page.getByRole('button', { name: label }).click()
		}

		await page.getByRole('button', { name: 'Verificar estado actual' }).click()
		await expect(page.getByText('Función legítima B: pasa')).toBeVisible({
			timeout: 30_000,
		})
		await expect(page.getByText('Protección Q: pasa')).toBeVisible()
	})

	test('andeanlogix: matriz de acceso de referencia', async ({ page }) => {
		await login(page)
		await abrirCaso(page, 'cwe-306-andeanlogix')
		await sellarDiagnostico(page)
		await page.getByRole('tab', { name: /Peticiones/ }).click()

		const config: Record<string, string> = {
			Guard: 'server_roles',
			'Bypass de mantenimiento': 'false',
			'Ingreso administrativo': 'ops_only',
			'Servicio administrativo': 'true',
			'Seguimiento público': 'true',
		}
		for (const [control, value] of Object.entries(config)) {
			await page
				.getByRole('combobox', { name: control, exact: true })
				.selectOption(value)
		}

		await page.getByRole('button', { name: 'Verificar estado actual' }).click()
		await expect(page.getByText('Función legítima B: pasa')).toBeVisible({
			timeout: 30_000,
		})
		await expect(page.getByText('Protección Q: pasa')).toBeVisible()
		await expect(page.getByText(/C306=sí/)).toBeVisible()
	})

	test('nubeandina: N6 con publicación staged', async ({ page }) => {
		await login(page)
		await abrirCaso(page, 'cwe-502-nubeandina')
		await sellarDiagnostico(page)
		await page.getByRole('tab', { name: /Inspector de payload/ }).click()

		await page
			.getByRole('combobox', { name: 'Diff de restauración', exact: true })
			.selectOption('N6')
		await page
			.getByRole('combobox', { name: 'Modo de publicación', exact: true })
			.selectOption('staged')

		await page.getByRole('button', { name: 'Verificar estado actual' }).click()
		await expect(page.getByText('Función legítima B: pasa')).toBeVisible({
			timeout: 30_000,
		})
		await expect(page.getByText('Protección Q: pasa')).toBeVisible()
		await expect(page.getByText(/NA-C1=sí/)).toBeVisible()
	})
})

test.describe('persistencia del intento con el stack real', () => {
	interface AttemptEnvelope {
		readonly status: string
		readonly record?: {
			readonly attemptId: string
			readonly status: string
			readonly delivery?: { readonly teacherBatteryId: string }
		}
		readonly code?: string
	}

	async function command(
		page: import('@playwright/test').Page,
		attemptId: string,
		body: unknown,
	): Promise<{ status: number; body: AttemptEnvelope }> {
		return page.evaluate(
			async ({ id, payload }) => {
				const token = localStorage.getItem('authToken')
				const response = await fetch(`/api/attempts/${id}/commands`, {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
						authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				})
				return { status: response.status, body: await response.json() }
			},
			{ id: attemptId, payload: body },
		) as Promise<{ status: number; body: AttemptEnvelope }>
	}

	test('crear, diagnosticar, revisar y entregar queda en PostgreSQL', async ({
		page,
	}) => {
		await login(page)
		await page.goto('/ejercicios')

		const created = await page.evaluate(async (versions) => {
			const token = localStorage.getItem('authToken')
			const response = await fetch('/api/attempts', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					caseId: 'cwe-321-andinapay',
					versions,
				}),
			})
			return { status: response.status, body: await response.json() }
		}, VERSIONS)

		expect(created.status).toBe(201)
		const attemptId = (created.body as AttemptEnvelope).record?.attemptId
		expect(attemptId).toBeTruthy()
		if (!attemptId) return

		const diagnosis = await command(page, attemptId, {
			kind: 'save-diagnosis',
			operationId: 'integration-d1',
			expectedRevision: 0,
			frontierId: 'AP-F1',
			citedArtifactIds: ['AP-H1'],
			claim: 'La clave histórica cifró R01 y R02.',
		})
		expect(diagnosis.status).toBe(200)

		const revision = await command(page, attemptId, {
			kind: 'save-revision',
			operationId: 'integration-r1',
			expectedRevision: 0,
			diffHash: `sha256:${'a'.repeat(64)}`,
		})
		expect(revision.status).toBe(200)

		const delivered = await command(page, attemptId, {
			kind: 'deliver',
			operationId: 'integration-deliver',
			expectedRevision: 1,
			evidenceHash: `sha256:${'b'.repeat(64)}`,
			teacherBattery: { batteryId: 'ignored', tests: [] },
		})
		expect(delivered.status).toBe(200)

		const stored = await page.evaluate(async (id) => {
			const token = localStorage.getItem('authToken')
			const response = await fetch(`/api/attempts/${id}`, {
				headers: { authorization: `Bearer ${token}` },
			})
			return { status: response.status, body: await response.json() }
		}, attemptId)

		expect(stored.status).toBe(200)
		const record = (stored.body as AttemptEnvelope).record
		expect(record?.status).toBe('delivered')
		expect(record?.delivery?.teacherBatteryId).toBe('server-battery-pending')
	})

	test('otro estudiante no puede leer el intento ajeno', async ({
		page,
		browser,
	}) => {
		await login(page)
		const created = await page.evaluate(async (versions) => {
			const token = localStorage.getItem('authToken')
			const response = await fetch('/api/attempts', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					caseId: 'cwe-502-nubeandina',
					versions,
				}),
			})
			return response.json()
		}, VERSIONS)
		const attemptId = (created as AttemptEnvelope).record?.attemptId
		if (!attemptId) throw new Error('No se creó el intento')

		const otherContext = await browser.newContext()
		const otherPage = await otherContext.newPage()
		try {
			await login(otherPage, accounts.otherStudent, accounts.password)
			const foreign = await otherPage.evaluate(async (id) => {
				const token = localStorage.getItem('authToken')
				const response = await fetch(`/api/attempts/${id}`, {
					headers: { authorization: `Bearer ${token}` },
				})
				return { status: response.status, body: await response.json() }
			}, attemptId)

			expect(foreign.status).toBe(403)
			expect(JSON.stringify(foreign.body)).not.toContain(attemptId)
		} finally {
			await otherContext.close()
		}
	})
})
