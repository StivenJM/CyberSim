import { afterEach, expect, it, vi } from 'vitest'
import { authorizedFetch } from '../src/shared/http'

afterEach(() => vi.unstubAllGlobals())

it('envía un Content-Type JSON único al combinar cabeceras con distinta capitalización', async () => {
	vi.stubGlobal('localStorage', { getItem: () => 'test-token' })
	const fetch = vi.fn().mockResolvedValue(Response.json({ success: true }))
	vi.stubGlobal('fetch', fetch)
	await authorizedFetch('/api/course-analysis/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id_curso: 1 }),
	})
	const init = fetch.mock.calls[0][1] as RequestInit
	const headers = new Headers(init.headers)
	expect(headers.get('content-type')).toBe('application/json')
	expect(headers.get('authorization')).toBe('Bearer test-token')
	expect(headers.get('x-request-id')).toMatch(/^[a-f0-9-]{36}$/)
	expect(JSON.parse(String(init.body))).toEqual({ id_curso: 1 })
})
