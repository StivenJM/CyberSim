import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import styles from '../styles/Breadcrumb.module.css';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <nav className={styles.breadcrumb}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className={styles.item}>
            {i > 0 && <ChevronRight size={14} className={styles.sep} />}
            {isLast || !item.to ? (
              <span className={isLast ? styles.current : undefined}>{item.label}</span>
            ) : (
              <button className={styles.link} onClick={() => navigate(item.to!)}>
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
