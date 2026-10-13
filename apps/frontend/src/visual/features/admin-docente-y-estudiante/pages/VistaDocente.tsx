import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useGroups } from '../hooks/useGroups';
import ModalGrupo from '../components/ModalGrupo';
import styles from '../styles/VistaDocente.module.css';
import { idToGradient } from '../../../common/utils/idToGradient';
import { Plus } from 'lucide-react';

export default function VistaDocente() {
    const { getUser, getUserRole } = useAuth();
    const navigate = useNavigate();
    const user = getUser();
    const role = getUserRole();

    const idProfesor = role === 'profesor' && user ? (user as { id_profesor: number }).id_profesor : null;
    const { grupos, loading, error, createGrupo } = useGroups(idProfesor);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleGrupoClick = (idCurso: number) => {
        navigate(`/docente/grupo/${idCurso}`);
    };

    const handleCreateGrupo = () => {
        setIsModalOpen(true);
    };

    const handleSaveGrupo = async (nombre: string) => {
        return await createGrupo(nombre);
    };

    return (
        <>
            <main className={styles.main}>
                <div className={styles.sectionHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h2 className={styles.sectionTitle}>Mis Cursos</h2>
                        <span className={styles.count}>
                            {!loading && grupos.length}
                        </span>
                    </div>
                    <button onClick={handleCreateGrupo} className={styles.primaryButton}>
                        Crear curso <Plus size={16} />
                    </button>
                </div>

                {loading && (
                    <div className={styles.gruposGrid}>
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonPreview} />
                                <div className={styles.skeletonBody}>
                                    <div className={styles.skeletonLine} style={{ width: '60%' }} />
                                    <div className={styles.skeletonLine} style={{ width: '35%', height: 12 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && <p className={styles.errorText}>{error}</p>}

                {!loading && !error && grupos.length === 0 && (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>No tienes cursos todavía</p>
                        <p className={styles.emptyHint}>
                            Crea un curso y comparte el código de acceso con tus estudiantes.
                        </p>
                    </div>
                )}

                {!loading && !error && grupos.length > 0 && (
                    <>
                        <div className={styles.gruposGrid}>
                            {grupos.map((grupo) => (
                                <div
                                    key={grupo.id_curso}
                                    className={styles.grupoCard}
                                    onClick={() => handleGrupoClick(grupo.id_curso)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGrupoClick(grupo.id_curso); } }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Abrir curso ${grupo.nombre}`}
                                >
                                    <div
                                        className={styles.cardPreview}
                                        style={{ background: idToGradient(grupo.id_curso) }}
                                    />
                                    <div className={styles.cardBody}>
                                        <h3 className={styles.grupoName}>{grupo.nombre}</h3>
                                        <span className={styles.codeBadge}>
                                            {grupo.codigo_acceso || 'Sin código'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </>
                )}
            </main>

            <ModalGrupo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveGrupo}
                grupoActual={null}
            />
        </>
    );
}
