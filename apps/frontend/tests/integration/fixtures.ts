import { test as base, expect, type Page } from '@playwright/test'

export { expect }
export const accounts = {
	teacher: 'profesor@test.com',
	student: 'estudiante1@test.com',
	otherStudent: 'estudiante2@test.com',
	password: 'password123',
}
export async function control(
	request: import('@playwright/test').APIRequestContext,
	route: string,
	method: 'get' | 'post' = 'get',
) {
	const response = await request[method](
		`${process.env.INTEGRATION_CONTROL_URL}${route}`,
		{
			headers: {
				Authorization: `Bearer ${process.env.CYBERSIM_INTEGRATION_KEY}`,
			},
			timeout: 60000,
		},
	)
	expect(response.ok(), `Control de integración ${route}`).toBeTruthy()
	return response.json()
}
export const test = base.extend<{ freshInstall: undefined }>({
	freshInstall: [
		async ({ request }, use) => {
			await control(request, '/reset', 'post')
			expect(await control(request, '/baseline')).toEqual({
				accounts: 3,
				students: 2,
				teachers: 1,
				courses: 1,
				enrollments: 2,
				attempts: 1,
			})
			await use(undefined)
		},
		{ auto: true },
	],
})
test.afterEach(async ({ page }, info) => {
	if (!page.isClosed())
		await info.attach('pantalla-final', {
			body: await page.screenshot({
				fullPage: true,
				animations: 'disabled',
				timeout: 45000,
			}),
			contentType: 'image/png',
		})
})
export async function login(
	page: Page,
	email = accounts.student,
	password = accounts.password,
) {
	await page.goto('/login')
	await page.getByPlaceholder('usuario@epn.edu.ec', { exact: true }).fill(email)
	await page.getByPlaceholder('••••••••', { exact: true }).fill(password)
	const response = page.waitForResponse(
		(r) => r.url().endsWith('/auth/login') && r.request().method() === 'POST',
		{ timeout: 60000 },
	)
	await page
		.getByRole('button', { name: 'Iniciar Sesión', exact: true })
		.click()
	const result = await (await response).json()
	expect(result.success, JSON.stringify(result.error)).toBe(true)
	await expect(page).toHaveURL(
		result.data.confirmado
			? result.data.role === 'profesor'
				? /\/docente$/
				: /\/seleccion-niveles$/
			: /\/verificar-email$/,
	)
	return result.data as {
		token: string
		user: { id_estudiante: number; id_profesor: number }
		role: string
	}
}
export async function logout(page: Page) {
	await page.getByRole('button', { name: 'Menú de usuario' }).click()
	await page.getByRole('button', { name: 'Cerrar sesión' }).click()
	await expect(page).toHaveURL(/\/login$/)
}
export async function createCourse(page: Page, name: string) {
	await page.getByRole('button', { name: 'Crear curso' }).click()
	await page.getByLabel('Nombre del Grupo', { exact: true }).fill(name)
	await page.getByRole('button', { name: 'Crear', exact: true }).click()
	await page.getByRole('button', { name: `Abrir curso ${name}` }).click()
	await expect(page).toHaveURL(/\/docente\/grupo\/\d+$/)
	return Number(new URL(page.url()).pathname.split('/').at(-1))
}
export async function startTutorial(page: Page) {
	await login(page)
	await page
		.getByRole('button', { name: 'Amenazas y Ataques Comunes — Bloqueado' })
		.click()
	await expect(
		page.getByRole('button', { name: 'Bloqueado', exact: true }),
	).toBeDisabled()
	await page
		.getByRole('button', { name: /^Tutorial: Introducción a la Seguridad —/ })
		.click()
	await page
		.getByRole('button', { name: /^(Empezar|Continuar|Repetir)$/ })
		.click()
	await expect(page).toHaveURL(/\/$/)
	await expect(page.locator('canvas').first()).toBeVisible({ timeout: 60000 })
	await page.getByRole('button', { name: 'Cerrar tour' }).click()
	// Pausar desde el control real permite inspeccionar pantallas sin perder el reto.
	const pause = page.getByRole('button', {
		name: 'Pausar animacion',
		exact: true,
	})
	if (await pause.isVisible()) await pause.click()
	await expect(
		page.getByRole('button', { name: 'Reanudar animacion' }),
	).toBeVisible()
}
export async function desktop(page: Page) {
	await page.getByRole('button', { name: 'Dispositivos', exact: true }).click()
	await expect(
		page.getByRole('button', { name: 'Este PC', exact: true }),
	).toBeVisible({ timeout: 60000 })
}

