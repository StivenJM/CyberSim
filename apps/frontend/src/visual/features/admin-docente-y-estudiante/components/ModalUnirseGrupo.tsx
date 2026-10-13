import { useState } from 'react';
import FormModal from '../../../common/components/FormModal';
import InvitationCode from '../../../common/components/InvitationCode';
//import styles from '../styles/ModalUnirseGrupo.module.css';

interface ModalUnirseGrupoProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (codigo: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ModalUnirseGrupo({ isOpen, onClose, onJoin }: ModalUnirseGrupoProps) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setCodigo('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!codigo.trim()) {
      setError('El código es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await onJoin(codigo.trim());
    setLoading(false);

    if (result.success) {
      setCodigo('');
      onClose();
    } else {
      setError(result.error || 'Error al unirse al grupo');
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Unirse a un Grupo"
      submitLabel="Unirse"
      submittingLabel="Uniéndose..."
      loading={loading}
      error={error}
    >
      <InvitationCode
        mode="input"
        label="Ingrese el código de invitación"
        onSubmit={(code) => setCodigo(code)}
        onChange={() => setError(null)}
        loading={loading}
      />
    </FormModal>
  );
}
