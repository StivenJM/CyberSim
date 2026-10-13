import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../styles/Auth.module.css';
import { API_BASE_URL } from '../../../common/utils/apiConfig';

const RestablecerContrasenia = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, nueva_contrasenia: password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al restablecer contraseña');
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <motion.div
                className={styles.authContainer}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    className={styles.authCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className={styles.logoIcon}>
                        <img src="/assets/pictures/computer_logo.webp" alt="Logo" width={64} height={64} />
                    </div>
                    <h1 className={styles.title}>Enlace inválido</h1>
                    <div className={styles.form} style={{ textAlign: 'center' }}>
                        <p className={styles.subtitle} style={{ margin: '0 0 8px 0', lineHeight: 1.6, color: 'var(--error)' }}>
                            El enlace de recuperación no es válido o ha expirado.
                        </p>
                        <button className={styles.submitButton} onClick={() => navigate('/recuperar-contrasenia')}>
                            Solicitar nuevo enlace
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={styles.authContainer}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
            <motion.div
                className={styles.authCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className={styles.logoIcon}>
                    <img src="/assets/pictures/computer_logo.webp" alt="Logo" width={64} height={64} />
                </div>

                {!success ? (
                    <>
                        <h1 className={styles.title} style={{ marginBottom: 28 }}>Nueva contraseña</h1>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.fieldSection}>
                                <span className={styles.fieldLabel}>Contraseña</span>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.fieldSection}>
                                <span className={styles.fieldLabel}>Confirmar contraseña</span>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && <div className={styles.error}>{error}</div>}

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Restablecer contraseña'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h1 className={styles.title}>Contraseña actualizada</h1>

                        <div className={styles.form} style={{ textAlign: 'center' }}>
                            <p className={styles.subtitle} style={{ margin: '0 0 8px 0', lineHeight: 1.6, color: 'var(--success)' }}>
                                Tu contraseña ha sido restablecida correctamente.
                            </p>
                            <button className={styles.submitButton} onClick={() => navigate('/login')}>
                                Iniciar sesión
                            </button>
                        </div>
                    </>
                )}

                {!success && (
                    <div className={styles.footer}>
                        <button className={styles.link} onClick={() => navigate('/login')} type="button">
                            Volver a iniciar sesión
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default RestablecerContrasenia;
