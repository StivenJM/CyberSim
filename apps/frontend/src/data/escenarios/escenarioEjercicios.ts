import type { InvestigatedCaseId } from '@cybersim/scenario-contract'

import { defineScenario } from '../../scenarios/defineScenario'
import {
	AccionesRealizables,
	ObjetosManejables,
} from '../../shared/types/AccionesEnums'
import {
	EstadoAtaqueDispositivo,
	Mueble,
	TipoDispositivo,
	TipoEvento,
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
		dispositivo: 'PC Analista',
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

const ANDINAPAY_OBJETIVOS = [
	['Leer el aviso y localizar la clave histórica en la versión H1'],
	['Sellar el diagnóstico provisional con dos evidencias'],
	['Migrar R01/R02 a recovery-v2 y retirar legacy-demo'],
	['Verificar B/Q/C y enviar el informe'],
] as const

const ANDINAPAY_AVISO_INFO = {
	accion: AccionesRealizables.CLICK,
	objeto: ObjetosManejables.CONFIG_FIREWALL,
	val: {},
}

const ANDINAPAY_EVENTOS = [
	{
		nombreEvento: 'Aviso recibido',
		tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
		tiempoNotificacion: 5,
		tiempoEnOcurrir: 999999,
		descripcion:
			'08:30 — Aviso anónimo recibido en el canal de soporte. Hay un expediente nuevo en el PC del analista; ábrelo desde el monitor.',
		fase: 1,
		infoAdicional: ANDINAPAY_AVISO_INFO,
	},
	{
		nombreEvento: 'Revisar historial',
		tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
		tiempoNotificacion: 10,
		tiempoEnOcurrir: 999999,
		descripcion:
			'Busca la clave que quedó en la versión H1 del repositorio y compárala con la versión actual.',
		fase: 1,
		infoAdicional: ANDINAPAY_AVISO_INFO,
	},
	{
		nombreEvento: 'Probar clave',
		tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
		tiempoNotificacion: 15,
		tiempoEnOcurrir: 999999,
		descripcion:
			'Prueba la clave candidata en el Banco criptográfico y compara el resultado con el fragmento del aviso.',
		fase: 2,
		infoAdicional: ANDINAPAY_AVISO_INFO,
	},
	{
		nombreEvento: 'Escribir D1',
		tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
		tiempoNotificacion: 20,
		tiempoEnOcurrir: 999999,
		descripcion:
			'Escribe D1: qué encontraste, dos evidencias, una explicación rival, una prueba y lo que no sabes.',
		fase: 2,
		infoAdicional: ANDINAPAY_AVISO_INFO,
	},
	{
		nombreEvento: 'Preparar recuperación',
		tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
		tiempoNotificacion: 25,
		tiempoEnOcurrir: 999999,
		descripcion:
			'Prepara la recuperación en Respuesta de claves: K2, custodia restringida, recifrado y publicación.',
		fase: 3,
		infoAdicional: ANDINAPAY_AVISO_INFO,
	},
	{
		nombreEvento: 'Verificar e informar',
		tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
		tiempoNotificacion: 30,
		tiempoEnOcurrir: 999999,
		descripcion:
			'Ejecuta B/Q/C y envía el informe; documenta qué sigue expuesto y qué no puedes demostrar.',
		fase: 4,
		infoAdicional: ANDINAPAY_AVISO_INFO,
	},
]

function dispositivoDeCaso(
	id: number,
	tipo: TipoDispositivo,
	nombre: string,
	software: string,
	posicion: { x: number; y: number; z: number; rotacionY: number },
	redes: string[],
	extra: Record<string, unknown> = {},
) {
	return {
		id,
		tipo,
		nombre,
		sistemaOperativo:
			tipo === TipoDispositivo.ROUTER ? 'Cisco IOS' : 'CyberSim Lab',
		hardware:
			tipo === TipoDispositivo.SERVER
				? 'Servidor de laboratorio'
				: tipo === TipoDispositivo.ROUTER
					? 'Router de laboratorio'
					: 'Estación de laboratorio',
		software,
		posicion,
		estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
		activos: [],
		redes,
		...extra,
	}
}

function definitionOf(seed: ExerciseSeed): DefinicionEscenario {
	const isAndinaPay = seed.caseId === 'cwe-321-andinapay'
	const redes = isAndinaPay
		? [
				{ nombre: 'LAB', color: ColoresRed.CIAN },
				{ nombre: 'Internet', color: ColoresRed.ROJO },
			]
		: [{ nombre: 'LAB', color: ColoresRed.CIAN }]

	const espacios = isAndinaPay
		? [
				{
					id: 1,
					mueble: Mueble.MESA,
					posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
					dispositivos: [
						dispositivoDeCaso(
							seed.id * 100,
							TipoDispositivo.WORKSTATION,
							seed.dispositivo,
							'Expediente, banco y verificador',
							{ x: 0, y: 0, z: 0, rotacionY: 0 },
							['LAB'],
						),
					],
				},
				{
					id: 2,
					mueble: Mueble.LIBRE,
					posicion: { x: -2.5, y: 0, z: 0, rotacionY: 0 },
					dispositivos: [
						dispositivoDeCaso(
							seed.id * 100 + 1,
							TipoDispositivo.SERVER,
							'Servidor de Datos',
							'Base de datos de registros',
							{ x: -2.5, y: 0, z: 0, rotacionY: 180 },
							['LAB'],
						),
					],
				},
				{
					id: 3,
					mueble: Mueble.LIBRE,
					posicion: { x: 2.5, y: 0, z: 0, rotacionY: 0 },
					dispositivos: [
						dispositivoDeCaso(
							seed.id * 100 + 2,
							TipoDispositivo.SERVER,
							'Servidor de Claves',
							'Servicio de claves y custodia',
							{ x: 2.5, y: 0, z: 0, rotacionY: 0 },
							['LAB'],
						),
					],
				},
				{
					id: 4,
					mueble: Mueble.RACK,
					posicion: { x: 3, y: 0, z: 2.5, rotacionY: 0 },
					dispositivos: [
						dispositivoDeCaso(
							seed.id * 100 + 3,
							TipoDispositivo.ROUTER,
							'Router de la Oficina',
							'Routing, Firewall',
							{ x: 3, y: 0, z: 2.5, rotacionY: 0 },
							['LAB', 'Internet'],
							{ conectadoAInternet: true },
						),
					],
				},
			]
		: [
				{
					id: 1,
					mueble: Mueble.MESA,
					posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
					dispositivos: [
						dispositivoDeCaso(
							seed.id * 100,
							TipoDispositivo.WORKSTATION,
							seed.dispositivo,
							'Expediente, banco y verificador',
							{ x: 0, y: 0, z: 0, rotacionY: 0 },
							['LAB'],
						),
					],
				},
			]

	return {
		id: seed.id,
		slug: seed.slug,
		titulo: seed.titulo,
		categoria: 'Conjunto 2.0 · Ejercicios investigados',
		descripcion: seed.descripcion,
		presupuestoInicial: 0,
		ataques: [],
		eventos: isAndinaPay ? [...ANDINAPAY_EVENTOS] : [],
		accionesEsperadas: [],
		fases: seed.fases.map((nombre, index) => ({
			id: index + 1,
			nombre,
			descripcion: isAndinaPay
				? ([
						'Abre el expediente en el PC del analista y revisa el aviso, los logs y el inventario.',
						'Entrega un diagnóstico provisional con dos evidencias citadas y una predicción comprobable.',
						'Prepara recovery-v2, migra R01/R02, publica y retira legacy-demo.',
						'Ejecuta B/Q/C y envía el informe con los límites de la copia histórica.',
					][index] ?? nombre)
				: nombre,
			faseActual: index === 0,
			completada: false,
			objetivos: isAndinaPay
				? (ANDINAPAY_OBJETIVOS[index] ?? []).map((descripcion) => ({
						descripcion,
						completado: false,
					}))
				: [],
		})),
		zonas: [
			{
				id: 1,
				nombre: seed.zona,
				dominio: 'lab.invalid',
				redes,
				personas: [],
				oficinas: [
					{
						id: seed.id * 10,
						nombre: 'Estación de Análisis',
						posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
						espacios,
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
