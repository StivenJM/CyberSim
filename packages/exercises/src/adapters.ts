import {
	type AlState,
	applyAndeanLogix,
	createAndeanLogixState,
	verifyAndeanLogix,
} from './andeanlogix/model.js'
import {
	type AndinaPayState,
	applyAndinaPay,
	createAndinaPayState,
	verifyAndinaPay,
} from './andinapay/model.js'
import {
	ACTOR_VALUES,
	applyBibliotecaViva,
	type BibliotecaVivaState,
	CONSTRUCTOR_VALUES,
	createBibliotecaVivaState,
	ERROR_VALUES,
	ROLE_VALUES,
	VALIDATION_VALUES,
} from './bibliotecaviva/model.js'
import type { ExerciseReport } from './core.js'
import {
	applyNubeAndina,
	createNubeAndinaState,
	type NdState,
	verifyNubeAndina,
} from './nubeandina/model.js'
import {
	applyTalentoAndino,
	createTalentoAndinoState,
	type TaState,
	verifyTalentoAndino,
} from './talentoandino/model.js'

export interface ControlOption {
	readonly value: string
	readonly label: string
}

export interface AdapterResult {
	readonly ok: boolean
	readonly state: unknown
	readonly error?: string
	readonly effects?: readonly string[]
}

export interface ExerciseControl {
	readonly id: string
	readonly label: string
	readonly options: readonly ControlOption[]
	readonly current: (state: unknown) => string
	readonly apply: (state: unknown, value: string) => AdapterResult
}

export interface ExerciseAction {
	readonly id: string
	readonly label: string
	readonly apply: (state: unknown) => Promise<AdapterResult> | AdapterResult
}

export type AdapterVerification =
	| { readonly kind: 'ok'; readonly report: ExerciseReport }
	| { readonly kind: 'unavailable'; readonly reason: string }

export interface ExerciseAdapter {
	readonly caseId: string
	readonly initialState: () => unknown
	readonly controls: readonly ExerciseControl[]
	readonly actions: readonly ExerciseAction[]
	readonly verify: (state: unknown) => Promise<AdapterVerification>
}

export interface AdapterDependencies {
	/** Browser (or test) verifier for the SQL case, which needs a real engine. */
	readonly verifySql?: (
		config: BibliotecaVivaState['config'],
	) => Promise<AdapterVerification>
}

function options(values: readonly string[]): readonly ControlOption[] {
	return values.map((value) => ({ value, label: value }))
}

function applied(state: unknown, effects?: readonly string[]): AdapterResult {
	return { ok: true, state, effects }
}

function rejected(error: string): AdapterResult {
	return { ok: false, state: undefined, error }
}

const ANDINAPAY_ACTIONS: readonly ExerciseAction[] = [
	{
		id: 'stage-key',
		label: 'Preparar K2 para migración',
		apply: async (state) =>
			toResult(
				await applyAndinaPay(state as AndinaPayState, {
					kind: 'stage_key',
					keyId: 'recovery-v2',
				}),
			),
	},
	{
		id: 'restricted-source',
		label: 'Fijar fuente de clave restringida',
		apply: async (state) =>
			toResult(
				await applyAndinaPay(state as AndinaPayState, {
					kind: 'set_key_source',
					source: 'restricted-key-service',
				}),
			),
	},
	{
		id: 'rekey',
		label: 'Recifrar R01 y R02 en staged',
		apply: async (state) =>
			toResult(
				await applyAndinaPay(state as AndinaPayState, {
					kind: 'rekey_records',
					records: ['R01', 'R02'],
				}),
			),
	},
	{
		id: 'commit',
		label: 'Publicar recuperación',
		apply: async (state) =>
			toResult(
				await applyAndinaPay(state as AndinaPayState, {
					kind: 'commit_recovery',
				}),
			),
	},
	{
		id: 'prevention',
		label: 'Configurar prevención',
		apply: async (state) =>
			toResult(
				await applyAndinaPay(state as AndinaPayState, {
					kind: 'configure_prevention',
					scope: 'history-and-new-diff',
					exceptionPolicy: 'review-required',
				}),
			),
	},
]

function toResult(
	outcome: Awaited<ReturnType<typeof applyAndinaPay>>,
): AdapterResult {
	return outcome.ok
		? applied(outcome.state, outcome.effects)
		: rejected(`${outcome.code}: ${outcome.detail}`)
}

const TA_FIELDS = [
	'validation',
	'size',
	'name',
	'storage',
	'delivery',
	'publication',
] as const

