import type { InvestigatedCaseId } from '@cybersim/scenario-contract'

import { defineScenario } from '../../scenarios/defineScenario'
import {
	EstadoAtaqueDispositivo,
	Mueble,
	TipoDispositivo,
} from '../../shared/types/DeviceEnums'
import type { DefinicionEscenario } from '../../shared/types/EscenarioTypes'
import { ColoresRed } from '../colores'

/**
 * Cinco ejercicios investigados del conjunto 2.0.
 *
 * La definición aporta identidad, topología y fases; el modelo de dominio, los
 * verificadores y las vistas viven en `@cybersim/exercises` y en el apartado
 * `/ejercicios`. El manifiesto solo enlaza el caso mediante `exercise`.
 */
interface ExerciseSeed {
	readonly id: number
	readonly caseId: InvestigatedCaseId
	readonly slug: string
	readonly titulo: string
	readonly descripcion: string
	readonly zona: string
	readonly dispositivo: string
	readonly fases: readonly string[]
}

const SEEDS: readonly ExerciseSeed[] = [
	{
		id: 101,
		caseId: 'cwe-321-andinapay',
		slug: 'andinapay-clave-expuesta',
		titulo: 'AndinaPay: clave de una versión anterior',
		descripcion:
			'Una clave retirada del código permite leer dos registros operativos. Reparar la custodia sin perder la copia histórica.',
		zona: 'AndinaPay · Operaciones',
		dispositivo: 'AP-IR-01',
		fases: [
			'Familiarización',
			'Diagnóstico D1',
			'Recuperación de claves',
			'Pruebas e informe',
		],
	},
	{
		id: 102,
		caseId: 'cwe-89-bibliotecaviva',
		slug: 'bibliotecaviva-consultas-seguras',
		titulo: 'BibliotecaViva: consultas del historial',
		descripcion:
			'El filtro del buscador se ensambla como texto y altera el historial de préstamos. Separar datos y código sin romper la búsqueda legítima.',
		zona: 'BibliotecaViva · Estación de Análisis',
		dispositivo: 'BV-IR-01',
		fases: [
			'Familiarización',
			'Diagnóstico D1',
			'Consulta segura',
			'Pruebas e informe',
		],
	},
	{
		id: 103,
		caseId: 'cwe-434-talentoandino',
		slug: 'talentoandino-cargas-seguras',
		titulo: 'TalentoAndino: admisión de archivos',
		descripcion:
			'El portal guarda lo que el candidato sube y lo sirve desde una carpeta pública. Implantar admisión, cuarentena y entrega mediada.',
		zona: 'TalentoAndino · Estación de Análisis',
		dispositivo: 'TA-IR-01',
		fases: [
			'Familiarización',
			'Diagnóstico D1',
			'Admisión y cuarentena',
			'Pruebas e informe',
		],
	},
	{
		id: 104,
		caseId: 'cwe-306-andeanlogix',
		slug: 'andeanlogix-funciones-criticas',
		titulo: 'AndeanLogix: funciones administrativas',
		descripcion:
			'El panel administrativo no comprueba identidad ni permiso en todas sus rutas. Restablecer la matriz de acceso sin bloquear Operaciones.',
		zona: 'AndeanLogix · Estación de Análisis',
		dispositivo: 'AL-IR-01',
		fases: [
			'Familiarización',
			'Diagnóstico D1',
			'Política de acceso',
			'Pruebas e informe',
		],
	},
	{
		id: 105,
		caseId: 'cwe-502-nubeandina',
		slug: 'nubeandina-sesiones-no-confiables',
		titulo: 'NubeAndina: restauración de sesiones',
		descripcion:
			'La restauración reconstruye tipos desde datos del cliente. Verificar integridad, esquema y autoridad antes de publicar.',
		zona: 'NubeAndina · Estación de Análisis',
		dispositivo: 'NA-IR-01',
		fases: [
			'Familiarización',
			'Diagnóstico D1',
			'Restauración segura',
			'Pruebas e informe',
		],
	},
]

function definitionOf(seed: ExerciseSeed): DefinicionEscenario {
	return {
		id: seed.id,
		slug: seed.slug,
		titulo: seed.titulo,
		categoria: 'Conjunto 2.0 · Ejercicios investigados',
		descripcion: seed.descripcion,
		presupuestoInicial: 0,
		ataques: [],
		eventos: [],
		accionesEsperadas: [],
		fases: seed.fases.map((nombre, index) => ({
			id: index + 1,
			nombre,
			descripcion: nombre,
			faseActual: index === 0,
			completada: false,
			objetivos: [],
		})),
		zonas: [
			{
				id: 1,
				nombre: seed.zona,
				dominio: 'lab.invalid',
				redes: [{ nombre: 'LAB', color: ColoresRed.CIAN }],
				personas: [],
				oficinas: [
					{
						id: seed.id * 10,
						nombre: 'Estación de Análisis',
						posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
						espacios: [
							{
								id: 1,
								mueble: Mueble.MESA,
								posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
								dispositivos: [
									{
										id: seed.id * 100,
										tipo: TipoDispositivo.WORKSTATION,
										nombre: seed.dispositivo,
										sistemaOperativo: 'CyberSim Lab',
										hardware: 'Estación de laboratorio',
										software: 'Expediente, banco y verificador',
										posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
										estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
										activos: [],
										redes: ['LAB'],
									},
								],
							},
						],
					},
				],
			},
		],
	}
}

const defined = SEEDS.map((seed) =>
	defineScenario(definitionOf(seed), {
		status: 'published',
		exercise: { caseId: seed.caseId, form: 'A' },
	}),
)

export const escenarioAndinapayClaveExpuesta = defined[0]
export const escenarioBibliotecaVivaConsultas = defined[1]
export const escenarioTalentoAndinoCargas = defined[2]
export const escenarioAndeanLogixFunciones = defined[3]
export const escenarioNubeAndinaSesiones = defined[4]
