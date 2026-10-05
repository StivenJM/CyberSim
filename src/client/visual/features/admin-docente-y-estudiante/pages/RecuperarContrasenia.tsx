import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import styles from '../styles/Auth.module.css';
import { API_BASE_URL } from '../../../common/utils/apiConfig';

const RecuperarContrasenia = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo_electronico: email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al enviar solicitud');
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

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

                <h1 className={styles.title}>Recuperar contraseña</h1>

                {!sent ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.fieldSection}>
                            <label htmlFor="recuperar-email" className={styles.fieldLabel}>Correo electrónico</label>
                            <input
                                id="recuperar-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="usuario@epn.edu.ec"
                                required
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </form>
                ) : (
                    <div className={styles.form} style={{ textAlign: 'center' }}>
                        <p className={styles.subtitle} style={{ margin: '0 0 8px 0', lineHeight: 1.6 }}>
                            Si existe una cuenta con{' '}
                            <span style={{ color: '#e0e0e0' }}>{email}</span>,
                            recibirás un enlace para restablecer tu contraseña. <span style={{ color: '#F9FF8C' }}>Revisa tu bandeja de entrada o de spam.</span>.
                        </p>
                    </div>
                )}

                <div className={styles.footer}>
                    <button className={styles.link} onClick={() => navigate('/login')} type="button">
                        Volver a iniciar sesión
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RecuperarContrasenia;
