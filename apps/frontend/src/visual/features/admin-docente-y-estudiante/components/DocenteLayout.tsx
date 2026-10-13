import { Outlet } from 'react-router';
import { motion } from 'framer-motion';
import DocenteHeader from './DocenteHeader';
import styles from '../styles/DocenteLayout.module.css';

export default function DocenteLayout() {
  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <DocenteHeader />
      <div className={styles.content}>
        <Outlet />
      </div>
    </motion.div>
  );
}
