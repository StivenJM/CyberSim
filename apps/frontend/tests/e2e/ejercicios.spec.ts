import { expect, test } from './fixtures/test'
import { mockDatosVacios, sembrarSesion } from './helpers/auth'

/**
 * Integración de los cinco ejercicios investigados en el apartado `/ejercicios`.
 *
 * Cubre el recorrido de cada caso: A0 disponible, D1 obligatorio antes de las
 * vistas de intervención, banco operativo y verificación con la batería real.
 * El caso SQL se ejecuta contra el Worker SQLite/WASM en un navegador real.
 */

const CASES = [
	{ id: 'cwe-321-andinapay', name: /AndinaPay/ },
	{ id: 'cwe-89-bibliotecaviva', name: /BibliotecaViva/ },
	{ id: 'cwe-434-talentoandino', name: /TalentoAndino/ },
	{ id: 'cwe-306-andeanlogix', name: /AndeanLogix/ },
	{ id: 'cwe-502-nubeandina', name: /NubeAndina/ },
] as const

async function abrirCaso(page: import('@playwright/test').Page, id: string) {
	await mockDatosVacios(page)
	await sembrarSesion(page, { role: 'estudiante', confirmado: true })
	await page.goto(`/ejercicios/${id}`)
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
		timeout: 60_000,
	})
}

async function sellarDiagnostico(page: import('@playwright/test').Page) {
	await page
		.getByLabel('Afirmación provisional')
		.fill('Diagnóstico provisional de prueba E2E.')
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

test.describe('apartado de ejercicios', () => {
	test('lista los cinco casos investigados', async ({ page }) => {
		await mockDatosVacios(page)
		await sembrarSesion(page, { role: 'estudiante', confirmado: true })
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
		test(`${entry.id}: A0 visible, D1 obligatorio y verificación del estado inicial`, async ({
			page,
		}) => {
			await abrirCaso(page, entry.id)

			// A0 siempre disponible y con materiales.
			const expediente = page.getByRole('tab', { name: /Expediente/ })
			await expect(expediente).toHaveAttribute('aria-selected', 'true')
			await expect(
				page.getByRole('heading', { name: 'Materiales A0' }),
			).toBeVisible()

			// Antes de D1 ninguna vista de intervención se puede abrir.
			const comprobaciones = page.getByRole('tab', { name: /Comprobaciones/ })
			await expect(comprobaciones).toHaveAttribute('aria-disabled', 'true')
			await comprobaciones.click({ force: true })
			await expect(
				page.getByRole('heading', { name: 'Materiales A0' }),
			).toBeVisible()

			await sellarDiagnostico(page)
			await expect(comprobaciones).toHaveAttribute('aria-disabled', 'false')

			// El estado inicial deja la protección en falso y la función legítima
			// depende del caso (BibliotecaViva ya está rota para un apellido real).
			await verificarBancoActual(page)
			await expect(page.getByText('Protección Q: falla')).toBeVisible()
			await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(
				0,
			)
		})
	}

	test('andinapay: la ruta de recuperación deja B y Q en verde', async ({
		page,
	}) => {
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

	test('bibliotecaviva: el Worker SQLite/WASM verifica la ruta de referencia', async ({
		page,
	}) => {
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

	test('talentoandino: política e inventario de referencia dejan B y Q en verde', async ({
		page,
	}) => {
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

	test('andeanlogix: la matriz de acceso de referencia deja B, Q y C en verde', async ({
		page,
	}) => {
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

	test('nubeandina: N6 con publicación staged deja B, Q y C1 en verde', async ({
		page,
	}) => {
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
