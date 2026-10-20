import { escenarioCriptografia } from '../../src/data/escenarios/escenarioCriptografia'
import {
	clickDevice,
	desktop,
	expect,
	login,
	startTutorial,
	test,
} from './fixtures'

test('HU010 HU011 estudiante: elegir tutorial, recorrer zonas, explorar dispositivo y volver al mapa', async ({
	page,
}) => {
	await startTutorial(page)
	await expect(
		page.getByRole('region', { name: 'Vista 3D de la escena' }),
	).toBeVisible()
	await page.getByRole('button', { name: 'Siguiente zona' }).click()
	await expect(
		page.getByText('Internet', { exact: true }).first(),
	).toBeVisible()
	await page.getByRole('button', { name: 'Zona anterior' }).click()
	await desktop(page)
	await page.getByRole('button', { name: 'Este PC', exact: true }).dblclick()
	await expect(
		page.getByText('PC-Empleado', { exact: true }).first(),
	).toBeVisible()
	await page.keyboard.press('Escape')
	await page.getByLabel('Salir', { exact: true }).click()
	await page.getByRole('button', { name: 'Salir del escenario' }).click()
	await expect(page).toHaveURL(/\/seleccion-niveles$/)
})

test('HU013 HU015 estudiante: configurar protección, instalar app y ejecutar consola simulada', async ({
	page,
}) => {
	await startTutorial(page)
	await desktop(page)
	await page
		.getByRole('button', { name: 'Configuracion', exact: true })
		.dblclick()
	await page
		.getByLabel('Buscar configuración', { exact: true })
		.fill('antivirus')
	await page
		.getByRole('button', { name: /Antivirus/i })
		.first()
		.click()
	const checkbox = page.getByRole('checkbox').first()
	const before = await checkbox.isChecked()
	await checkbox.locator('..').click()
	await expect(checkbox).toBeChecked({ checked: !before })
	await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
	await page.getByRole('button', { name: 'Apps', exact: true }).dblclick()
	await expect(page.getByRole('button', { name: /Instaladas/ })).toBeVisible()
	await page
		.getByRole('button', { name: /Instalar|Obtener/ })
		.first()
		.click()
	await page.getByRole('button', { name: /Instaladas/ }).click()
	await expect(
		page.getByRole('button', { name: 'Desinstalar', exact: true }).first(),
	).toBeVisible()
	await page
		.getByRole('button', { name: 'Desinstalar', exact: true })
		.first()
		.click()
	await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
	await page.getByRole('button', { name: 'Consola', exact: true }).dblclick()
	const command = page.getByLabel('Línea de comandos', { exact: true })
	await command.fill('ls')
	await command.press('Enter')
	await expect(page.getByText(/reporte_mensual.docx/).first()).toBeVisible()
	await command.fill('cat reporte_mensual.docx')
	await command.press('Enter')
	await expect(
		page.getByText('Reporte de actividades del mes', { exact: false }),
	).toBeVisible()
	await command.fill('comando-inexistente')
	await command.press('Enter')
	await expect(
		page
			.getByText(/no (reconocido|encontrado)|no se reconoce|inválido/i)
			.first(),
	).toBeVisible()
})

test('HU012 HU016 HU018 HU019 estudiante: completar tutorial, guardar éxito, desbloquear nivel y sumar ranking', async ({
	page,
}) => {
	await startTutorial(page)
	await page.getByRole('link', { name: 'Redes', exact: true }).click()
	await page
		.locator('.react-flow__node')
		.filter({ hasText: 'PC Empleado' })
		.click()
	const network = page
		.getByRole('complementary', { name: 'Panel de dispositivo' })
		.getByRole('button', { name: 'LAN-Oficina' })
	await expect(network).toHaveAttribute('aria-pressed', 'false')
	await network.click()
	await expect(network).toHaveAttribute('aria-pressed', 'true')
	await page.getByRole('link', { name: 'Oficina', exact: true }).click()
	await clickDevice(page, 'Router Principal')
	await page.getByRole('menuitem', { name: 'Configurar Firewall' }).click()
	const ssh = page.getByRole('button', { name: /SSH Hacia/i })
	await ssh.click()
	await expect(ssh).toHaveAttribute('aria-pressed', 'true')
	await page.getByRole('button', { name: 'Cerrar modal' }).click()
	await page.getByRole('button', { name: 'Reanudar animacion' }).click()
	// Se usa el reloj del motor real; las notificaciones pausan hasta ser atendidas.
	for (let tick = 0; tick < 90; tick++) {
		if (await page.getByRole('dialog').isVisible()) break
		const resume = page
			.getByRole('button', { name: /Continuar|Entendido|Reanudar/ })
			.first()
		if (await resume.isVisible()) await resume.click()
		await page.waitForTimeout(1000)
	}
	await expect(page.getByRole('dialog')).toContainText(
		/completado|Felicidades|Excelente/i,
	)
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Jugar otro nivel' })
		.click()
	await expect(page).toHaveURL(/\/seleccion-niveles$/)
	await expect(
		page.getByRole('button', { name: /^Tutorial:.*Completado/ }),
	).toBeVisible()
	await expect(
		page.getByRole('button', {
			name: /^Amenazas y Ataques Comunes.*Disponible/,
		}),
	).toBeVisible()
	await expect(page.getByText(/1[,.\s]?000\s*pts/).first()).toBeVisible()
	await page.reload()
	await expect(
		page.getByRole('button', { name: /^Tutorial:.*Completado/ }),
	).toBeVisible()
})

