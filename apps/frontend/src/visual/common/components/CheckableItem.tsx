import styles from "../styles/CheckableItem.module.css";

type CheckableItemProps = {
    label: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
};

function CheckableItem({
    label,
    checked = false,
    onChange,
    disabled = false,
    className,
}: CheckableItemProps) {
    const handleClick = () => {
        if (!disabled) {
            onChange?.(!checked);
        }
    };

    const handleChange = () => {
        if (!disabled) {
            onChange?.(!checked);
        }
    };

    const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();
    };

    return (
        <div
            className={`${styles.item} ${className ?? ""}`}
            onClick={handleClick}
            data-context={label.toLowerCase()}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
        >
            <div className={styles.labelContainer}>
                <input
                    type="checkbox"
                    aria-label={label}
                    checked={checked}
                    onChange={handleChange}
                    onClick={handleCheckboxClick}
                    disabled={disabled}
                    className={styles.checkbox}
                />
                <div className={styles.label}>{label}</div>
            </div>
        </div>
    );
}

export default CheckableItem;
