import PageTransition from '../../../common/components/PageTransition'
import VistaTopologica from '../components/VistaTopologica'
import styles from '../styles/Redes.module.css'

export default function Redes() {
	return (
		<PageTransition>
			<div className={styles.contenedor}>
				<VistaTopologica />
			</div>
		</PageTransition>
	)
}
