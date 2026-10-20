import {
	accounts,
	control,
	expect,
	login,
	logout,
	startTutorial,
	test,
} from './fixtures'

test.describe('Servicios externos reales', () => {
	test.setTimeout(420000)

	test('HU001 HU003 HU005 estudiante: registro, reenvío, confirmación y recuperación con SMTP real', async ({
		page,
		request,
	}) => {
		test.skip(
			process.env.INTEGRATION_EMAIL !== '1',
			'SMTP pendiente; exclusión explícita con --skip-email.',
		)
		const email = process.env.INTEGRATION_RECIPIENT!
		await page.goto('/signup')
		await page
			.getByPlaceholder('Primero', { exact: true })
			.nth(0)
			.fill('Integración')
		await page
			.getByPlaceholder('Primero', { exact: true })
			.nth(1)
			.fill('Estudiante')
		await page.getByPlaceholder('Segundo', { exact: true }).fill('Pruebas')
		await page.getByPlaceholder('Ej. 202110119').fill('202699001')
		await page.getByRole('button', { name: 'Continuar', exact: true }).click()
		await page
			.getByPlaceholder('usuario@epn.edu.ec', { exact: true })
			.fill(email)
		await page
			.getByPlaceholder('••••••••', { exact: true })
			.nth(0)
			.fill('Integration123!')
		await page
			.getByPlaceholder('••••••••', { exact: true })
			.nth(1)
			.fill('Integration123!')
		const registration = page.waitForResponse((r) =>
			r.url().endsWith('/auth/register/estudiante'),
		)
		await page.getByRole('button', { name: 'Registrarse', exact: true }).click()
		const body = await (await registration).json()
		expect(body.success, JSON.stringify(body.error)).toBe(true)
		expect(body.data.emailStatus).toBe('accepted')
		await expect(page).toHaveURL(/\/verificar-email$/)
		// La cuenta sin confirmar puede autenticarse, pero no entra al mapa.
		await page.getByRole('button', { name: 'Cerrar sesion' }).click()
		await expect(page).toHaveURL(/\/login$/)
		await login(page, email, 'Integration123!')
		await page
			.getByRole('button', { name: 'Reenviar correo de verificacion' })
			.click()
		await expect(page.getByText('Correo reenviado correctamente.')).toBeVisible(
			{ timeout: 30000 },
		)
		const confirmation = await control(
			request,
			`/account-token?email=${encodeURIComponent(email)}`,
		)
		await page.goto(`/auth/confirm?token=${confirmation.token_confirmacion}`)
		await expect(
			page.getByRole('heading', { name: 'Correo verificado' }),
		).toBeVisible()
		// El token se consume al confirmar: el mismo enlace ya no verifica.
		await page.reload()
		await expect(
			page.getByRole('heading', { name: 'Error de verificación' }),
		).toBeVisible()
		await login(page, email, 'Integration123!')
		await logout(page)
		await page
			.getByRole('button', { name: '¿Olvidaste tu contraseña?' })
			.click()
		await page.getByLabel('Correo electrónico', { exact: true }).fill(email)
		await page
			.getByRole('button', { name: 'Enviar enlace de recuperación' })
			.click()
		await expect(page.getByText(/Revisa tu bandeja de entrada/)).toBeVisible({
			timeout: 30000,
		})
		const recovery = await control(
			request,
			`/account-token?email=${encodeURIComponent(email)}`,
		)
		expect(recovery.token_recuperacion).toBeTruthy()
		await page.goto(`/auth/reset-password?token=${recovery.token_recuperacion}`)
		await page
			.getByPlaceholder('••••••••', { exact: true })
			.nth(0)
			.fill('Integration456!')
		await page
			.getByPlaceholder('••••••••', { exact: true })
			.nth(1)
			.fill('Integration456!')
		await page
			.getByRole('button', { name: 'Restablecer contraseña', exact: true })
			.click()
		await expect(
			page.getByRole('heading', { name: 'Contraseña actualizada' }),
		).toBeVisible()
		await login(page, email, 'Integration456!')
		expect(
			(
				await control(
					request,
					`/account-token?email=${encodeURIComponent(email)}`,
				)
			).token_recuperacion,
		).toBeNull()
	})

	test('HU002 docente: incorporación por API existente, confirmación por pantalla y acceso al panel', async ({
		page,
		request,
	}) => {
		test.skip(
			process.env.INTEGRATION_EMAIL !== '1',
			'SMTP pendiente; exclusión explícita con --skip-email.',
		)
		const email = process.env.INTEGRATION_RECIPIENT!
		const response = await request.post(
			`${process.env.INTEGRATION_API_URL}/auth/register/profesor`,
			{
				data: {
					correo_electronico: email,
					contrasenia: 'Integration123!',
					primernombre: 'Docente',
					segundo_nombre: '',
					primer_apellido: 'Integración',
					segundo_apellido: 'Pruebas',
				},
			},
		)
		expect(response.status()).toBe(201)
		const body = await response.json()
		expect(body.data.emailStatus).toBe('accepted')
		const confirmation = await control(
			request,
			`/account-token?email=${encodeURIComponent(email)}`,
		)
		await page.goto(`/auth/confirm?token=${confirmation.token_confirmacion}`)
		await expect(
			page.getByRole('heading', { name: 'Correo verificado' }),
		).toBeVisible()
		await login(page, email, 'Integration123!')
		await expect(
			page.getByRole('heading', { name: 'Mis Cursos' }),
		).toBeVisible()
		await expect(
			page.getByRole('button', { name: 'Crear curso' }),
		).toBeVisible()
	})

	test('HU020 HU021 estudiante: tutor con fuentes reales y reproducción de voz Piper', async ({
		page,
	}) => {
		await startTutorial(page)
		await page.getByRole('button', { name: 'Abrir chat' }).click()
		await page
			.getByLabel('Escribe un mensaje', { exact: true })
			.fill('¿Cómo selecciono una regla de firewall?')
		const response = page.waitForResponse(
			(r) => /\/api\/chat\/?$/.test(r.url()) && r.request().method() === 'POST',
			{ timeout: 180000 },
		)
		await page.getByRole('button', { name: 'Enviar mensaje' }).click()
		const result = await (await response).json()
		expect(result.success, JSON.stringify(result.error)).toBe(true)
		expect(result.status).toBe('grounded')
		expect(result.citations.length).toBeGreaterThan(0)
		await expect(page.getByText(result.message, { exact: true })).toBeVisible()
		expect(result.hasAudio).toBe(true)
		await page.getByRole('button', { name: 'Reproducir audio' }).last().click()
		await expect(
			page.getByRole('button', { name: 'Pausar audio' }),
		).toBeVisible()
		await page.getByRole('button', { name: 'Pausar audio' }).click()
		await expect(
			page.getByRole('button', { name: 'Reproducir audio' }).last(),
		).toBeVisible()
	})

	test('HU022 estudiante: generar feedback real del intento inicial y recuperarlo tras recargar', async ({
		page,
	}) => {
		await login(page)
		await page.getByRole('button', { name: 'Menú de usuario' }).click()
		await page.getByRole('button', { name: 'Mi Perfil' }).click()
		const response = page.waitForResponse(
			(r) => r.url().endsWith('/feedback/generate'),
			{ timeout: 180000 },
		)
		await page
			.getByRole('button', {
				name: 'Generar retroalimentación con IA',
				exact: true,
			})
			.click()
		const result = await (await response).json()
		expect(result.success, JSON.stringify(result.error)).toBe(true)
		for (const key of ['analisis', 'fortaleza', 'area_mejora', 'consejo'])
			expect(result.data[key].length).toBeGreaterThan(0)
		await expect(
			page.getByRole('heading', { name: 'Retroalimentación', exact: true }),
		).toBeVisible()
		await expect(
			page.getByRole('heading', { name: 'Fortalezas', exact: true }),
		).toBeVisible()
		await page.reload()
		await page
			.getByRole('button', {
				name: 'Ver última retroalimentación',
				exact: true,
			})
			.click()
		await expect(
			page.getByRole('heading', { name: 'Retroalimentación', exact: true }),
		).toBeVisible()
	})

	test('HU023 docente: generar análisis real del curso y consultar su persistencia', async ({
		page,
	}) => {
		await login(page, accounts.teacher)
		await page
			.getByRole('button', { name: 'Abrir curso Ciberseguridad 101' })
			.click()
		await page.getByRole('button', { name: 'Análisis', exact: true }).click()
		const response = page.waitForResponse(
			(r) => r.url().endsWith('/course-analysis/generate'),
			{ timeout: 305000 },
		)
		await page.getByRole('button', { name: 'Analizar Curso' }).click()
		const result = await (await response).json()
		expect(result.success, JSON.stringify(result.error)).toBe(true)
		for (const [key, section] of Object.entries(result.data.analisis) as [
			string,
			{
				titulo: string
				contenido: string
			},
		][]) {
			expect(section.contenido.length).toBeGreaterThan(0)
			await expect(
				key === 'resumen_ejecutivo'
					? page.getByText(section.contenido.replaceAll('`', ''), {
							exact: true,
						})
					: page.getByRole('heading', { name: section.titulo, exact: true }),
			).toBeVisible()
		}
		await page.reload()
		const latest = page.waitForResponse((r) =>
			/\/course-analysis\/latest\/\d+$/.test(r.url()),
		)
		await page.getByRole('button', { name: 'Análisis', exact: true }).click()
		const persisted = await (await latest).json()
		expect(persisted.data.analisis).toEqual(result.data.analisis)
		await expect(
			page.getByRole('button', { name: 'Generar nuevo análisis' }),
		).toBeVisible()
		await expect(
			page.getByText(
				result.data.analisis.resumen_ejecutivo.contenido.replaceAll('`', ''),
				{ exact: true },
			),
		).toBeVisible()
	})

	test('HU024 estudiante: generar desafío con workflows e IA reales y abrir el laboratorio', async ({
		page,
	}) => {
		await login(page)
		const response = page.waitForResponse(
			(r) => r.url().endsWith('/agent-malvado/generate'),
			{ timeout: 305000 },
		)
		await page
			.getByRole('button', { name: 'Generar nivel personalizado con IA' })
			.click()
		const result = await (await response).json()
		expect(result.success, JSON.stringify(result.error)).toBe(true)
		expect(result.data.zonas.length).toBeGreaterThan(0)
		expect(result.data.fases.length).toBeGreaterThan(0)
		await expect(
			page.getByText(result.data.titulo, { exact: true }),
		).toBeVisible()
		await page.getByRole('button', { name: 'Jugar', exact: true }).click()
		await expect(page).toHaveURL(/\/$/)
		await expect(page.locator('canvas').first()).toBeVisible({ timeout: 60000 })
	})
})
