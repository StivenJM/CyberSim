import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useProgresoEstudiante } from '../hooks/useEstudiantes';
import { useEstudianteGrupo } from '../contexts/EstudianteGrupoContext';
import { FeedbackButton } from '../../feedback/components/FeedbackButton';
import { FeedbackModal } from '../../feedback/components/FeedbackModal';
import type { FeedbackData } from '../../feedback/types/feedback.types';
import ModalUnirseGrupo from '../components/ModalUnirseGrupo';
import EscenarioHistorial, { agruparEscenarios } from '../components/EscenarioHistorial';
import { API_BASE_URL } from '../../../common/utils/apiConfig';
import Identicon from '../../../common/components/Identicon';
import styles from '../styles/VistaPerfil.module.css';

export default function VistaPerfil() {
    const navigate = useNavigate();
    const { getUser, getUserRole } = useAuth();
    const user = getUser();
    const role = getUserRole();
    const idEstudiante = role === 'estudiante' && user?.id_estudiante ? user.id_estudiante : null;

    const { progresos, loading } = useProgresoEstudiante(user?.id_estudiante || null);
    const { grupo, loading: grupoLoading, refetch: refetchGrupo } = useEstudianteGrupo();
    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        feedback: FeedbackData | null;
        escenarioNombre: string;
    }>({ isOpen: false, feedback: null, escenarioNombre: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleJoinGroup = async (codigo: string): Promise<{ success: boolean; error?: string }> => {
        if (!idEstudiante) return { success: false, error: 'No se pudo identificar al estudiante' };
        try {
            const response = await fetch(`${API_BASE_URL}/groups/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo_acceso: codigo, id_estudiante: idEstudiante }),
            });
            if (!response.ok) {
                const result = await response.json();
                const msg = result.error || 'Error al unirse al grupo';
                if (msg.includes('ya está matriculado') || msg.includes('ya pertenece') || msg.includes('Ya perteneces'))
                    return { success: false, error: 'Ya perteneces a un grupo' };
                if (msg.includes('código') || msg.includes('no encontrado'))
                    return { success: false, error: 'Código inválido o grupo no encontrado' };
                if (msg.includes('expirado'))
                    return { success: false, error: 'El código de invitación ha expirado' };
                return { success: false, error: msg };
            }
            await refetchGrupo();
            return { success: true };
        } catch {
            return { success: false, error: 'Error de conexión. Inténtalo nuevamente' };
        }
    };

    const escenarios = agruparEscenarios(progresos);

    return (
        <div className={styles.main}>
            {/* ── Profile ── */}
            <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>
                    <Identicon seed={user?.correo_electronico || user?.id || 'user'} />
                </div>
                <div>
                    <h1 className={styles.pageTitle}>
                        {user?.primernombre} {user?.primer_apellido}
                    </h1>
                    <div className={styles.profileMetaRow}>
                        <p className={styles.meta}>{user?.correo_electronico}</p>
                        {grupo && (
                            <>
                                <span className={styles.metaDot}>·</span>
                                <p className={styles.meta}>{grupo.nombre}</p>
                            </>
                        )}
                        {!grupo && !grupoLoading && (
                            <>
                                <span className={styles.metaDot}>·</span>
                                <button className={styles.linkButton} onClick={() => setIsModalOpen(true)}>
                                    Unirse a un grupo
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Historial de evaluaciones ── */}
            <section className={styles.historialSection}>
                <h2 className={styles.historialTitle}>Historial de evaluaciones</h2>

                {loading ? (
                    <div className={styles.historialList}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={styles.skeletonItem} aria-hidden="true" />
                        ))}
                    </div>
                ) : escenarios.length === 0 ? (
                    <div className={styles.empty}>
                        <p className={styles.muted}>Aun no has jugado ningun escenario</p>
                        <button className={styles.emptyButton} onClick={() => navigate('/seleccion-niveles')}>
                            Ir a escenarios
                        </button>
                    </div>
                ) : (
                    <EscenarioHistorial
                        escenarios={escenarios}
                        renderActions={(esc) => (
                            user?.id_estudiante && esc.slug_escenario ? (
                                <FeedbackButton
                                    idEstudiante={user.id_estudiante}
                                    slugEscenario={esc.slug_escenario}
                                    onFeedbackGenerated={(feedback) => {
                                        setFeedbackModal({ isOpen: true, feedback, escenarioNombre: esc.nombre });
                                    }}
                                />
                            ) : null
                        )}
                    />
                )}
            </section>

            <ModalUnirseGrupo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onJoin={handleJoinGroup}
            />
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ isOpen: false, feedback: null, escenarioNombre: '' })}
                feedback={feedbackModal.feedback}
                escenarioNombre={feedbackModal.escenarioNombre}
            />
        </div>
    );
}
