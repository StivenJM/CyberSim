import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/ComboBox.module.css";
import CaretIcon from "../icons/CaretIcon";

export type ComboBoxProps<T> = {
    items: T[];
    value: T | null | undefined;
    onChange: (item: T) => void;
    getKey: (item: T) => string;
    getLabel: (item: T) => string;
    placeholder?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
    dropdownClassName?: string;
};

function ComboBox<T>({
    items,
    value,
    onChange,
    getKey,
    getLabel,
    placeholder = "Selecciona una opción",
    disabled = false,
    icon,
    className,
    dropdownClassName,
}: ComboBoxProps<T>) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const selectedLabel = useMemo(() => {
        return value != null ? getLabel(value) : placeholder;
    }, [value, getLabel, placeholder]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    function handleSelect(item: T) {
        onChange(item);
        setOpen(false);
    }

    return (
        <div className={`${styles.wrapper} ${className ?? ""}`} ref={wrapperRef}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => !disabled && setOpen((o) => !o)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {icon ? <span className={styles.icon}>{icon}</span> : null}
                <span className={`${styles.label} ${value == null ? styles.placeholder : ""}`}>
                    {selectedLabel}
                </span>
                <CaretIcon size={12} />
            </button>
            {open ? (
                <div className={`${styles.dropdown} ${dropdownClassName ?? ""}`} role="listbox">
                    {items.map((item) => {
                        const key = getKey(item);
                        const isSelected = value != null && key === (value ? getKey(value) : "");
                        return (
                            <div
                                key={key}
                                role="option"
                                aria-selected={isSelected}
                                tabIndex={0}
                                className={`${styles.option} ${isSelected ? styles.selected : ""}`}
                                onClick={() => handleSelect(item)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleSelect(item);
                                    }
                                }}
                            >
                                {getLabel(item)}
                            </div>
                        );
                    })}
                    {items.length === 0 && (
                        <div className={`${styles.option} ${styles.empty}`} aria-disabled>
                            Sin opciones
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default ComboBox;
