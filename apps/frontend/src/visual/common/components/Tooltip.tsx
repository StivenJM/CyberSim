import styles from '../styles/Tooltip.module.css';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
    const posClass = position !== 'top' ? styles[position] : '';
    return (
        <div className={styles.wrapper}>
            {children}
            <span className={`${styles.tooltip} ${posClass}`}>
                {text}
            </span>
        </div>
    );
}
