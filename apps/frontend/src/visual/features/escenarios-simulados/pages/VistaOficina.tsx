import { useEffect, useMemo, useRef } from 'react'
import MonitorDesktopOverlay from '../../../common/components/MonitorDesktopOverlay'
import { useEscenario } from '../../../common/contexts'
import { useScreenTransition } from '../../../common/contexts/ScreenTransitionContext'
import Escena3D from '../components/Escena3D'
import TarjetaEntidadSeleccionada from '../components/TarjetaEntidadSeleccionada'
import TarjetaZonaActual from '../components/TarjetaZonaActual'
import { useECSSceneContext } from '../context/ECSSceneContext'
import { useZonaKeyboardNav } from '../hooks/useZonaKeyboardNav'
import styles from '../styles/VistaOficina.module.css'

function VistaOficina() {
	const { dispositivoSeleccionado, setDispositivoSeleccionado, escenario } =
		useEscenario()
	const {
		desktopMode,
		pendingZoom,
		consumePendingZoom,
		startZoom,
		exitDesktopMode,
	} = useScreenTransition()
	const { zonaActual, siguienteZona, anteriorZona, processEntities } =
		useECSSceneContext()
	const isAndinaPayCase = escenario?.exercise?.caseId === 'cwe-321-andinapay'
	const workstation = useMemo(() => {
		if (!isAndinaPayCase) return undefined
		try {
			return processEntities().find(
				(entity) =>
					String(entity.objetoConTipo?.tipo ?? '').toUpperCase() ===
					'WORKSTATION',
			)
		} catch {
			// El ECS aún no ha montado la jerarquía en el primer render.
			return undefined
		}
	}, [isAndinaPayCase, processEntities])
	const zonaAnteriorRef = useRef(zonaActual)

	// ArrowLeft / ArrowRight navegan entre zonas; deshabilitado dentro del overlay de monitor.
	useZonaKeyboardNav({
		onPrev: anteriorZona,
		onNext: siguienteZona,
		enabled: !desktopMode,
	})

	useEffect(() => {
		setDispositivoSeleccionado(null)
	}, [])

	useEffect(() => {
		if (zonaAnteriorRef.current !== zonaActual && desktopMode) {
			exitDesktopMode()
		}
		zonaAnteriorRef.current = zonaActual
	}, [zonaActual, desktopMode, exitDesktopMode])

	// Handle pending zoom from Sidebar navigation
	useEffect(() => {
		if (pendingZoom) {
			startZoom(pendingZoom.position, pendingZoom.rotationY)
			consumePendingZoom()
		}
	}, [pendingZoom, startZoom, consumePendingZoom])

	return (
		<div className={styles.contenedor}>
			<Escena3D />
			{!desktopMode && (
				<TarjetaEntidadSeleccionada visible={!!dispositivoSeleccionado} />
			)}
			{!desktopMode && <TarjetaZonaActual visible={true} />}
			{!desktopMode && workstation?.position ? (
				<button
					type="button"
					className={styles.casoButton}
					onClick={() =>
						startZoom(workstation.position, workstation.rotacionY ?? 0)
					}
				>
					Abrir expediente del caso
				</button>
			) : null}
			<MonitorDesktopOverlay />
		</div>
	)
}

export default VistaOficina
