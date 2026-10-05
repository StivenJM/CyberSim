import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CourseAnalysisResponse } from '../types/courseAnalysis.types';
import styles from '../styles/CourseAnalysisModal.module.css';

interface CourseAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: CourseAnalysisResponse;
  cursoNombre: string;
}

function formatText(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`')
      ? <code key={i} className={styles.inlineCode}>{part.slice(1, -1)}</code>
      : part
  );
}

export function CourseAnalysisModal({
  isOpen,
  onClose,
  analysis,
  cursoNombre
}: CourseAnalysisModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !analysis) return null;

  const { analisis, resumen, fecha_generacion } = analysis;

  const fecha = new Date(fecha_generacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2>Análisis del Curso</h2>
              <p className={styles.subtitle}>{cursoNombre}</p>
              <p className={styles.fecha}>{fecha}</p>
            </div>
            <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className={styles.statsRow}>
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

          <div className={styles.footer}>
            <button className={styles.footerButton} onClick={onClose}>
              Entendido
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
