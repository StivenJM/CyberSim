import { accounts, createCourse, expect, login, test } from './fixtures'

test('HU006 HU007 docente: crear, renombrar, renovar invitación, persistir y eliminar curso', async ({
	page,
}) => {
	await login(page, accounts.teacher)
	await createCourse(page, 'Curso de integración')
	await page.getByRole('button', { name: 'Configuración', exact: true }).click()
	await page
		.getByPlaceholder('Nombre del grupo', { exact: true })
		.fill('Curso renombrado')
	await page.getByRole('button', { name: 'Renombrar' }).click()
	await expect(
		page.getByText('Curso renombrado', { exact: true }),
	).toBeVisible()
	const response = page.waitForResponse(
		(r) => r.request().method() === 'POST' && r.url().includes('generate-code'),
	)
	await page
		.getByRole('button', { name: 'Regenerar código de invitación' })
		.click()
	const renewed = await (await response).json()
	expect(renewed.success).toBe(true)
	await page.reload()
	await page.getByRole('button', { name: 'Configuración', exact: true }).click()
	await expect(
		page.getByPlaceholder('Nombre del grupo', { exact: true }),
	).toHaveValue('Curso renombrado')
	await page.getByRole('button', { name: 'Eliminar', exact: true }).click()
	await page
		.getByRole('alertdialog')
		.getByRole('button', { name: 'Eliminar', exact: true })
		.click()
	await expect(page).toHaveURL(/\/docente$/)
	await expect(
		page.getByRole('button', { name: 'Abrir curso Curso renombrado' }),
	).toHaveCount(0)
})

test('HU008 HU009 docente retira matrícula y estudiante se une mediante la pantalla y código reales', async ({
	browser,
	page,
}) => {
	await login(page, accounts.teacher)
	await page
		.getByRole('button', { name: 'Abrir curso Ciberseguridad 101' })
		.click()
	await expect(
		page.getByText('estudiante2@test.com', { exact: false }),
	).toBeVisible()
	await page
		.getByRole('button', { name: 'Eliminar a Pedro Sánchez del grupo' })
		.click()
	await page
		.getByRole('alertdialog')
		.getByRole('button', { name: 'Eliminar', exact: true })
		.click()
	await expect(
		page.getByRole('button', { name: 'Ver progreso de Pedro Sánchez' }),
	).toHaveCount(0)
	const context = await browser.newContext()
	try {
		const studentPage = await context.newPage()
		await login(studentPage, accounts.otherStudent)
		await studentPage.getByRole('button', { name: 'Menú de usuario' }).click()
		await studentPage.getByRole('button', { name: 'Mi Perfil' }).click()
		await studentPage.getByRole('button', { name: 'Unirse a un grupo' }).click()
		await context.grantPermissions(['clipboard-read', 'clipboard-write'])
		await studentPage.evaluate(() => navigator.clipboard.writeText('CYBER2024'))
		await studentPage
			.getByLabel('Dígito 1 del código', { exact: true })
			.press('ControlOrMeta+V')
		await studentPage
			.getByRole('button', { name: 'Unirse', exact: true })
			.click()
		await expect(
			studentPage.getByText('Ciberseguridad 101', { exact: true }),
		).toBeVisible()
		await studentPage.reload()
		await expect(
			studentPage.getByText('Ciberseguridad 101', { exact: true }),
		).toBeVisible()
		await page.reload()
		await expect(
			page.getByRole('button', { name: 'Ver progreso de Pedro Sánchez' }),
		).toBeVisible()
	} finally {
		await context.close()
	}
})

test('HU018 HU019 docente y estudiante consultan el intento inicial y el ranking del seed', async ({
	page,
	browser,
}) => {
	await login(page)
	await expect(
		page.getByText('María Rodríguez', { exact: true }).first(),
	).toBeVisible()
	await page.getByRole('button', { name: 'Menú de usuario' }).click()
	await page.getByRole('button', { name: 'Mi Perfil' }).click()
	await expect(page.getByText(/Control de Acceso/).first()).toBeVisible()
	const context = await browser.newContext()
	try {
		const teacher = await context.newPage()
		await login(teacher, accounts.teacher)
		await teacher
			.getByRole('button', { name: 'Abrir curso Ciberseguridad 101' })
			.click()
		await teacher
			.getByRole('button', { name: 'Ver progreso de María Rodríguez' })
			.click()
		await expect(teacher.getByRole('heading', { name: /María/ })).toBeVisible()
		await expect(teacher.getByText(/Control de Acceso/).first()).toBeVisible()
	} finally {
		await context.close()
	}
})
