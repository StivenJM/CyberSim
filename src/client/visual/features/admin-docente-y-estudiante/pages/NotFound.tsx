import { Link } from 'react-router';
import { motion } from 'framer-motion';
import styles from '../styles/NotFound.module.css';

const NotFound = () => {
    return (
        <motion.div
            className={styles.notFoundContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.content}>
                <h1 className={styles.title}>404</h1>
                <p className={styles.message}>Página no encontrada</p>
                <Link to="/" className={styles.homeButton}>
                    Volver al inicio
                </Link>
            </div>
        </motion.div>
    );
};

export default NotFound;
