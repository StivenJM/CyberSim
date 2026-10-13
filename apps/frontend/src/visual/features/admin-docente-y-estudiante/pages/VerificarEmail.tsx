import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import styles from '../styles/Auth.module.css';
import { useAuth } from '../hooks/useAuth';

const VerificarEmail = () => {
    const navigate = useNavigate();
    const { getUser, logout, resendConfirmation, loading, error } = useAuth();
    const [sent, setSent] = useState(false);

    const user = getUser();
    const email = user?.correo_electronico ?? '';

    const handleResend = async () => {
        setSent(false);
        if (!email) return;

        const result = await resendConfirmation(email);
        if (result?.success) {
            setSent(true);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.div
            className={styles.authContainer}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
            }}
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

                <h1 className={styles.title} style={{ marginBottom: 28 }}>Verifica tu correo</h1>

                <div className={styles.form} style={{ textAlign: 'center' }}>
                    <p className={styles.subtitle} style={{ margin: '0 0 8px 0', lineHeight: 1.6 }}>
                        Enviamos un enlace de verificacion a{' '}
                        <span style={{ color: '#e0e0e0' }}>{email}</span>.
                        Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.<br/>
                        <span style={{ color: '#F9FF8C' }}>Chequea tu bandeja de spam en caso de no encontrarlo en la principal.</span>
                    </p>

                    {sent && (
                        <div style={{ color: 'var(--success)', fontSize: 12, textAlign: 'center', paddingBottom: 6 }}>
                            Correo reenviado correctamente.
                        </div>
                    )}

                    {error && <div className={styles.error} role="alert" aria-live="assertive">{error}</div>}

                    <button
                        className={styles.submitButton}
                        onClick={handleResend}
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Reenviar correo de verificacion'}
                    </button>
                </div>

                <div className={styles.footer}>
                    <button className={styles.link} onClick={handleLogout}>
                        Cerrar sesion
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default VerificarEmail;
