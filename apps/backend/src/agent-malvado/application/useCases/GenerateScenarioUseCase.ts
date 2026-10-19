import type {
	ScenarioGenerationRequest,
	ScenarioGenerationResponse,
} from '../../domain/models/ScenarioBuilderDTOs.js'
import type { IScenarioBuilderRepository } from '../../domain/repositories/IScenarioBuilderRepository.js'

// biome-ignore lint/suspicious/noExplicitAny: External scenario payloads are normalized before use.
type ScenarioData = Record<string, any>

// Valores válidos del enum TipoEvento (deben coincidir con DeviceEnums.ts del frontend)
const TIPO_EVENTO_VALIDOS = [
	'Envío de activo',
	'Tráfico de red',
	'Conexión VPN',
	'n/a',
	'Completación de fase',
	'Completación de escenario',
	'Verificación de firma',
	'Verificación de acciones de un jugador en la simulación',
	'Envío de correo',
]

export class GenerateScenarioUseCase {
	constructor(private readonly repository: IScenarioBuilderRepository) {}

	async execute(
		request: ScenarioGenerationRequest,
	): Promise<ScenarioGenerationResponse> {
		if (!request.prompt || request.prompt.trim() === '') {
			return { success: false, data: null, error: 'Prompt cannot be empty' }
		}

		const result = await this.repository.generate(request)

		// BLINDAJE TÉCNICO V13: Validación y sanitización completa del JSON
		if (result.success && result.data) {
			try {
				const scenario: ScenarioData = Array.isArray(result.data)
					? result.data[0]
					: result.data
				const errores: string[] = []

				// 1. Validar campos requeridos del escenario
				if (!scenario.titulo && !scenario.titulo_escenario) {
					errores.push(
						'El escenario debe tener un "titulo" o "titulo_escenario"',
					)
				}
				if (
					!scenario.zonas ||
					!Array.isArray(scenario.zonas) ||
					scenario.zonas.length === 0
				) {
					errores.push('El escenario debe tener al menos una zona')
				}

				// 2. Validar y normalizar fases
				if (scenario.fases && Array.isArray(scenario.fases)) {
					scenario.fases.forEach((f: ScenarioData, idx: number) => {
						// Coerción de tipos
						f.id = Number(f.id) || idx + 1
						if (f.faseActual === undefined) f.faseActual = idx === 0
						if (f.completada === undefined) f.completada = false

						// Validar campos requeridos
						if (!f.nombre && !f.titulo_desafio) {
							f.nombre = `Fase ${idx + 1}`
							errores.push(`Fase ${f.id} sin nombre, se asignó default`)
						}
					})
				}

				// 3. Validar y normalizar eventos
				if (scenario.eventos && Array.isArray(scenario.eventos)) {
					scenario.eventos.forEach((ev: ScenarioData, idx: number) => {
						// Coerción de tipos numéricos
						ev.fase = Number(ev.fase) || 1
						ev.tiempoNotificacion = Number(ev.tiempoNotificacion) || idx * 15

						// Validar tipoEvento contra enum
						if (ev.tipoEvento) {
							const tipoNormalizado = TIPO_EVENTO_VALIDOS.find(
								(v) =>
									v.toLowerCase() ===
									String(ev.tipoEvento).toLowerCase().trim(),
							)
							if (tipoNormalizado) {
								ev.tipoEvento = tipoNormalizado
							} else {
								errores.push(
									`Evento "${ev.nombreEvento}" tiene tipoEvento inválido: "${ev.tipoEvento}"`,
								)
								ev.tipoEvento = 'n/a'
							}
						}

						// Validar campos requeridos
						if (!ev.nombreEvento) {
							ev.nombreEvento = `Evento ${idx + 1}`
							errores.push(`Evento ${idx + 1} sin nombreEvento`)
						}
						if (!ev.descripcion) {
							ev.descripcion = ev.nombreEvento
						}
					})
				}

				// 4. Validar y normalizar ataques
				if (scenario.ataques && Array.isArray(scenario.ataques)) {
					scenario.ataques.forEach((atk: ScenarioData, idx: number) => {
						// Coerción de tipos numéricos
						atk.fase = Number(atk.fase) || 1
						atk.tiempoNotificacion = Number(atk.tiempoNotificacion) || idx * 15

						// Validar campos requeridos
						if (!atk.nombreAtaque) {
							atk.nombreAtaque = `Ataque ${idx + 1}`
							errores.push(`Ataque ${idx + 1} sin nombreAtaque`)
						}
						if (!atk.dispositivoAAtacar) {
							errores.push(
								`Ataque "${atk.nombreAtaque}" no tiene dispositivoAAtacar`,
							)
						}
						if (!atk.descripcion) {
							atk.descripcion = atk.nombreAtaque
						}

						// Normalizar condicionMitigacion
						if (
							atk.condicionMitigacion?.val &&
							!Array.isArray(atk.condicionMitigacion.val)
						) {
							atk.condicionMitigacion.val = [atk.condicionMitigacion.val]
						}
					})
				}

				// 5. Validar zonas y dispositivos
				if (scenario.zonas && Array.isArray(scenario.zonas)) {
					scenario.zonas.forEach((zona: ScenarioData) => {
						if (!zona.id) zona.id = Math.floor(Math.random() * 1000)
						if (!zona.nombre) zona.nombre = 'Zona sin nombre'

						zona.oficinas = zona.oficinas || []
						zona.oficinas.forEach((ofi: ScenarioData) => {
							ofi.espacios = ofi.espacios || []
							ofi.espacios.forEach((esp: ScenarioData) => {
								esp.dispositivos = esp.dispositivos || []
								esp.dispositivos.forEach((disp: ScenarioData) => {
									if (!disp.id) disp.id = Math.floor(Math.random() * 10000)
									if (!disp.nombre) disp.nombre = 'Dispositivo sin nombre'
									if (!disp.tipo) disp.tipo = 'workstation'
									disp.estadoAtaque = 'normal'
								})
							})
						})
					})
				}

				// 6. Verificar que existan eventos COMPLETACION_FASE
				if (scenario.fases && Array.isArray(scenario.fases)) {
					const eventosCierre =
						scenario.eventos?.filter(
							(e: ScenarioData) =>
								e.tipoEvento === 'Completación de fase' ||
								e.tipoEvento === 'Completación de escenario',
						) || []

					if (eventosCierre.length < scenario.fases.length) {
						scenario.fases.forEach((fase: ScenarioData, idx: number) => {
							const faseTieneCierre = scenario.eventos?.some(
								(e: ScenarioData) => {
									const esCierre =
										e.tipoEvento === 'Completación de fase' ||
										e.tipoEvento === 'Completación de escenario'
									return esCierre && Number(e.fase) === fase.id
								},
							)

							if (!faseTieneCierre) {
								const esUltima = idx === scenario.fases.length - 1
								scenario.eventos.push({
									nombreEvento: esUltima
										? 'Escenario Completado'
										: `Fase ${fase.id} Completada`,
									tipoEvento: esUltima
										? 'Completación de escenario'
										: 'Completación de fase',
									descripcion: esUltima
										? '¡Has completado todos los objetivos del escenario!'
										: `Fase ${fase.id} completada.`,
									fase: fase.id,
									tiempoNotificacion: 999,
									infoAdicional: { esObjetivo: false },
								})
							}
						})
					}
				}

				// Log de advertencias si las hay
				if (errores.length > 0) {
					console.warn('[AgentMalvado] Sanitización del escenario', {
						problemCount: errores.length,
						errors: errores,
					})
				}
			} catch (e) {
				console.error('[AgentMalvado] Error crítico sanitizando escenario:', e)
				return {
					success: false,
					data: null,
					error: 'Error validando el escenario generado',
				}
			}
		}

		return result
	}
}
