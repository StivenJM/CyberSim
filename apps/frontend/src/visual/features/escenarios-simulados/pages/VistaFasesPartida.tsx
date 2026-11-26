import { useEscenarioActual } from '../../../common/contexts/EscenarioContext'
import BarraProgresoFases from '../components/BarraProgresoFases'
import ObjetivoItem from '../components/ObjetivoItem'
import { useFases } from '../hooks/useFases'
import styles from '../styles/VistaFasesPartida.module.css'

function CasoAndinaPayIntro() {
	return (
		<section className={styles.casoIntro}>
			<p className={styles.casoEyebrow}>AndinaPay · Respuesta a incidentes</p>
			<h1 className={styles.casoIntroTitle}>Un aviso por investigar</h1>
			<p className={styles.casoIntroLead}>
				AndinaPay es una fintech quiteña de doce personas que ayuda a pequeños
				comercios a cobrar con tarjeta. Te incorporas como analista de respuesta
				a incidentes: soporte ha reenviado un mensaje que menciona datos de la
				empresa. Gerencia necesita saber qué se puede demostrar y qué queda por
				investigar.
			</p>
			<h2 className={styles.casoSubtitle}>Tu puesto de trabajo</h2>
			<ol className={styles.casoSteps}>
				<li>
					Abre el monitor del <strong>PC Analista</strong>. En{' '}
					<strong>Correo</strong> encontrarás los mensajes recibidos; puedes
					orientarte por sus asuntos y vistas previas.
				</li>
				<li>
					Los materiales recibidos están disponibles en{' '}
					<strong>Expediente</strong>. También tienes acceso al{' '}
					<strong>Repositorio</strong> y al <strong>Banco criptográfico</strong>{' '}
					para contrastar tus hipótesis.
				</li>
				<li>
					Conserva las evidencias que sostengan tu diagnóstico y distingue lo
					comprobado de las afirmaciones que todavía no puedes confirmar. Puedes
					consultar los materiales en cualquier orden.
				</li>
			</ol>
			<p className={styles.casoNote}>
				Los datos, las personas y los correos pertenecen a una simulación. No
				necesitas contactar a nadie ni utilizar servicios externos.
			</p>
		</section>
	)
}

export default function VistaFasesPartida() {
	const { fases, faseActual, faseActualIndex } = useFases()
	const escenario = useEscenarioActual()
	const isAndinaPay = escenario.exercise?.caseId === 'cwe-321-andinapay'

	if (!faseActual) {
		return <div>No hay fases disponibles</div>
	}

	return (
		<div className={styles.vistaFases}>
			{isAndinaPay ? <CasoAndinaPayIntro /> : null}
			{isAndinaPay ? (
				<h2 className={styles.fasesTitle}>Fases del caso</h2>
			) : null}
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
