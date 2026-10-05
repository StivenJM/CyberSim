import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import styles from '../styles/Auth.module.css';
import { API_BASE_URL } from '../../../common/utils/apiConfig';

const ConfirmarEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Token de confirmación no encontrado.');
            return;
        }

        fetch(`${API_BASE_URL}/auth/confirm?token=${encodeURIComponent(token)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                    setMessage('Tu correo ha sido verificado correctamente.');
                    localStorage.setItem('emailConfirmado', 'true');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'No se pudo confirmar el correo.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Error de conexión al verificar el correo.');
            });
    }, [searchParams]);

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

                <h1 className={styles.title}>
                    {status === 'loading' && 'Verificando...'}
                    {status === 'success' && 'Correo verificado'}
                    {status === 'error' && 'Error de verificación'}
                </h1>

                <div className={styles.form} style={{ textAlign: 'center' }}>
                    <p className={styles.subtitle} style={{ margin: '0 0 8px 0', lineHeight: 1.6, color: status === 'success' ? 'var(--success)' : status === 'error' ? 'var(--error)' : '#555' }}>
                        {message}
                    </p>

                    {status === 'success' && (
                        <button
                            className={styles.submitButton}
                            onClick={() => {
                                const role = localStorage.getItem('userRole');
                                navigate(role === 'profesor' ? '/docente' : role === 'estudiante' ? '/seleccion-niveles' : '/login');
                            }}
                        >
                            Ingresar a la plataforma
                        </button>
                    )}

                    {status === 'error' && (
                        <button
                            className={styles.submitButton}
                            onClick={() => navigate('/login')}
                        >
                            Ir a iniciar sesión
                        </button>
                    )}
                </div>

            </motion.div>
        </motion.div>
    );
};

export default ConfirmarEmail;