const TA_VALUES: Readonly<
	Record<(typeof TA_FIELDS)[number], readonly string[]>
> = {
	validation: ['V0', 'V1', 'V2'],
	size: ['L0', 'L1'],
	name: ['N0', 'N1'],
	storage: ['S0', 'S1', 'S2'],
	delivery: ['D0', 'D1'],
	publication: ['P0', 'P1'],
}

const TA_CONTROLS: readonly ExerciseControl[] = TA_FIELDS.map((field) => ({
	id: field,
	label: field,
	options: options(TA_VALUES[field]),
	current: (state) => (state as TaState).policy[field],
	apply: (state, value) => {
		const outcome = applyTalentoAndino(state as TaState, {
			kind: 'configure',
			field,
			value,
		})
		return outcome.ok
			? applied(outcome.state, outcome.effects)
			: rejected(`${outcome.code}: ${outcome.detail}`)
	},
}))

const TA_ACTIONS: readonly ExerciseAction[] = [
	{
		id: 'quarantine-lg02',
		label: 'Cuarentenar LG02',
		apply: (state) => {
			const outcome = applyTalentoAndino(state as TaState, {
				kind: 'inventory',
				action: 'quarantine',
				id: 'LG02',
			})
			return outcome.ok
				? applied(outcome.state, outcome.effects)
				: rejected(`${outcome.code}: ${outcome.detail}`)
		},
	},
	{
		id: 'quarantine-lg03',
		label: 'Cuarentenar LG03',
		apply: (state) => {
			const outcome = applyTalentoAndino(state as TaState, {
				kind: 'inventory',
				action: 'quarantine',
				id: 'LG03',
			})
			return outcome.ok
				? applied(outcome.state, outcome.effects)
				: rejected(`${outcome.code}: ${outcome.detail}`)
		},
	},
	{
		id: 'migrate-lg01',
		label: 'Migrar LG01',
		apply: (state) => {
			const outcome = applyTalentoAndino(state as TaState, {
				kind: 'inventory',
				action: 'migrate',
				id: 'LG01',
			})
			return outcome.ok
				? applied(outcome.state, outcome.effects)
				: rejected(`${outcome.code}: ${outcome.detail}`)
		},
	},
]

const AL_CONTROLS: readonly ExerciseControl[] = [
	{
		id: 'guard',
		label: 'Guard',
		options: options([
			'ui_only',
			'cancel_only',
			'session_only',
			'request_roles',
			'server_roles',
		]),
		current: (state) => (state as AlState).config.guard,
		apply: (state, value) => applyAlControl(state, 'guard', value),
	},
	{
		id: 'maintenanceBypass',
		label: 'Bypass de mantenimiento',
		options: options(['true', 'false']),
		current: (state) => String((state as AlState).config.maintenanceBypass),
		apply: (state, value) =>
			applyAlControl(state, 'maintenanceBypass', value === 'true'),
	},
	{
		id: 'adminIngress',
		label: 'Ingreso administrativo',
		options: options(['public_and_ops', 'ops_only', 'closed']),
		current: (state) => (state as AlState).config.adminIngress,
		apply: (state, value) => applyAlControl(state, 'adminIngress', value),
	},
	{
		id: 'adminService',
		label: 'Servicio administrativo',
		options: options(['true', 'false']),
		current: (state) => String((state as AlState).config.adminService),
		apply: (state, value) =>
			applyAlControl(state, 'adminService', value === 'true'),
	},
	{
		id: 'publicTracking',
		label: 'Seguimiento público',
		options: options(['true', 'false']),
		current: (state) => String((state as AlState).config.publicTracking),
		apply: (state, value) =>
			applyAlControl(state, 'publicTracking', value === 'true'),
	},
]

function applyAlControl(
	state: unknown,
	field:
		| 'guard'
		| 'maintenanceBypass'
		| 'adminIngress'
		| 'adminService'
		| 'publicTracking',
	value: string | boolean,
): AdapterResult {
	const outcome = applyAndeanLogix(state as AlState, {
		kind: 'configure',
		field,
		value,
	})
	return outcome.ok
		? applied(outcome.state, outcome.effects)
		: rejected(`${outcome.code}: ${outcome.detail}`)
}

