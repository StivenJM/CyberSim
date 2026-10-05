import type { CourseAnalysisResponse } from '../types/courseAnalysis.types';
import styles from '../styles/CourseAnalysisModal.module.css';

interface CourseAnalysisViewProps {
  analysis: CourseAnalysisResponse;
  cursoNombre: string;
  onAnalysisGenerated: (analysis: CourseAnalysisResponse) => void;
  idCurso: number;
  idProfesor: number;
}

function formatText(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`')
      ? <code key={i} className={styles.inlineCode}>{part.slice(1, -1)}</code>
      : part
  );
}

export function CourseAnalysisView({
  analysis,
  /*cursoNombre,
  onAnalysisGenerated,
  idCurso,
  idProfesor*/
}: CourseAnalysisViewProps) {
  if (!analysis) return null;

  const { analisis, resumen, fecha_generacion } = analysis;

  const fecha = new Date(fecha_generacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={styles.viewWrapper}>
      <div className={styles.statsRow}>
        <div className={styles.statsGroup}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{resumen.total_estudiantes}</span>
            <span className={styles.statLabel}>Estudiantes</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{resumen.promedio_intentos.toFixed(1)}</span>
            <span className={styles.statLabel}>Prom. Intentos</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{resumen.estudiantes_necesitan_apoyo}</span>
            <span className={styles.statLabel}>Necesitan Apoyo</span>
          </div>
        </div>
        <span className={styles.fecha}>{fecha}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <p className={styles.text}>{formatText(analisis.resumen_ejecutivo.contenido)}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{analisis.patrones.titulo}</h3>
          <p className={styles.text}>{formatText(analisis.patrones.contenido)}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{analisis.fortalezas.titulo}</h3>
          <p className={styles.text}>{formatText(analisis.fortalezas.contenido)}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{analisis.areas_mejora.titulo}</h3>
          <p className={styles.text}>{formatText(analisis.areas_mejora.contenido)}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{analisis.recomendaciones.titulo}</h3>
          <p className={styles.text}>{formatText(analisis.recomendaciones.contenido)}</p>
        </div>
      </div>
    </div>
  );
}
