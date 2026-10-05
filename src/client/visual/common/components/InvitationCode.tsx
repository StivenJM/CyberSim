import { useState, useRef, useCallback } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import Tooltip from './Tooltip';
import Button from './Button';
import styles from '../styles/InvitationCode.module.css';

const CODE_LENGTH = 8;
const PLACEHOLDER = 'ABCD1234';

interface InvitationCodeDisplayProps {
  mode: 'display';
  code: string | null;
  onCopy?: () => void;
  onRegenerate?: () => Promise<void>;
  label?: string;
}

interface InvitationCodeInputProps {
  mode: 'input';
  onSubmit: (code: string) => void;
  onChange?: () => void;
  label?: string;
  error?: string;
  loading?: boolean;
}

type InvitationCodeProps = InvitationCodeDisplayProps | InvitationCodeInputProps;

function DisplayMode({ code, onCopy, onRegenerate, label }: Omit<InvitationCodeDisplayProps, 'mode'>) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!onRegenerate || regenerating) return;
    setRegenerating(true);
    await onRegenerate();
    setRegenerating(false);
  };

  const chars = code ? code.split('') : [];

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.row}>
        <div className={styles.cells}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <div key={i} className={styles.cell}>
              {chars[i] || ''}
            </div>
          ))}
        </div>
        {code && (
          <div className={styles.actions}>
            <Tooltip text={copied ? 'Copiado' : 'Copiar'}>
              <Button variant="icon" square icon={copied ? <Check size={14} /> : <Copy size={14} />} onClick={handleCopy} />
            </Tooltip>
            {onRegenerate && (
              <Tooltip text="Regenerar">
                <Button
                  variant="icon"
                  square
                  icon={<RefreshCw size={14} className={regenerating ? styles.spinning : ''} />}
                  onClick={handleRegenerate}
                  disabled={regenerating}
                />
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InputMode({ onSubmit, onChange, label, error, loading }: Omit<InvitationCodeInputProps, 'mode'>) {
  const [values, setValues] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback((index: number) => {
    inputsRef.current[index]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z0-9]$/.test(char)) return;

    const next = [...values];
    next[index] = char;
    setValues(next);
    onChange?.();

    if (char && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }

    if (next.every(v => v !== '') && next.join('').length === CODE_LENGTH) {
      onSubmit(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\s/g, '').toUpperCase().slice(0, CODE_LENGTH);
    if (!/^[A-Z0-9]*$/.test(pasted)) return;

    const next = [...values];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setValues(next);

    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    focusInput(focusIdx);

    if (next.every(v => v !== '') && next.join('').length === CODE_LENGTH) {
      onSubmit(next.join(''));
    }
  };

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.cells} role="group" aria-label="Código de invitación">
        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={el => { inputsRef.current[i] = el; }}
            aria-label={`Dígito ${i + 1} del código`}
            className={`${styles.cell} ${styles.cellInput} ${values[i] ? styles.cellFilled : ''} ${error ? styles.cellError : ''}`}
            type="text"
            inputMode="text"
            maxLength={1}
            placeholder={values.every(v => !v) ? PLACEHOLDER[i] : undefined}
            value={values[i]}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={loading}
            autoFocus={i === 0}
          />
        ))}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export default function InvitationCode(props: InvitationCodeProps) {
  if (props.mode === 'input') {
    return <InputMode {...props} />;
  }
  return <DisplayMode {...props} />;
}
