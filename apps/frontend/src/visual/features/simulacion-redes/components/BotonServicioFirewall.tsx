import type { Entidad } from '../../../../ecs/core'
import type { DireccionTrafico } from '../../../../shared/types/FirewallTypes'
import type { TipoProtocolo } from '../../../../shared/types/TrafficEnums'
import { useFirewall } from '../hooks/useFirewall'
import styles from '../styles/ModalFirewall.module.css'

export default function BotonServicioFirewall({
	protocolo,
	redSeleccionada,
	label,
	direccion,
}: {
	protocolo: TipoProtocolo
	redSeleccionada: Entidad
	label: string
	direccion: DireccionTrafico
}) {
	const { toggleRegla, estaBloqueado } = useFirewall()

	const bloqueado = estaBloqueado(protocolo, direccion, redSeleccionada)

	return (
		<button
			aria-pressed={bloqueado}
			aria-label={`${label} ${direccion}`}
			className={`${styles.servicioBtn}
            ${bloqueado ? styles.bloqueado : styles.permitido}
            `}
			onClick={() => {
				toggleRegla(redSeleccionada, protocolo, direccion)
			}}
		>
			<span className={styles.servicioNombre}>{label}</span>
		</button>
	)
}
