import { accounts, expect, login, logout, test } from './fixtures'

for (const [role, email] of [
	['docente', accounts.teacher],
	['estudiante', accounts.student],
]) {
	test(`HU004 ${role}: login real, perfil, logout y rechazo de credenciales`, async ({
		page,
	}) => {
		await login(page, email)
		if (role === 'docente') {
			await expect(
				page.getByRole('heading', { name: 'Mis Cursos' }),
			).toBeVisible()
			await expect(
				page.getByText('Ciberseguridad 101', { exact: true }),
			).toBeVisible()
		} else {
			await page.getByRole('button', { name: 'Menú de usuario' }).click()
			await page.getByRole('button', { name: 'Mi Perfil' }).click()
			await expect(page.getByText(email, { exact: true })).toBeVisible()
			await expect(
				page.getByRole('heading', { name: 'Historial de evaluaciones' }),
			).toBeVisible()
		}
		await logout(page)
		expect(
			await page.evaluate(() => localStorage.getItem('authToken')),
		).toBeNull()
		await page
			.getByPlaceholder('usuario@epn.edu.ec', { exact: true })
			.fill(email)
		await page.getByPlaceholder('••••••••', { exact: true }).fill('incorrecta')
		await page
			.getByRole('button', { name: 'Iniciar Sesión', exact: true })
			.click()
		await expect(
			page.getByText(
				/Credenciales inválidas|Contraseña incorrecta|contraseña inválida/i,
			),
		).toBeVisible()
		await expect(page).toHaveURL(/\/login$/)
	})
}

test('HU025 controles de navegación y API con identidad real de ambos perfiles', async ({
	page,
	request,
}) => {
	await page.goto('/docente')
	await expect(page).toHaveURL(/\/login$/)
	const student = await login(page)
	await page.goto('/docente')
	await expect(page).toHaveURL(/\/seleccion-niveles$/)
	const api = process.env.INTEGRATION_API_URL
	for (const token of ['', 'token-invalido']) {
		const r = await request.get(`${api}/auth/me`, {
			headers: { Authorization: `Bearer ${token}` },
		})
		expect(r.status()).toBe(401)
	}
	const denied = await request.get(`${api}/course-analysis/latest/1`, {
		headers: { Authorization: `Bearer ${student.token}` },
	})
	expect(denied.status()).toBe(403)
	await logout(page)
	const teacher = await login(page, accounts.teacher)
	const feedback = await request.get(
		`${api}/feedback/check-status?slug_escenario=tutorial`,
		{ headers: { Authorization: `Bearer ${teacher.token}` } },
	)
	expect(feedback.status()).toBe(403)
})
