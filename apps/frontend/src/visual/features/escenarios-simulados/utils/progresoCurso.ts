import type { EscenarioPreview } from '../../../../shared/types/EscenarioTypes'
import type { ProgresoEscenario } from '../contexts/ProgresoEstudianteContext'

export type EstadoNivel = 'done' | 'active' | 'available'

export interface ProgresoCurso {
	completados: number
	enProgreso: number
	pendientes: number
	total: number
	porcentaje: number
}

/**
 * Un escenario está completado si algún intento terminó; está en progreso si hay
 * intentos sin terminar. Cualquier otro caso queda pendiente.
 */
export function estadoDeEscenario(
	slug: string,
	progresos: ProgresoEscenario[],
): EstadoNivel {
	let tieneIntentos = false
	for (const progreso of progresos) {
		if (progreso.slug_escenario !== slug) continue
		if (progreso.terminado) return 'done'
		tieneIntentos = true
	}
	return tieneIntentos ? 'active' : 'available'
}

export function resumenProgreso(
	escenarios: EscenarioPreview[],
	progresos: ProgresoEscenario[],
): ProgresoCurso {
	let completados = 0
	let enProgreso = 0

	for (const escenario of escenarios) {
		const estado = estadoDeEscenario(escenario.slug, progresos)
		if (estado === 'done') completados++
		else if (estado === 'active') enProgreso++
	}

	return {
		completados,
		enProgreso,
		pendientes: escenarios.length - completados - enProgreso,
		total: escenarios.length,
		porcentaje:
			escenarios.length > 0
				? Math.round((completados / escenarios.length) * 100)
				: 0,
	}
}
