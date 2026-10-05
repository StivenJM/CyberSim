import UserMenu from './UserMenu';
import styles from '../styles/DocenteHeader.module.css';

export default function DocenteHeader() {
  return (
    <header className={styles.topBar}>
      <img src="/assets/pictures/computer_logo.webp" alt="Logo" width={32} height={32} />
      <UserMenu />
    </header>
  );
}
