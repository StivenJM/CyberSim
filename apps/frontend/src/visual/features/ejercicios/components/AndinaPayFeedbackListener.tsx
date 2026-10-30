import { useEffect } from 'react'

import {
	EventosPublicos,
	TipoLogGeneral,
} from '../../../../shared/types/EventosEnums'
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext'
import { andinaPayFase1Key, readAndinaPayState } from './AndinaPayCaseWorkspace'

/**
 * Feedback didáctico al reanudar el reloj.
 *
 * El estudiante lee la notificación, hace la tarea mientras el tiempo está
 * pausado y pulsa Reanudar. En ese momento recibe un log con el estado del
 * siguiente hito, sin convertir el caso en un fallo por reflejos.
 */
export default function AndinaPayFeedbackListener() {
	const { escenarioController } = useECSSceneContext()

	useEffect(() => {
		const unsubscribe = escenarioController.on(
			EventosPublicos.TIEMPO_REANUDADO,
			() => {
				const state = readAndinaPayState()
				const fase1 = localStorage.getItem(andinaPayFase1Key()) === '1'

				if (state?.reportSubmitted) {
					escenarioController.registrarLogDeCaso(
						'Bien: informe enviado. El caso está cerrado; revisa la exposición residual.',
						false,
						TipoLogGeneral.COMPLETADO,
					)
					return
				}
				if (
					state?.writerKey === 'recovery-v2' &&
					state.retiredKeys.includes('legacy-demo')
				) {
					escenarioController.registrarLogDeCaso(
						'Bien: recuperación publicada y legacy-demo retirada. Ejecuta B/Q/C y envía el informe.',
						false,
						TipoLogGeneral.COMPLETADO,
					)
					return
				}
				if (state?.sealedDiagnosis) {
					escenarioController.registrarLogDeCaso(
						'Bien: D1 sellado. Prepara K2, migra R01/R02 y publica la recuperación.',
						false,
						TipoLogGeneral.COMPLETADO,
					)
					return
				}
				if (fase1) {
					escenarioController.registrarLogDeCaso(
						'Bien: localizaste la clave histórica. Pruébala en el Banco criptográfico y completa D1.',
						false,
						TipoLogGeneral.COMPLETADO,
					)
					return
				}
				escenarioController.registrarLogDeCaso(
					'Aún no: abre el aviso y la versión H1, y pulsa el botón de confirmación.',
					false,
					TipoLogGeneral.ADVERTENCIA,
				)
			},
		)
		return unsubscribe
	}, [escenarioController])

	return null
}
