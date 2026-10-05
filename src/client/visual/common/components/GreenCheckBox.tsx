import styles from '../styles/GreenCheckBox.module.css';
export default function GreenCheckBox({ checked }: { checked: boolean }) {
    return (
        <div className={`${styles.greenCheckBox} ${checked ? styles.checked : ''}`} aria-checked={checked} role="checkbox">
            {checked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="#52AB7B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
    );
}