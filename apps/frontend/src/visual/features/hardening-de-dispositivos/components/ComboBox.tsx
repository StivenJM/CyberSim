import { useState, useRef, useEffect } from "react";
import styles from "../styles/ComboBox.module.css";
import { useOSTheme } from "../context/OSThemeContext";

export interface ComboBoxOption {
    label: string;
    value: string;
}

interface ComboBoxProps {
    options: ComboBoxOption[];
    value: ComboBoxOption | null;
    onChange: (option: ComboBoxOption) => void;
    placeholder?: string;
    emptyLabel?: string;
    disabled?: boolean;
    className?: string;
}

function ChevronDown() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ComboBox({
    options,
    value,
    onChange,
    placeholder = "Seleccionar",
    emptyLabel = "Sin opciones",
    disabled = false,
    className,
}: ComboBoxProps) {
    const isLinux = useOSTheme() === "linux";
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div
            ref={ref}
            className={`${styles.comboBox} ${isLinux ? styles.linux : ""} ${className ?? ""}`}
        >
            <button
                type="button"
                className={styles.comboTrigger}
                onClick={() => !disabled && setOpen((o) => !o)}
                disabled={disabled}
            >
                <span className={value ? styles.comboValue : styles.comboPlaceholder}>
                    {value ? value.label : placeholder}
                </span>
                <span className={styles.comboChevron}><ChevronDown /></span>
            </button>
            {open && (
                <div className={styles.comboMenu}>
                    {options.length === 0 ? (
                        <div className={styles.comboEmpty}>{emptyLabel}</div>
                    ) : (
                        options.map((item) => (
                            <button
                                type="button"
                                key={item.value}
                                className={`${styles.comboOption} ${value?.value === item.value ? styles.comboOptionSelected : ""}`}
                                onClick={() => {
                                    onChange(item);
                                    setOpen(false);
                                }}
                            >
                                {item.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
