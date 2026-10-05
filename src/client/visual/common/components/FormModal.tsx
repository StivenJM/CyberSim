import type { ReactNode } from "react";
import Button from "./Button";
import styles from "../styles/FormModal.module.css";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  title: string;
  submitLabel: string;
  submittingLabel?: string;
  cancelLabel?: string;
  loading: boolean;
  error?: string | null;
  children: ReactNode;
}

/**
 * Shell compartido para modales con un formulario simple.
 *
 * Aporta el overlay, la caja, el header con botón de cierre, la fila de
 * acciones (Cancelar/Submit) y el mensaje de error. El `children` renderiza
 * los campos del formulario, que mantienen su estilo específico en el CSS
 * del consumidor.
 */
export default function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  submittingLabel = "Guardando...",
  cancelLabel = "Cancelar",
  loading,
  error,
  children,
}: FormModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.overlay} onClick={onClose} aria-hidden="true">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="form-modal-title" onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="form-modal-title">{title}</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {children}

          {error && <p className={styles.error} role="alert" aria-live="assertive">{error}</p>}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={loading}
            >
              {loading ? submittingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
