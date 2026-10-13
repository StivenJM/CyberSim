import { useParams, useLocation } from 'react-router';
import { useProgresoEstudiante } from '../hooks/useEstudiantes';
import Breadcrumb from '../components/Breadcrumb';
import EscenarioHistorial, { agruparEscenarios } from '../components/EscenarioHistorial';
import Identicon from '../../../common/components/Identicon';
import styles from '../styles/VistaDetalleEstudiante.module.css';

export default function VistaDetalleEstudiante() {
    const { idEstudiante } = useParams<{ idEstudiante: string }>();
    const location = useLocation();
    const state = location.state as {
        fromGrupo?: { id: number; nombre: string };
        estudiante?: { nombre: string; correo: string };
    } | null;
    const fromGrupo = state?.fromGrupo;
    const estudiante = state?.estudiante;

    const { progresos, loading, error } =
        useProgresoEstudiante(idEstudiante ? parseInt(idEstudiante) : null);

    const escenarios = agruparEscenarios(progresos);

    return (
        <div className={styles.main}>
            <Breadcrumb items={[
                { label: 'Mis Cursos', to: '/docente' },
                ...(fromGrupo
                    ? [{ label: fromGrupo.nombre, to: `/docente/grupo/${fromGrupo.id}` }]
                    : []),
                { label: estudiante?.nombre || 'Estudiante' },
            ]} />

            {estudiante && (
                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                        <Identicon seed={estudiante.correo || 'user'} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>{estudiante.nombre}</h1>
                        <div className={styles.profileMetaRow}>
                            <p className={styles.meta}>{estudiante.correo}</p>
                            {fromGrupo && (
                                <>
                                    <span className={styles.metaDot}>·</span>
                                    <p className={styles.meta}>{fromGrupo.nombre}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <section className={styles.historialSection}>
                    <h2 className={styles.historialTitle}>Historial de evaluaciones</h2>
                    <div className={styles.historialList}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={styles.skeletonItem} aria-hidden="true" />
                        ))}
                    </div>
                </section>
            )}

            {error && <p className={styles.errorText}>{error}</p>}

            {!loading && !error && (
                <section className={styles.historialSection}>
                    <h2 className={styles.historialTitle}>Historial de evaluaciones</h2>

                    {escenarios.length === 0 ? (
                        <div className={styles.empty}>
                            <p className={styles.muted}>Este estudiante aún no ha jugado ningún escenario</p>
                        </div>
                    ) : (
                        <EscenarioHistorial escenarios={escenarios} />
                    )}
                </section>
            )}
        </div>
    );
}
