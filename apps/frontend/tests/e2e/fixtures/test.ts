import { test as base, expect } from '@playwright/test'

// Every browser test runs without the backend. Preparation has its own response
// contract and must not receive the generic empty-data response used by views.
export const test = base.extend({
	page: async ({ page }, use) => {
		await page.route('**/api/health/ready', (route) =>
			route.fulfill({ json: { state: 'listo', components: {} } }),
		)
		await use(page)
	},
})

export { expect }
