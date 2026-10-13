import { Search } from 'lucide-react';
import styles from '../styles/SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Buscar' }: SearchBarProps) {
  return (
    <div className={styles.searchBar}>
      <Search size={16} className={styles.icon} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        aria-label={placeholder}
      />
    </div>
  );
}
