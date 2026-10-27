import {
	type AlConfig,
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
	type BibliotecaVivaConfig,
	createBibliotecaVivaState,
} from './bibliotecaviva/model.js'
import type { ExerciseReport } from './core.js'
import { createNubeAndinaState, verifyNubeAndina } from './nubeandina/model.js'
import {
	applyTalentoAndino,
	createTalentoAndinoState,
	type TaPolicy,
	type TaState,
	verifyTalentoAndino,
} from './talentoandino/model.js'

export type ExerciseRuntime = 'browser' | 'worker'

export interface ExerciseIndexEntry {
	readonly caseId: string
	readonly cwe: string
	readonly title: string
	readonly summary: string
	readonly runtime: ExerciseRuntime
	readonly reason?: string
}

export const EXERCISE_INDEX: readonly ExerciseIndexEntry[] = [
	{
		caseId: 'cwe-321-andinapay',
		cwe: 'CWE-321',
		title: 'AndinaPay — clave de cifrado expuesta',
		summary:
			'Una clave de una versión anterior permite leer dos registros operativos. Recuperación con AES-256-GCM real sobre material público.',
		runtime: 'browser',
	},
	{
		caseId: 'cwe-89-bibliotecaviva',
		cwe: 'CWE-89',
		title: 'BibliotecaViva — consultas del historial',
		summary:
			'El filtro del buscador se ensambla como texto. El banco ejecuta SQLite real dentro de un Worker aislado.',
		runtime: 'worker',
		reason:
			'El banco SQL necesita el motor SQLite/WASM en un Worker; el verificador se ejecuta en las pruebas del paquete con SQLite real.',
	},
	{
		caseId: 'cwe-434-talentoandino',
		cwe: 'CWE-434',
		title: 'TalentoAndino — admisión de archivos',
		summary:
			'Catálogo inerte de cargas, cuarentena y entrega mediada. La firma y el MIME declarado no prueban legitimidad.',
		runtime: 'browser',
	},
	{
		caseId: 'cwe-306-andeanlogix',
		cwe: 'CWE-306',
		title: 'AndeanLogix — funciones administrativas',
		summary:
			'Matriz de 144 peticiones sobre seis identidades, dos redes y dos modos de mantenimiento. La identidad viene del registro del servidor.',
		runtime: 'browser',
	},
	{
		caseId: 'cwe-502-nubeandina',
		cwe: 'CWE-502',
		title: 'NubeAndina — restauración de sesiones',
		summary:
			'Documentos S01–S08 con Base64 y HMAC-SHA256 reales. La autoridad del cliente no se acepta y la publicación debe ser atómica.',
		runtime: 'browser',
	},
]

export const BIBLIOTECAVIVA_REFERENCE: BibliotecaVivaConfig = {
	constructor: 'named',
	actorSource: 'session',
	validation: 'typed',
	errorPolicy: 'public_id',
	dbRole: 'history_readonly',
}

export const TALENTOANDINO_REFERENCE: TaPolicy = {
	validation: 'V2',
	size: 'L1',
	name: 'N1',
	storage: 'S1',
	delivery: 'D1',
	publication: 'P1',
}

export const ANDEANLOGIX_REFERENCE: AlConfig = {
	guard: 'server_roles',
	maintenanceBypass: false,
	adminIngress: 'ops_only',
	adminService: true,
	publicTracking: true,
}

async function andinapayReference(): Promise<AndinaPayState> {
	let state = createAndinaPayState()
	const steps = [
		{ kind: 'submit_diagnosis' as const, text: 'Clave histórica expuesta.' },
		{ kind: 'stage_key' as const, keyId: 'recovery-v2' },
		{
			kind: 'set_key_source' as const,
			source: 'restricted-key-service' as const,
		},
		{ kind: 'rekey_records' as const, records: ['R01', 'R02'] as const },
		{ kind: 'commit_recovery' as const },
		{
			kind: 'configure_prevention' as const,
			scope: 'history-and-new-diff' as const,
			exceptionPolicy: 'review-required' as const,
		},
	]
	for (const step of steps) {
		const outcome = await applyAndinaPay(state, step)
		if (!outcome.ok) throw new Error(`${step.kind}: ${outcome.code}`)
		state = outcome.state
	}
	return state
}

function talentoAndinoReference(): TaState {
	let state = createTalentoAndinoState(TALENTOANDINO_REFERENCE)
	for (const command of [
		{ kind: 'inventory' as const, action: 'quarantine' as const, id: 'LG02' },
		{ kind: 'inventory' as const, action: 'quarantine' as const, id: 'LG03' },
		{ kind: 'inventory' as const, action: 'migrate' as const, id: 'LG01' },
	]) {
		const outcome = applyTalentoAndino(state, command)
		if (!outcome.ok) throw new Error(outcome.code)
		state = outcome.state
	}
	return state
}

export type ExerciseRunResult =
	| { readonly kind: 'ok'; readonly report: ExerciseReport }
	| { readonly kind: 'unavailable'; readonly reason: string }

export async function runExercise(
	caseId: string,
	mode: 'initial' | 'reference',
): Promise<ExerciseRunResult> {
	switch (caseId) {
		case 'cwe-321-andinapay':
			return {
				kind: 'ok',
				report: await verifyAndinaPay(
					mode === 'reference'
						? await andinapayReference()
						: createAndinaPayState(),
				),
			}
		case 'cwe-89-bibliotecaviva': {
			const entry = EXERCISE_INDEX.find((item) => item.caseId === caseId)
			return {
				kind: 'unavailable',
				reason:
					entry?.reason ??
					'El banco SQL requiere el motor SQLite/WASM en un Worker.',
			}
		}
		case 'cwe-434-talentoandino':
			return {
				kind: 'ok',
				report: verifyTalentoAndino(
					mode === 'reference'
						? talentoAndinoReference()
						: createTalentoAndinoState(),
				),
			}
		case 'cwe-306-andeanlogix':
			return {
				kind: 'ok',
				report: verifyAndeanLogix(
					createAndeanLogixState(
						mode === 'reference' ? ANDEANLOGIX_REFERENCE : undefined,
					),
				),
			}
		case 'cwe-502-nubeandina':
			return {
				kind: 'ok',
				report: await verifyNubeAndina(
					createNubeAndinaState(
						mode === 'reference' ? 'N6' : 'N0',
						mode === 'reference' ? 'staged' : 'eager',
					),
				),
			}
		default:
			return {
				kind: 'unavailable',
				reason: `Caso no registrado: ${caseId}`,
			}
	}
}

export function initialBibliotecaVivaConfig(): BibliotecaVivaConfig {
	return createBibliotecaVivaState().config
}
