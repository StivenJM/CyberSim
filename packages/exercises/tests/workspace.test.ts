import {
	INVESTIGATED_CASE_IDS,
	INVESTIGATED_CASES,
} from '@cybersim/scenario-contract'
import { describe, expect, it } from 'vitest'

import {
	availableViewIds,
	firstAvailableView,
	workspaceViews,
} from '../src/workspace.js'

describe('exercise workspace views', () => {
	it('registers a closed view set per case with a single always-available expediente', () => {
		for (const caseId of INVESTIGATED_CASE_IDS) {
			const views = INVESTIGATED_CASES[caseId].views
			expect(views.length).toBeGreaterThanOrEqual(5)
			expect(new Set(views.map((view) => view.id)).size).toBe(views.length)
			const always = views.filter((view) => view.gate === 'always')
			expect(always).toHaveLength(1)
			expect(always[0]?.id).toBe('expediente')
			for (const view of views) {
				expect(view.label.trim().length).toBeGreaterThan(0)
				expect(view.description.trim().length).toBeGreaterThan(0)
			}
			expect(views.some((view) => view.id === 'comprobaciones')).toBe(true)
			expect(views.some((view) => view.id === 'informe')).toBe(true)
		}
	})

	it('offers only the A0 view before the diagnosis is sealed', () => {
		for (const caseId of INVESTIGATED_CASE_IDS) {
			expect(availableViewIds(caseId, { diagnosisSealed: false })).toEqual([
				'expediente',
			])
			expect(firstAvailableView(caseId, { diagnosisSealed: false })).toBe(
				'expediente',
			)
		}
	})

	it('opens the intervention views after sealing D1', () => {
		const views = workspaceViews('cwe-321-andinapay', { diagnosisSealed: true })
		expect(views.every((view) => view.available)).toBe(true)
		expect(views.filter((view) => view.reason !== null)).toHaveLength(0)
		expect(
			workspaceViews('cwe-321-andinapay', { diagnosisSealed: false }).find(
				(view) => view.id === 'banco',
			),
		).toMatchObject({
			available: false,
			reason: 'Disponible después de sellar el diagnóstico D1.',
		})
	})

	it('returns nothing for an unregistered case', () => {
		expect(workspaceViews('cwe-999', { diagnosisSealed: true })).toEqual([])
		expect(availableViewIds('cwe-999', { diagnosisSealed: true })).toEqual([])
		expect(firstAvailableView('cwe-999', { diagnosisSealed: true })).toBeNull()
	})
})