test('HU014 HU017 estudiante: verificar firmas válida y alterada y conectar VPN gateway/cliente', async ({
	page,
}) => {
	test.setTimeout(240000)
	await login(page)
	// Caso focalizado sobre la definición publicada, sin inventar un escenario ni
	// progreso persistido. El desbloqueo se verifica en el recorrido anterior.
	await page.addInitScript((scenario) => {
		Object.assign(window, { __E2E_ESCENARIO__: scenario })
		localStorage.setItem('slug_escenario_actual', scenario.slug)
	}, escenarioCriptografia)
	await page.goto('/')
	await expect(page.locator('canvas').first()).toBeVisible({ timeout: 60000 })
	await page.getByRole('button', { name: 'Pausar animacion' }).click()
	await desktop(page)
	await page.getByRole('button', { name: 'Archivos', exact: true }).dblclick()
	await expect(
		page.getByRole('button', { name: /Contrato Comercial/ }).first(),
	).toBeVisible()
	await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
	await page.getByRole('button', { name: 'Apps', exact: true }).dblclick()
	const app = page
		.locator('div')
		.filter({ has: page.getByText('FirmaChecker', { exact: true }) })
		.filter({ has: page.getByRole('button', { name: /Instalar|Obtener/ }) })
		.last()
	await app.getByRole('button', { name: /Instalar|Obtener/ }).click()
	await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
	await page
		.getByRole('button', { name: 'FirmaChecker', exact: true })
		.dblclick()
	for (const [document, key, valid] of [
		['Contrato Comercial', 'Clave_Publica_Cliente', true],
		['Factura Proveedor', 'Clave_Publica_Proveedor', false],
	] as const) {
		await page
			.getByRole('button', { name: 'Explorar archivos', exact: true })
			.click()
		await page
			.getByRole('button', { name: new RegExp(document) })
			.first()
			.click()
		await page.getByRole('button', { name: 'Abrir', exact: true }).click()
		await page
			.getByRole('button', { name: 'Calcular Hash del Documento' })
			.click()
		await page
			.getByRole('button', { name: 'Siguiente: Descifrar Firma →' })
			.click()
		await page.getByRole('button', { name: 'Explorar claves públicas' }).click()
		await page.getByRole('button', { name: new RegExp(key) }).click()
		await page.getByRole('button', { name: 'Descifrar y Extraer Hash' }).click()
		await page.getByRole('button', { name: 'Siguiente: Comparar →' }).click()
		await page
			.getByRole('button', {
				name: valid ? 'Los hashes coinciden' : 'Los hashes no coinciden',
				exact: true,
			})
			.click()
		await expect(
			page.getByRole('heading', {
				name: valid ? 'Veredicto: Firma Válida' : 'Veredicto: Firma Inválida',
			}),
		).toBeVisible()
		if (valid)
			await page.getByRole('button', { name: 'Verificar otra firma' }).click()
	}
	await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
	await page.getByTitle('Volver a la oficina (Esc)').click()
	await expect(
		page.getByRole('button', { name: 'Este PC', exact: true }),
	).toHaveCount(0)
	await clickDevice(page, 'VPN Gateway Bufete')
	await page
		.getByRole('menuitem', { name: 'Configurar VPN', exact: true })
		.click()
	const gateway = page.getByRole('dialog')
	for (const [label, option] of [
		['LAN local', 'LAN-Bufete'],
		['Dominio remoto', 'Cliente-Externo'],
		['Protección', 'EA'],
		['Host en LAN', 'PC Abogado'],
		['Host remoto', 'PC Cliente'],
	]) {
		await gateway.getByRole('button', { name: label, exact: true }).click()
		await gateway.getByRole('option', { name: option, exact: true }).click()
	}
	await gateway.getByRole('button', { name: 'Añadir perfil VPN' }).click()
	await expect(gateway.getByText('PC Abogado', { exact: true })).toBeVisible()
	await page.getByRole('button', { name: 'Cerrar modal' }).click()
	await page.getByRole('button', { name: 'Siguiente zona' }).click()
	await clickDevice(page, 'PC Cliente')
	await page.getByRole('menuitem', { name: 'Configurar', exact: true }).click()
	await expect(
		page.getByRole('button', { name: 'Este PC', exact: true }),
	).toBeVisible()
	await page.getByRole('button', { name: 'VPN', exact: true }).dblclick()
	await page.getByLabel('Protección', { exact: true }).click()
	await page.getByText('Encriptar y Autenticar', { exact: true }).click()
	await page.getByLabel('Dominio remoto', { exact: true }).click()
	await page.getByText('Bufete-Mendoza', { exact: true }).click()
	await page.getByLabel('Host remoto', { exact: true }).click()
	await page.getByText('PC Abogado', { exact: true }).click()
	await page.getByRole('button', { name: 'Añadir', exact: true }).click()
	await expect(
		page.getByRole('button', { name: 'Eliminar configuración' }),
	).toBeVisible()
	await page.getByRole('button', { name: 'Cerrar', exact: true }).click()
	await page.getByTitle('Volver a la oficina (Esc)').click()
	const saved = page.waitForResponse(
		(r) => r.url().endsWith('/progreso') && r.request().method() === 'POST',
		{ timeout: 120000 },
	)
	await page.getByRole('button', { name: 'Reanudar animacion' }).click()
	for (let tick = 0; tick < 100; tick++) {
		if (await page.getByRole('dialog').isVisible()) break
		const resume = page.getByRole('button', {
			name: 'Reanudar animacion',
			exact: true,
		})
		if (await resume.isVisible()) await resume.click()
		await page.waitForTimeout(1000)
	}
	await expect(page.getByRole('dialog')).toContainText('¡Felicitaciones!')
	expect((await saved).status()).toBe(201)
})
