import styles from "../styles/Toggle.module.css";

export type ToggleOption<T> = {
    value: T;
    label: string;
};

export type ToggleProps<T> = {
    options: ToggleOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
};

function Toggle<T>({ options, value, onChange, className }: ToggleProps<T>) {
    return (
        <div className={`${styles.toggle} ${className ?? ""}`}>
            {options.map((option, index) => (
                <button
                    key={index}
                    className={`${styles.option} ${value === option.value ? styles.active : ""
                        }`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

export default Toggle;
