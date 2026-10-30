import { useEscenarioActual } from '../../../common/contexts/EscenarioContext'
import BarraProgresoFases from '../components/BarraProgresoFases'
import ObjetivoItem from '../components/ObjetivoItem'
import { useFases } from '../hooks/useFases'
import styles from '../styles/VistaFasesPartida.module.css'

function CasoAndinaPayIntro() {
	return (
		<section className={styles.casoIntro}>
			<p className={styles.casoEyebrow}>AndinaPay · CWE-321</p>
			<h1 className={styles.casoIntroTitle}>
				Una clave antigua permite leer dos registros
			</h1>
			<p className={styles.casoIntroLead}>
				AndinaPay es una fintech ficticia. Un aviso anónimo adjunta un fragmento
				legible y un volcado cifrado. Una clave que quedó en el historial del
				repositorio todavía permite leer dos registros. Tu trabajo no es romper
				AES: es demostrar qué clave explica esos datos, migrarlos a una clave
				nueva sin romper la aplicación y explicar qué sigue expuesto.
			</p>
			<h2 className={styles.casoSubtitle}>Cómo se juega</h2>
			<ol className={styles.casoSteps}>
				<li>
					En la oficina, abre el monitor del <strong>PC Analista</strong> y
					entra en <strong>Expediente</strong>.
				</li>
				<li>
					Lee el aviso y revisa la <strong>versión H1</strong> del repositorio
					para localizar la clave histórica.
				</li>
				<li>
					<span>
						Registra el hallazgo, prueba la clave en el{' '}
						<strong>Banco criptográfico</strong> y completa el{' '}
						<strong>diagnóstico D1</strong>.
					</span>
				</li>
				<li>
					En <strong>Respuesta de claves</strong>, prepara K2, migra R01 y R02,
					publica la recuperación y retira <code>legacy-demo</code>.
				</li>
				<li>
					En <strong>Comprobaciones</strong> ejecuta B/Q/C y en{' '}
					<strong>Informe</strong> documenta la continuidad y la exposición
					residual.
				</li>
			</ol>
			<p className={styles.casoNote}>
				<strong>Glosario:</strong> <code>SYN-001</code> es el identificador
				sintético del documento de R01 y <code>tok_demo_A</code> su token de
				tarjeta. No son credenciales reales; el aviso los usa como prueba de
				acceso. El aviso no está autenticado: el fragmento es una pista, no una
				prueba.
			</p>
			<p className={styles.casoNote}>
				<strong>Qué debes demostrar:</strong> que la clave histórica explica
				R01/R02, que R03 usa otra clave, que la aplicación sigue leyendo los
				registros legítimos después de la migración y que la copia antigua sigue
				siendo legible para quien tenga K1.
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
