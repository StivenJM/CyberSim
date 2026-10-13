import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Trash2, Users, BarChart3, Settings, PenSquareIcon, ArrowRight } from 'lucide-react';
import Leaderboard from '../../escenarios-simulados/components/Leaderboard';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useGroups, type Estudiante, type Grupo } from '../hooks/useGroups';
import InvitationCode from '../../../common/components/InvitationCode';
import SearchBar from '../../../common/components/SearchBar';
import TextInput from '../../../common/components/TextInput';
import Button from '../../../common/components/Button';
import ConfirmDialog from '../../../common/components/ConfirmDialog';
import { CourseAnalysisButton } from '../../course-analysis/components/CourseAnalysisButton';
import { CourseAnalysisView } from '../../course-analysis/components/CourseAnalysisView';
import { useGenerateCourseAnalysis } from '../../course-analysis/hooks/useGenerateCourseAnalysis';
import type { CourseAnalysisResponse } from '../../course-analysis/types/courseAnalysis.types';
import styles from '../styles/DetalleGrupo.module.css';
import Breadcrumb from '../components/Breadcrumb';
import Identicon from '../../../common/components/Identicon';
import GroupInsights from '../components/GroupInsights';
import { useGroupInsights } from '../hooks/useGroupInsights';

type Tab = 'students' | 'analysis' | 'settings';

