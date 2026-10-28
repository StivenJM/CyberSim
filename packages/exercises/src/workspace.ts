import {
	getInvestigatedCase,
	type InvestigatedView,
} from '@cybersim/scenario-contract'

export interface WorkspaceState {
	/** D1 is sealed before any intervention view is offered. */
	readonly diagnosisSealed: boolean
}

export interface ViewAvailability extends InvestigatedView {
	readonly available: boolean
	readonly reason: string | null
}

const BLOCKED = 'Disponible después de sellar el diagnóstico D1.'

/**
 * Closed availability rule for the per-case views.
 *
 * `always` views carry the A0 material and stay reachable at every stage; the
 * rest wait for the sealed diagnosis so the solution menu cannot precede D1.
 */
export function workspaceViews(
	caseId: string,
	state: WorkspaceState,
): readonly ViewAvailability[] {
	const definition = getInvestigatedCase(caseId)
	if (!definition) return []
	return definition.views.map((view) => {
		const available = view.gate === 'always' || state.diagnosisSealed
		return {
			...view,
			available,
			reason: available ? null : BLOCKED,
		}
	})
}

export function availableViewIds(
	caseId: string,
	state: WorkspaceState,
): readonly string[] {
	return workspaceViews(caseId, state)
		.filter((view) => view.available)
		.map((view) => view.id)
}

export function firstAvailableView(
	caseId: string,
	state: WorkspaceState,
): string | null {
	return availableViewIds(caseId, state)[0] ?? null
}