// Solo lectura del árbol 3D para localizar píxeles; la interacción final es un clic
// real del navegador. No se invocan handlers, controladores ni se altera el ECS.
export async function clickDevice(page: Page, name: string) {
	await expect(page.locator('canvas').first()).toBeVisible()
	const locate = () =>
		page.evaluate(async (deviceName) => {
			const fiberPath = '/node_modules/.vite/deps/@react-three_fiber.js'
			const threePath = '/node_modules/.vite/deps/three.js'
			const fiber = (await import(
				fiberPath
			)) as typeof import('@react-three/fiber')
			const { Box3, Vector3, Vector2, Raycaster } = (await import(
				threePath
			)) as typeof import('three')
			const canvas = document.querySelector('canvas')!
			const state = fiber._roots.get(canvas)?.store.getState()
			if (!state) return null
			const object = state.scene.getObjectByName(deviceName)
			if (!object) return null
			// El centro global de un router puede caer en el aire entre sus antenas.
			// Buscar una superficie real que recibiría el evento de puntero.
			const candidates: { center: import('three').Vector3; area: number }[] = []
			object.traverse((child) => {
				if (!(child as import('three').Mesh).isMesh || !child.visible) return
				const box = new Box3().setFromObject(child)
				const center = box.getCenter(new Vector3()).project(state.camera)
				if (
					Math.abs(center.x) >= 1 ||
					Math.abs(center.y) >= 1 ||
					Math.abs(center.z) >= 1
				)
					return
				const ray = new Raycaster()
				ray.setFromCamera(new Vector2(center.x, center.y), state.camera)
				const hit = ray.intersectObjects(state.internal.interaction, true)[0]
				let target: import('three').Object3D | null = hit?.object ?? null
				while (target && target !== object) target = target.parent
				if (target !== object) return
				const size = box.getSize(new Vector3())
				candidates.push({
					center,
					area: size.x * size.z + size.x * size.y + size.z * size.y,
				})
			})
			const center = candidates.sort((a, b) => b.area - a.area)[0]?.center
			if (!center) return null
			const bounds = canvas.getBoundingClientRect()
			return {
				x: bounds.x + ((center.x + 1) * bounds.width) / 2,
				y: bounds.y + ((1 - center.y) * bounds.height) / 2,
				z: center.z,
			}
		}, name)
	let previous: { x: number; y: number } | null = null
	let stable = 0
	let zooms = 0
	await expect
		.poll(
			async () => {
				const point = await locate()
				if (!point && zooms < 10) {
					await page
						.getByRole('button', { name: 'Alejar', exact: true })
						.click()
					zooms++
				}
				stable =
					point &&
					previous &&
					Math.hypot(point.x - previous.x, point.y - previous.y) < 0.5
						? stable + 1
						: 0
				previous = point
				return stable >= 3
			},
			{
				message: `Modelo y cámara 3D listos: ${name}`,
				timeout: 30000,
				intervals: [200],
			},
		)
		.toBe(true)
	const point = previous!
	await test.info().attach(`objetivo-3d-${name}`, {
		body: JSON.stringify(await locate()),
		contentType: 'application/json',
	})
	await page.mouse.click(point.x, point.y)
}
