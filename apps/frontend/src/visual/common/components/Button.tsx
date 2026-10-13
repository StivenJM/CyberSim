import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from '../styles/Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'accent' | 'icon' | 'ai';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  square?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', icon, square, children, className, ...rest }, ref) => (
    <button
      ref={ref}
      className={`${styles.btn} ${styles[variant]} ${square ? styles.square : ''} ${className ?? ''}`}
      {...rest}
    >
      {icon && <span className={styles.iconSlot}>{icon}</span>}
      {children && <span className={styles.label}>{children}</span>}
    </button>
  ),
);

Button.displayName = 'Button';

export default Button;
