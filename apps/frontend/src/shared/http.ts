export function authHeaders(): Record<string, string> {
	const token = localStorage.getItem('authToken')
	return {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	}
}
export function authorizedFetch(
	input: RequestInfo | URL,
	init: RequestInit = {},
): Promise<Response> {
	// Headers combina nombres sin distinguir mayúsculas. Un objeto con
	// Content-Type y content-type produce un valor duplicado que Express no analiza.
	const headers = new Headers(authHeaders())
	headers.set('X-Request-Id', crypto.randomUUID())
	new Headers(init.headers).forEach((value, key) => {
		headers.set(key, value)
	})
	return fetch(input, {
		...init,
		headers,
		signal: init.signal || AbortSignal.timeout(305000),
	})
}
export function errorMessage(data: unknown): string {
	if (data && typeof data === 'object' && 'error' in data) {
		const e = (data as { error: unknown }).error
		if (typeof e === 'string') return e
		if (e && typeof e === 'object' && 'message' in e) return String(e.message)
	}
	return 'Servicio no disponible'
}
