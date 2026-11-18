import { expect, test } from './fixtures/test'
import { mockDatosVacios, sembrarSesion } from './helpers/auth'

test.describe('Rutas protegidas y roles', () => {
	test('el apartado independiente de ejercicios no tiene rutas públicas', async ({
		page,
	}) => {
		await mockDatosVacios(page)
		await sembrarSesion(page, { role: 'estudiante', confirmado: true })

		for (const path of ['/ejercicios', '/ejercicios/cwe-321-andinapay']) {
			await page.goto(path)
			await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
		}
	})

	test('sin sesión, una ruta de juego redirige a /login', async ({ page }) => {
		await page.goto('/')
		await expect(page).toHaveURL(/\/login/)
	})

	test('sin sesión, /redes redirige a /login', async ({ page }) => {
		await page.goto('/redes')
		await expect(page).toHaveURL(/\/login/)
	})

	test('un estudiante no puede entrar al panel docente', async ({ page }) => {
		await mockDatosVacios(page)
		await sembrarSesion(page, { role: 'estudiante', confirmado: true })

		await page.goto('/docente')
		await expect(page).toHaveURL(/\/seleccion-niveles/)
	})

	test('sesión sin email confirmado va a /verificar-email', async ({
		page,
	}) => {
		await sembrarSesion(page, { role: 'estudiante', confirmado: false })

		await page.goto('/')
		await expect(page).toHaveURL(/\/verificar-email/)
	})
})
