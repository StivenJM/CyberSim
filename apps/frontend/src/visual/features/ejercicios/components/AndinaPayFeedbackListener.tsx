import { useEffect } from 'react'

import {
	EventosPublicos,
	TipoLogGeneral,
} from '../../../../shared/types/EventosEnums'
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext'
import {
	andinaPayFase1Key,
	isAndinaPayNoticeRead,
	readAndinaPayState,
} from './AndinaPayCaseWorkspace'

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
				const noticeRead = isAndinaPayNoticeRead()

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
						'Bien: la versión H1 quedó registrada en el expediente. Prueba la clave en el Banco criptográfico y sella D1.',
						false,
						TipoLogGeneral.COMPLETADO,
					)
					return
				}
				if (noticeRead) {
					escenarioController.registrarLogDeCaso(
						'Aún no: en Repositorio abre la versión H1 y pulsa «Adjuntar Versión H1 (histórica) al expediente».',
						false,
						TipoLogGeneral.ADVERTENCIA,
					)
					return
				}
				escenarioController.registrarLogDeCaso(
					'Aún no: abre el expediente en el PC Analista y lee el aviso; después adjunta la versión H1 desde el repositorio.',
					false,
					TipoLogGeneral.ADVERTENCIA,
				)
			},
		)
		return unsubscribe
	}, [escenarioController])

	return null
}
