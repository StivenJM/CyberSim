import { useEffect } from 'react'

import {
	EventosPublicos,
	TipoLogGeneral,
} from '../../../../shared/types/EventosEnums'
import { useEscenario } from '../../../common/contexts'
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext'
import {
	andinaPayFase1Key,
	isAndinaPayNoticeRead,
	readAndinaPayState,
} from './AndinaPayCaseWorkspace'

function pendingStep(
	state: ReturnType<typeof readAndinaPayState>,
	elapsed: number,
	noticeRead: boolean,
	fase1: boolean,
): string | null {
	if (elapsed >= 30) {
		return state?.reportSubmitted ? null : 'Ejecuta B/Q/C y envía el informe'
	}
	if (elapsed >= 25) {
		return state?.writerKey === 'recovery-v2' &&
			state.retiredKeys.includes('legacy-demo')
			? null
			: 'Publica la recuperación y retira legacy-demo'
	}
	if (elapsed >= 20) {
		return state?.sealedDiagnosis ? null : 'Sella el diagnóstico D1'
	}
	if (elapsed >= 10) {
		return fase1 ? null : 'Adjunta la versión H1 al expediente'
	}
	if (elapsed >= 5) {
		return noticeRead ? null : 'Abre el expediente y lee el aviso'
	}
	return null
}

function completedStep(
	state: ReturnType<typeof readAndinaPayState>,
	noticeRead: boolean,
	fase1: boolean,
): string {
	if (state?.reportSubmitted) {
		return 'Bien: informe enviado. El caso está cerrado; revisa la exposición residual.'
	}
	if (
		state?.writerKey === 'recovery-v2' &&
		state.retiredKeys.includes('legacy-demo')
	) {
		return 'Bien: recuperación publicada y legacy-demo retirada. Ejecuta B/Q/C y envía el informe.'
	}
	if (state?.sealedDiagnosis) {
		return 'Bien: D1 sellado. Prepara K2, migra R01/R02 y publica la recuperación.'
	}
	if (fase1) {
		return 'Bien: la versión H1 quedó registrada en el expediente. Prueba la clave en el Banco criptográfico y sella D1.'
	}
	if (noticeRead) {
		return 'Bien: leíste el aviso. Sigue con la versión H1 del repositorio.'
	}
	return 'Bien: el paso quedó registrado.'
}

/**
 * Coordina el reloj con el avance real del caso AndinaPay.
 *
 * Mientras una notificación mantiene el reloj pausado, el botón Reanudar
 * permanece bloqueado hasta que el estudiante completa el paso que esa
 * notificación propone. Así el siguiente aviso no llega antes de tiempo y la
 * secuencia aviso → tarea → reanudar → feedback se mantiene coordinada.
 */
export default function AndinaPayFeedbackListener() {
	const { escenarioController } = useECSSceneContext()
	const { escenario } = useEscenario()
	const isAndinaPay = escenario?.exercise?.caseId === 'cwe-321-andinapay'

	useEffect(() => {
		if (!isAndinaPay) return undefined

		const evaluate = (transcurrido?: number) => {
			const motivo = pendingStep(
				readAndinaPayState(),
				Math.ceil(transcurrido ?? escenarioController.tiempoTranscurrido),
				isAndinaPayNoticeRead(),
				localStorage.getItem(andinaPayFase1Key()) === '1',
			)
			if (motivo) {
				escenarioController.bloquearReanudacion(motivo)
			} else {
				escenarioController.desbloquearReanudacion()
			}
			return motivo
		}

		const unsubscribePausa = escenarioController.on(
			EventosPublicos.TIEMPO_PAUSADO,
			(data: unknown) => {
				const d = data as { transcurrido?: number }
				evaluate(d.transcurrido)
			},
		)

		const unsubscribeReanudado = escenarioController.on(
			EventosPublicos.TIEMPO_REANUDADO,
			(data: unknown) => {
				const d = data as { transcurrido?: number }
				const motivo = evaluate(d.transcurrido)
				if (motivo) {
					escenarioController.registrarLogDeCaso(
						`Aún no: ${motivo}.`,
						false,
						TipoLogGeneral.ADVERTENCIA,
					)
					escenarioController.pausarTiempo()
					return
				}
				escenarioController.registrarLogDeCaso(
					completedStep(
						readAndinaPayState(),
						isAndinaPayNoticeRead(),
						localStorage.getItem(andinaPayFase1Key()) === '1',
					),
					false,
					TipoLogGeneral.COMPLETADO,
				)
			},
		)

		evaluate()

		return () => {
			unsubscribePausa()
			unsubscribeReanudado()
			escenarioController.desbloquearReanudacion()
		}
	}, [escenarioController, isAndinaPay])

	return null
}
