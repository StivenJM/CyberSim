import { useCallback, useEffect, useRef, useState } from 'react'
import type { EscenarioController } from '../../../../ecs/controllers/EscenarioController'
import { EventosPublicos } from '../../../../shared/types/EventosEnums'

export function useECSTime(escenarioController: EscenarioController) {
	const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)
	const [isPaused, setIsPaused] = useState(false)
	const [bloqueoReanudacion, setBloqueoReanudacion] = useState<string | null>(
		escenarioController.bloqueoReanudacion,
	)
	const tiempoIniciadoRef = useRef(false)

	useEffect(() => {
		const unsubscribeBloqueo = escenarioController.on(
			EventosPublicos.REANUDACION_BLOQUEADA,
			(data: unknown) => {
				const d = data as { motivo: string }
				setBloqueoReanudacion(d.motivo)
			},
		)
		const unsubscribeDesbloqueo = escenarioController.on(
			EventosPublicos.REANUDACION_DESBLOQUEADA,
			() => setBloqueoReanudacion(null),
		)
		return () => {
			unsubscribeBloqueo()
			unsubscribeDesbloqueo()
		}
	}, [escenarioController])

	const iniciar = useCallback(() => {
		if (tiempoIniciadoRef.current) return
		escenarioController.iniciarTiempo()
		tiempoIniciadoRef.current = true
		setIsPaused(escenarioController.estaTiempoPausado())
	}, [escenarioController])

	const pause = useCallback(() => {
		escenarioController.pausarTiempo()
		setIsPaused(true)
	}, [escenarioController])

	const resume = useCallback(() => {
		escenarioController.reanudarTiempo()
		setIsPaused(escenarioController.estaTiempoPausado())
	}, [escenarioController])

	return {
		tiempoTranscurrido,
		setTiempoTranscurrido,
		isPaused,
		setIsPaused,
		bloqueoReanudacion,
		tiempoIniciadoRef,
		iniciar,
		pause,
		resume,
	}
}