const AL_ACTIONS: readonly ExerciseAction[] = [
	{
		id: 'maintenance-on',
		label: 'Activar ventana de mantenimiento',
		apply: (state) => {
			const outcome = applyAndeanLogix(state as AlState, {
				kind: 'set_maintenance',
				value: true,
			})
			return outcome.ok
				? applied(outcome.state, outcome.effects)
				: rejected(`${outcome.code}: ${outcome.detail}`)
		},
	},
	{
		id: 'maintenance-off',
		label: 'Cerrar ventana de mantenimiento',
		apply: (state) => {
			const outcome = applyAndeanLogix(state as AlState, {
				kind: 'set_maintenance',
				value: false,
			})
			return outcome.ok
				? applied(outcome.state, outcome.effects)
				: rejected(`${outcome.code}: ${outcome.detail}`)
		},
	},
]

const NA_CONTROLS: readonly ExerciseControl[] = [
	{
		id: 'diff',
		label: 'Diff de restauración',
		options: options(['N0', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6']),
		current: (state) => (state as NdState).diff,
		apply: (state, value) => {
			const outcome = applyNubeAndina(state as NdState, {
				kind: 'select_diff',
				diff: value as NdState['diff'],
			})
			return outcome.ok
				? applied(outcome.state, outcome.effects)
				: rejected(`${outcome.code}: ${outcome.detail}`)
		},
	},
	{
		id: 'commit',
		label: 'Modo de publicación',
		options: options(['eager', 'staged']),
		current: (state) => (state as NdState).commit,
		apply: (state, value) => {
			const outcome = applyNubeAndina(state as NdState, {
				kind: 'select_commit',
				commit: value as NdState['commit'],
			})
			return outcome.ok
				? applied(outcome.state, outcome.effects)
				: rejected(`${outcome.code}: ${outcome.detail}`)
		},
	},
]

const BV_CONTROLS: readonly ExerciseControl[] = (
	[
		['constructor', CONSTRUCTOR_VALUES],
		['actorSource', ACTOR_VALUES],
		['validation', VALIDATION_VALUES],
		['errorPolicy', ERROR_VALUES],
		['dbRole', ROLE_VALUES],
	] as const
).map(([field, values]) => ({
	id: field,
	label: field,
	options: options(values),
	current: (state) => (state as BibliotecaVivaState).config[field],
	apply: (state, value) => {
		const outcome = applyBibliotecaViva(state as BibliotecaVivaState, {
			kind: 'set_control',
			control: field,
			value,
		})
		return outcome.ok
			? applied(outcome.state, outcome.effects)
			: rejected(`${outcome.code}: ${outcome.detail}`)
	},
}))

const ADAPTERS: Readonly<Record<string, ExerciseAdapter>> = {
	'cwe-321-andinapay': {
		caseId: 'cwe-321-andinapay',
		initialState: createAndinaPayState,
		controls: [],
		actions: ANDINAPAY_ACTIONS,
		verify: async (state) => ({
			kind: 'ok',
			report: await verifyAndinaPay(state as AndinaPayState),
		}),
	},
	'cwe-89-bibliotecaviva': {
		caseId: 'cwe-89-bibliotecaviva',
		initialState: createBibliotecaVivaState,
		controls: BV_CONTROLS,
		actions: [],
		verify: async () => ({
			kind: 'unavailable',
			reason:
				'El banco SQL necesita el motor SQLite/WASM en un Worker; las comprobaciones se ejecutan en las pruebas del paquete con SQLite real.',
		}),
	},
	'cwe-434-talentoandino': {
		caseId: 'cwe-434-talentoandino',
		initialState: createTalentoAndinoState,
		controls: TA_CONTROLS,
		actions: TA_ACTIONS,
		verify: async (state) => ({
			kind: 'ok',
			report: verifyTalentoAndino(state as TaState),
		}),
	},
	'cwe-306-andeanlogix': {
		caseId: 'cwe-306-andeanlogix',
		initialState: createAndeanLogixState,
		controls: AL_CONTROLS,
		actions: AL_ACTIONS,
		verify: async (state) => ({
			kind: 'ok',
			report: verifyAndeanLogix(state as AlState),
		}),
	},
	'cwe-502-nubeandina': {
		caseId: 'cwe-502-nubeandina',
		initialState: createNubeAndinaState,
		controls: NA_CONTROLS,
		actions: [],
		verify: async (state) => ({
			kind: 'ok',
			report: await verifyNubeAndina(state as NdState),
		}),
	},
}

export function adapterFor(
	caseId: string,
	dependencies: AdapterDependencies = {},
): ExerciseAdapter | undefined {
	const base = ADAPTERS[caseId]
	if (!base) return undefined
	const verifySql = dependencies.verifySql
	if (caseId === 'cwe-89-bibliotecaviva' && verifySql) {
		return {
			...base,
			verify: async (state) => verifySql((state as BibliotecaVivaState).config),
		}
	}
	return base
}
