import { Outlet, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import UserMenu from './UserMenu';
import { EstudianteGrupoProvider } from '../contexts/EstudianteGrupoContext';
import styles from '../styles/EstudianteLayout.module.css';

export default function EstudianteLayout() {
  const navigate = useNavigate();

  return (
    <EstudianteGrupoProvider>
      <motion.div
        className={styles.page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <header className={styles.header}>
          <button className={styles.logoButton} onClick={() => navigate('/seleccion-niveles')}>
            <img src="/assets/pictures/computer_logo.webp" alt="Logo" width={32} height={32} />
          </button>
          <UserMenu items={[
            { icon: <User size={16} />, label: 'Mi Perfil', onClick: () => navigate('/perfil') }
          ]} />
        </header>

        <main className={styles.content}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </motion.div>
    </EstudianteGrupoProvider>
  );
}
