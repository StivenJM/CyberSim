import BarraProgresoFases from '../components/BarraProgresoFases'
import ObjetivoItem from '../components/ObjetivoItem'
import { useFases } from '../hooks/useFases'
import styles from '../styles/VistaFasesPartida.module.css'

export default function VistaFasesPartida() {
	const { fases, faseActual, faseActualIndex } = useFases()

	if (!faseActual) {
		return <div>No hay fases disponibles</div>
	}

	return (
		<div className={styles.vistaFases}>
			<BarraProgresoFases
				totalFases={fases.length}
				faseActual={faseActualIndex}
				fasesCompletadas={fases.map((f) => f.completada)}
				onFaseClick={() => {}} // Phase navigation controlled by ECS
			/>

			<div className={styles.faseActual}>
				<div className={styles.faseNumero}>Fase {faseActual.id}</div>
				<h2 className={styles.faseNombre}>{faseActual.nombre}</h2>

				<div className={styles.objetivosList}>
					{faseActual.objetivos.map((objetivo, index) => (
						// biome-ignore-start lint/suspicious/noArrayIndexKey: These fixed display slots retain their positional identity.
						<ObjetivoItem
							key={index}
							descripcion={objetivo.descripcion}
							completado={objetivo.completado}
						/>
						// biome-ignore-end lint/suspicious/noArrayIndexKey: Limit the positional-key exception to this element.
					))}
				</div>
			</div>
		</div>
	)
}
