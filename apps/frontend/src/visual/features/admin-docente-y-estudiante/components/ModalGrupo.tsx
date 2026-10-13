import { useState, useEffect } from 'react';
import FormModal from '../../../common/components/FormModal';
import styles from '../styles/ModalGrupo.module.css';

interface ModalGrupoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nombre: string) => Promise<boolean>;
  grupoActual?: { id_curso: number; nombre: string } | null;
}

export default function ModalGrupo({ isOpen, onClose, onSave, grupoActual }: ModalGrupoProps) {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNombre(grupoActual?.nombre || '');
      setError(null);
    }
  }, [isOpen, grupoActual]);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre del grupo es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    const success = await onSave(nombre);
    setLoading(false);

    if (success) {
      onClose();
    } else {
      setError('Error al guardar el grupo');
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={grupoActual ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
      submitLabel={grupoActual ? 'Actualizar' : 'Crear'}
      loading={loading}
      error={error}
    >
      <div className={styles.formGroup}>
        <label htmlFor="nombre">Nombre del Grupo</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Grupo 1A - Redes"
          disabled={loading}
          autoFocus
        />
      </div>
    </FormModal>
  );
}
