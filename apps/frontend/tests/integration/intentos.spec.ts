import { accounts, expect, login, test } from './fixtures'

const VERSIONS = {
	task: 'integration-task-1',
	form: 'A',
	fixtures: 'integration-fixtures-1',
	engine: 'integration-engine-1',
	verifier: 'integration-verifier-1',
	rubric: 'integration-rubric-1',
	aids: 'integration-aids-1',
} as const

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
