import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import styles from '../styles/CodigoInvitacion.module.css';

interface CodigoInvitacionProps {
  codigo: string | null;
  onGenerate: () => Promise<string | null>;
}

export default function CodigoInvitacion({ codigo, onGenerate }: CodigoInvitacionProps) {
  const [loading, setLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await onGenerate();
    setLoading(false);
  };

  const handleCopy = () => {
    if (codigo) {
      navigator.clipboard.writeText(codigo);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <span className={styles.label}>Código de invitación</span>
        {codigo ? (
          <div className={styles.codeRow}>
            <code className={styles.code}>{codigo}</code>
            <button className={styles.copyButton} onClick={handleCopy} title={showCopied ? 'Copiado' : 'Copiar'}>
              {showCopied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              className={styles.regenButton}
              onClick={handleGenerate}
              disabled={loading}
              title="Regenerar"
            >
              <RefreshCw size={16} className={loading ? styles.spinning : ''} />
            </button>
          </div>
        ) : (
          <button
            className={styles.generateButton}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar código'}
          </button>
        )}
      </div>
      {!codigo && !loading && (
        <p className={styles.hint}>
          Los estudiantes necesitan un código para unirse a este grupo.
        </p>
      )}
    </div>
  );
}
