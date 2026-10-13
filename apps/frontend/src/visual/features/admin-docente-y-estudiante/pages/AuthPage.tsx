import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import styles from '../styles/Auth.module.css';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'login' | 'signup';
type FieldErrors = Record<string, string>;

const SIGNUP_STEPS = [
    { subtitle: 'Datos académicos' },
    { subtitle: 'Configura tu acceso' },
];

const AuthPage = () => {
    const location = useLocation();
    const initialMode: AuthMode = location.pathname === '/signup' ? 'signup' : 'login';

    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isExiting, setIsExiting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        codigoUnico: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();
    const { login, registerEstudiante, loading, error, clearError } = useAuth();

    const clearFieldError = (field: string) => {
        if (fieldErrors[field]) {
            setFieldErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setLocalError('');
        clearError();
        setFieldErrors({});
        setStep(0);
        setMode(newMode);
        window.history.replaceState(null, '', newMode === 'login' ? '/login' : '/signup');
    };

    const validateLogin = (): boolean => {
        const errors: FieldErrors = {};
        if (!loginEmail.trim()) errors.loginEmail = 'Ingresa tu correo electrónico';
        if (!loginPassword.trim()) errors.loginPassword = 'Ingresa tu contraseña';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep0 = (): boolean => {
        const errors: FieldErrors = {};
        if (!formData.primerNombre.trim()) errors.primerNombre = 'Campo requerido';
        if (!formData.primerApellido.trim()) errors.primerApellido = 'Campo requerido';
        if (!formData.segundoApellido.trim()) errors.segundoApellido = 'Campo requerido';
        if (!formData.codigoUnico.trim()) errors.codigoUnico = 'Campo requerido';
        else if (formData.codigoUnico.length !== 9) errors.codigoUnico = 'Debe tener 9 dígitos';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep1 = (): boolean => {
        const errors: FieldErrors = {};
        if (!formData.email.trim()) errors.email = 'Ingresa tu correo electrónico';
        if (!formData.password.trim()) errors.password = 'Ingresa una contraseña';
        else if (formData.password.length < 6) errors.password = 'Mínimo 6 caracteres';
        if (!formData.confirmPassword.trim()) errors.confirmPassword = 'Confirma tu contraseña';
        else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateLogin()) return;
        const result = await login({
            correo_electronico: loginEmail,
            contrasenia: loginPassword,
        });
        if (result?.success && result.data) {
            setIsExiting(true);
            const destination = result.data.confirmado
                ? (result.data.role === 'profesor' ? '/docente' : '/seleccion-niveles')
                : '/verificar-email';
            setTimeout(() => navigate(destination), 400);
        }
    };

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        clearFieldError(name);
        clearError();
    };

    const goNext = () => {
        setLocalError('');
        if (!validateStep0()) return;
        setDirection(1);
        setStep(1);
    };

    const goBack = () => {
        setLocalError('');
        setFieldErrors({});
        setDirection(-1);
        setStep(0);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        if (!validateStep1()) return;
        const result = await registerEstudiante({
            primernombre: formData.primerNombre,
            segundo_nombre: formData.segundoNombre,
            primer_apellido: formData.primerApellido,
            segundo_apellido: formData.segundoApellido,
            codigo_unico: parseInt(formData.codigoUnico),
            correo_electronico: formData.email,
            contrasenia: formData.password,
        });
        if (result?.success) {
            await login({
                correo_electronico: formData.email,
                contrasenia: formData.password,
            });
            setIsExiting(true);
            setTimeout(() => navigate('/verificar-email'), 400);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'login') {
            handleLogin(e);
        } else if (step === 0) {
            goNext();
        } else {
            handleSignup(e);
        }
    };

    const contentKey = mode === 'login' ? 'login' : `signup-${step}`;
    const title = mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta';
    const buttonText = mode === 'login'
        ? (loading ? 'Iniciando sesión...' : 'Iniciar Sesión')
        : step === 0
            ? 'Continuar'
            : (loading ? 'Registrando...' : 'Registrarse');

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
    };

    const modeDirection = mode === 'signup' ? 1 : -1;

    // Helper to render an input with inline error
    const renderInput = (
        name: string,
        value: string,
        onChange: (val: string) => void,
        props: React.InputHTMLAttributes<HTMLInputElement> = {}
    ) => (
        <>
            <input
                aria-label={typeof props.placeholder === 'string' ? props.placeholder : name}
                {...props}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${styles.input} ${fieldErrors[name] ? styles.inputError : ''}`}
            />
            {fieldErrors[name] && <span className={styles.fieldError}>{fieldErrors[name]}</span>}
        </>
    );

    // Helper para campos de contraseña con boton de ojito (mostrar/ocultar)
    const renderPasswordInput = (
        name: string,
        value: string,
        onChange: (val: string) => void,
        props: React.InputHTMLAttributes<HTMLInputElement> = {}
    ) => {
        const isVisible = !!visiblePasswords[name];
        return (
            <>
                <div className={styles.passwordWrapper}>
                    <input
                        {...props}
                        type={isVisible ? 'text' : 'password'}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${styles.input} ${fieldErrors[name] ? styles.inputError : ''}`}
                    />
                    <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setVisiblePasswords(prev => ({ ...prev, [name]: !prev[name] }))}
                        aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        tabIndex={-1}
                    >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {fieldErrors[name] && <span className={styles.fieldError}>{fieldErrors[name]}</span>}
            </>
        );
    };

    return (
        <motion.div
            className={styles.authContainer}
            initial={{ opacity: 1 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: isExiting ? 0.15 : 0 }}
        >
            <div className={styles.authCard}>
                <div className={styles.logoIcon}>
                    <img src="/assets/pictures/computer_logo.webp" alt="Logo" width={64} height={64} />
                </div>

                <div className={styles.titleArea}>
                    <AnimatePresence mode="wait">
                        <motion.h1
                            key={title}
                            className={styles.title}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                        >
                            {title}
                        </motion.h1>
                    </AnimatePresence>
                </div>

                <motion.div
                    className={styles.signupMeta}
                    initial={false}
                    animate={{
                        height: mode === 'signup' ? 'auto' : 0,
                        opacity: mode === 'signup' ? 1 : 0,
                    }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                    <p className={styles.subtitle}>{mode === 'signup' ? SIGNUP_STEPS[step].subtitle : ''}</p>
                    <div className={styles.stepIndicator}>
                        {SIGNUP_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`${styles.stepDot} ${i === step ? styles.stepDotActive : ''} ${i < step ? styles.stepDotDone : ''}`}
                            />
                        ))}
                    </div>
                </motion.div>

                <form onSubmit={handleFormSubmit} className={styles.form} spellCheck={false} autoComplete="off" noValidate>
                    <div className={styles.formInputsWrapper}>
                        <AnimatePresence mode="popLayout" custom={mode === 'login' ? modeDirection : direction}>
                            <motion.div
                                key={contentKey}
                                custom={mode === 'login' ? modeDirection : direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            >
                                {mode === 'login' && (
                                    <div className={styles.stepContent}>
                                        <div className={styles.fieldSection}>
                                            <span className={styles.fieldLabel}>Correo electrónico</span>
                                            {renderInput('loginEmail', loginEmail, (val) => { setLoginEmail(val); clearFieldError('loginEmail'); clearError(); }, {
                                                type: 'text',
                                                placeholder: 'usuario@epn.edu.ec',
                                            })}
                                        </div>
                                        <div className={styles.fieldSection}>
                                            <span className={styles.fieldLabel}>Contraseña</span>
                                            {renderPasswordInput('loginPassword', loginPassword, (val) => { setLoginPassword(val); clearFieldError('loginPassword'); clearError(); }, {
                                                placeholder: '••••••••',
                                            })}
                                            <div style={{ fontSize: 12, textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    className={styles.link}
                                                    onClick={() => navigate('/recuperar-contrasenia')}
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {mode === 'signup' && step === 0 && (
                                    <div className={styles.stepContent}>
                                        <div className={styles.fieldSection}>
                                            <span className={styles.fieldLabel}>Nombres</span>
                                            <div className={styles.fieldRow}>
                                                {renderInput('primerNombre', formData.primerNombre, (val) => handleChange('primerNombre', val), {
                                                    type: 'text',
                                                    placeholder: 'Primero',
                                                })}
                                                <input
                                                    type="text"
                                                    aria-label="Segundo (opcional)"
                                                    value={formData.segundoNombre}
                                                    onChange={(e) => handleChange('segundoNombre', e.target.value)}
                                                    className={styles.input}
                                                    placeholder="Segundo (opcional)"
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.fieldSection}>
                                            <span className={styles.fieldLabel}>Apellidos</span>
                                            <div className={styles.fieldRow}>
                                                {renderInput('primerApellido', formData.primerApellido, (val) => handleChange('primerApellido', val), {
                                                    type: 'text',
                                                    placeholder: 'Primero',
                                                })}
                                                {renderInput('segundoApellido', formData.segundoApellido, (val) => handleChange('segundoApellido', val), {
                                                    type: 'text',
                                                    placeholder: 'Segundo',
                                                })}
                                            </div>
                                        </div>

                                        <div className={styles.fieldSection}>
                                            <span className={styles.fieldLabel}>Código único</span>
                                            {renderInput('codigoUnico', formData.codigoUnico, (val) => {
                                                const clean = val.replace(/\D/g, '');
                                                handleChange('codigoUnico', clean);
                                            }, {
                                                type: 'text',
                                                inputMode: 'numeric',
                                                maxLength: 9,
                                                placeholder: 'Ej. 202110119',
                                            })}
                                        </div>
                                    </div>
                                )}

                                {mode === 'signup' && step === 1 && (
                                    <div className={styles.stepContent}>
                                        <div className={styles.fieldSection}>
                                            <span className={styles.fieldLabel}>Correo electrónico</span>
                                            {renderInput('email', formData.email, (val) => handleChange('email', val), {
                                                type: 'email',
                                                placeholder: 'usuario@epn.edu.ec',
                                            })}
                                        </div>

                                        <div className={styles.fieldSection}>
                                            <span className={styles.fieldLabel}>Contraseña</span>
                                            {renderPasswordInput('password', formData.password, (val) => handleChange('password', val), {
                                                placeholder: '••••••••',
                                            })}
                                        </div>

                                        <div className={styles.fieldSection}>
                                            <span className={styles.fieldLabel}>Confirmar contraseña</span>
                                            {renderPasswordInput('confirmPassword', formData.confirmPassword, (val) => handleChange('confirmPassword', val), {
                                                placeholder: '••••••••',
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {(localError || error) && <div className={styles.error}>{localError || error}</div>}

                    <div className={styles.stepActions}>
                        <AnimatePresence initial={false}>
                            {mode === 'signup' && step === 1 && (
                                <motion.button
                                    key="back-btn"
                                    type="button"
                                    className={styles.backButton}
                                    onClick={goBack}
                                    initial={{ width: 0, opacity: 0, marginRight: 0 }}
                                    animate={{ width: 44, opacity: 1, marginRight: 10 }}
                                    exit={{ width: 0, opacity: 0, marginRight: 0 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ overflow: 'hidden', boxSizing: 'border-box' }}
                                >
                                    <ArrowLeft size={18} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {buttonText}
                        </button>
                    </div>
                </form>

                <div className={styles.footer}>
                    {mode === 'login' ? (
                        <>
                            ¿No tienes una cuenta?{' '}
                            <button className={styles.link} onClick={() => switchMode('signup')} type="button">
                                Regístrate
                            </button>
                        </>
                    ) : (
                        <>
                            ¿Ya tienes una cuenta?{' '}
                            <button className={styles.link} onClick={() => switchMode('login')} type="button">
                                Inicia sesión
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AuthPage;