export default function DetalleGrupo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUser, getUserRole } = useAuth();
  const user = getUser();
  const role = getUserRole();

  const idProfesor = role === 'profesor' && user ? (user as { id_profesor: number }).id_profesor : null;
  const { grupos, generateCode, removeStudent, getEstudiantesByGrupo, updateGrupo, deleteGrupo } = useGroups(idProfesor);

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [editName, setEditName] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [isCheckingAnalysis, setIsCheckingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<CourseAnalysisResponse | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const [confirmDeleteGrupo, setConfirmDeleteGrupo] = useState(false);
  const { checkLatestAnalysis } = useGenerateCourseAnalysis();
  const insights = useGroupInsights(grupo?.id_curso ?? null);




  useEffect(() => {
    const loadGrupo = async () => {
      if (!id) return;
      const idCurso = Number(id);
      const grupoEncontrado = grupos.find((g) => g.id_curso === idCurso);
      if (grupoEncontrado) {
        setGrupo(grupoEncontrado);
        setEditName(grupoEncontrado.nombre);
        const estudiantesData = await getEstudiantesByGrupo(idCurso);
        setEstudiantes(estudiantesData);
      }
      setLoading(false);
    };
    if (grupos.length > 0) {
      loadGrupo();
    }
  }, [id, grupos]);

  const handleGenerateCode = async () => {
    if (!grupo) return null;
    const newCode = await generateCode(grupo.id_curso);
    if (newCode && grupo) {
      setGrupo({ ...grupo, codigo_acceso: newCode });
    }
    return newCode;
  };

  const handleRemoveStudent = async (idEstudiante: number) => {
    if (!grupo) return;
    const success = await removeStudent(grupo.id_curso, idEstudiante);
    if (success) {
      setEstudiantes(estudiantes.filter((e) => e.id_estudiante !== idEstudiante));
    }
    setConfirmRemoveId(null);
  };

  const handleEstudianteClick = (est: Estudiante) => {
    navigate(`/docente/estudiante/${est.id_estudiante}`, {
      state: {
        fromGrupo: { id: grupo!.id_curso, nombre: grupo!.nombre },
        estudiante: {
          nombre: `${est.primernombre} ${est.primer_apellido}`,
          correo: est.correo_electronico,
        },
      },
    });
  };

  const handleRenameGrupo = async () => {
    if (!grupo || !editName.trim() || editName.trim() === grupo.nombre) return;
    setRenameSaving(true);
    const success = await updateGrupo(grupo.id_curso, editName.trim());
    if (success) {
      setGrupo({ ...grupo, nombre: editName.trim() });
    }
    setRenameSaving(false);
  };

  const handleDeleteGrupo = async () => {
    if (!grupo) return;
    const success = await deleteGrupo(grupo.id_curso);
    if (success) {
      navigate('/docente');
    }
    setConfirmDeleteGrupo(false);
  };

  /*const handleExportCSV = () => {
    if (estudiantes.length === 0) return;
    const headers = ['Nombre', 'Código', 'Correo'];
    const rows = estudiantes.map((e) => [
      `${e.primernombre} ${e.segundo_nombre || ''} ${e.primer_apellido} ${e.segundo_apellido || ''}`.trim(),
      String(e.codigo_unico),
      e.correo_electronico,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${grupo?.nombre || 'estudiantes'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!loading && !grupo) {
    return (
      <div>
        <p className={styles.errorText}>Grupo no encontrado</p>
        <button onClick={() => navigate('/docente')} className={styles.backLink}>
          Volver a mis grupos
        </button>
      </div>
    );
  }*/

  const filteredStudents = estudiantes.filter((est) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = [est.primernombre, est.segundo_nombre, est.primer_apellido, est.segundo_apellido]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return fullName.includes(q);
  });

  return (
    <>
      <div className={styles.layout}>
        <main className={styles.main}>
          <Breadcrumb items={[
            { label: 'Mis Cursos', to: '/docente' },
            { label: grupo?.nombre || '...' },
          ]} />

          <nav className={styles.tabBar}>
            <button
              className={`${styles.tab} ${activeTab === 'students' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('students')}
            >
              {activeTab === 'students' && (
                <motion.div className={styles.tabIndicator} layoutId="detalle-tab" transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }} />
              )}
              <span className={styles.tabLabel}><Users size={16} /> Curso</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'analysis' ? styles.tabActive : ''}`}
              onClick={async () => {
                setActiveTab('analysis');
                if (grupo && !analysis) {
                   setIsCheckingAnalysis(true);
                   const result = await checkLatestAnalysis(grupo.id_curso);
                   if (result.success && result.analysis) {
                     setAnalysis(result.analysis);
                   }
                   setIsCheckingAnalysis(false);
                }
              }}
            >
              {activeTab === 'analysis' && (
                <motion.div className={styles.tabIndicator} layoutId="detalle-tab" transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }} />
              )}
              <span className={styles.tabLabel}><BarChart3 size={16} /> Análisis</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              {activeTab === 'settings' && (
                <motion.div className={styles.tabIndicator} layoutId="detalle-tab" transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }} />
              )}
              <span className={styles.tabLabel}><Settings size={16} /> Configuración</span>
            </button>
          </nav>
          {/* ── Students tab ── */}
          {activeTab === 'students' && (
            <>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>
                  Estudiantes
                  <span className={styles.badge}>{estudiantes.length}</span>
                </h2>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>

              {loading ? (
                <div className={styles.studentList}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.skeletonRow} aria-hidden="true">
                      <div className={styles.skeletonAvatar} />
                      <div className={styles.skeletonLines}>
                        <div className={styles.skeletonName} />
                        <div className={styles.skeletonMeta} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : estudiantes.length === 0 ? (
                <p className={styles.emptyText}>
                  Los estudiantes aparecerán aquí cuando se unan con el código de invitación.
                </p>
              ) : filteredStudents.length === 0 ? (
                <p className={styles.emptyText}>
                  Sin resultados para "{searchQuery}"
                </p>
              ) : (
                <div className={styles.studentList}>
                  {filteredStudents.map((est) => (
                    <div key={est.id_estudiante} className={styles.studentRow}>
                      <div
                        className={styles.studentClickable}
                        onClick={() => handleEstudianteClick(est)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEstudianteClick(est); } }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Ver progreso de ${est.primernombre} ${est.primer_apellido}`}
                      >
                        <div className={styles.avatar}>
                          <Identicon seed={est.correo_electronico} />
                        </div>
                        <div className={styles.studentInfo}>
                          <span className={styles.studentName}>
                            {est.primernombre} {est.segundo_nombre || ''}{' '}
                            {est.primer_apellido} {est.segundo_apellido || ''}
                          </span>
                          <span className={styles.studentMeta}>
                            {est.codigo_unico} · {est.correo_electronico}
                          </span>
                        </div>
                      </div>
                      <div className={styles.rowActions}>
                        <Button
                          variant="danger"
                          square
                          icon={<Trash2 size={14} />}
                          onClick={() => setConfirmRemoveId(est.id_estudiante)}
                          aria-label={`Eliminar a ${est.primernombre} ${est.primer_apellido} del grupo`}
                        />
                        <Button
                          variant="primary"
                          square
                          icon={<ArrowRight size={14} />}
                          onClick={() => handleEstudianteClick(est)}
                          aria-label={`Ver detalles de ${est.primernombre} ${est.primer_apellido}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Analysis tab ── */}
          {activeTab === 'analysis' && grupo && (
            <>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Análisis del curso</h2>
              </div>

              <GroupInsights data={insights} />

              <div className={styles.analysisRow}>
                <div className={styles.analysisCol}>
                  <div className={styles.analysisTitleRow}>
                    <h3 className={styles.analysisSectionTitle}>Análisis de curso con IA</h3>
                    {!isCheckingAnalysis && (
                      <CourseAnalysisButton
                        idCurso={grupo.id_curso}
                        idProfesor={idProfesor || 0}
                        hasExisting={!!analysis}
                        onAnalysisGenerated={(newAnalysis) => {
                          setAnalysis(newAnalysis);
                        }}
                      />
                    )}
                  </div>
                  {!analysis ? (
                    isCheckingAnalysis ? (
                      <div className={styles.analysisPanel} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Buscando informe de análisis previo...</p>
                      </div>
                    ) : (
                      <div className={styles.analysisPanel}>
                        <p className={styles.analysisDesc}>
                          Genera un análisis con IA sobre el rendimiento y participación de los estudiantes en este grupo.
                        </p>
                      </div>
                    )
                  ) : (
                    <CourseAnalysisView
                      analysis={analysis}
                      cursoNombre={grupo.nombre}
                      idCurso={grupo.id_curso}
                      idProfesor={idProfesor || 0}
                      onAnalysisGenerated={(newAnalysis) => {
                         setAnalysis(newAnalysis);
                      }}
                    />
                  )}
                </div>
                <div className={styles.leaderboardSidebar}>
                  <Leaderboard
                    entries={insights.leaderboard}
                    groupName={grupo.nombre}
                    loading={insights.loading}
                    error={null}
                    currentStudentId={null}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Settings tab ── */}
          {activeTab === 'settings' && grupo && (
            <>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Configuración</h2>
              </div>

              <div className={styles.settingsSection}>
                <h3 className={styles.settingsLabel}>Nombre del grupo</h3>
                <div className={styles.renameRow}>
                  <TextInput
                    value={editName}
                    onChange={setEditName}
                    placeholder="Nombre del grupo"
                  />
                  <Button
                    variant="secondary"
                    icon={<PenSquareIcon strokeWidth={1} size={14} />}
                    onClick={handleRenameGrupo}
                    disabled={renameSaving || !editName.trim() || editName.trim() === grupo.nombre}
                  >
                    Renombrar
                  </Button>
                </div>
              </div>

              <div className={styles.settingsSection}>
                <InvitationCode
                  mode="display"
                  code={grupo.codigo_acceso}
                  label="Código de invitación"
                  onRegenerate={async () => { await handleGenerateCode(); }}
                />
              </div>

              {/* <div className={styles.settingsSection}>
                <button className={styles.settingsAction} onClick={handleExportCSV} disabled={estudiantes.length === 0}>
                  <Export size={16} />
                  Exportar estudiantes (CSV)
                </button>
              </div> */}

              <div className={styles.settingsSection}>
                <div className={styles.dangerRow}>
                  <div className={styles.dangerInfo}>
                    <span>Eliminar grupo</span>
                    <span className={styles.dangerHint}>Se eliminará el grupo y se desmatricularán todos los estudiantes.</span>
                  </div>
                  <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => setConfirmDeleteGrupo(true)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={confirmRemoveId !== null}
        title="Eliminar estudiante"
        message="¿Estás seguro de que deseas eliminar a este estudiante del grupo?"
        onConfirm={() => confirmRemoveId && handleRemoveStudent(confirmRemoveId)}
        onCancel={() => setConfirmRemoveId(null)}
      />

      <ConfirmDialog
        open={confirmDeleteGrupo}
        title="Eliminar grupo"
        message="Se eliminará el grupo y se desmatricularán todos los estudiantes. Esta acción no se puede deshacer."
        onConfirm={handleDeleteGrupo}
        onCancel={() => setConfirmDeleteGrupo(false)}
      />
    </>
  );
}
