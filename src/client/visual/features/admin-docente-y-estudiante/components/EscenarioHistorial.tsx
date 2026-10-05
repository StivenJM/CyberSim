import { useState, type ReactNode } from 'react';
import type { Progreso } from '../hooks/useEstudiantes';
import styles from '../styles/EscenarioHistorial.module.css';

export interface EscenarioAgrupado {
    nombre: string;
    slug_escenario: string;
    intentos: Progreso[];
    completado: boolean;
}

export function agruparEscenarios(progresos: Progreso[]): EscenarioAgrupado[] {
    const porEscenario = progresos.reduce((acc, p) => {
        const slug = p.slug_escenario;
        if (!slug) return acc;
        if (!acc[slug]) acc[slug] = { nombre: p.nombre_escenario, slug_escenario: slug, intentos: [], completado: false };
        acc[slug].intentos.push(p);
        if (p.terminado) acc[slug].completado = true;
        return acc;
    }, {} as Record<string, EscenarioAgrupado>);

    return Object.values(porEscenario).filter(e => e.slug_escenario !== 'ai-generated-scenario');
}

function formatTiempo(t: number | null) {
    if (t === null) return '--:--';
    const mins = Math.floor(t / 60).toString().padStart(2, '0');
    const secs = Math.floor(t % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function formatFecha(fecha?: string) {
    if (!fecha) return '';
    const date = new Date(fecha);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

    if (isToday) return `Hoy, ${time}`;
    if (isYesterday) return `Ayer, ${time}`;
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' }) + `, ${time}`;
}

interface EscenarioHistorialProps {
    escenarios: EscenarioAgrupado[];
    renderActions?: (esc: EscenarioAgrupado) => ReactNode;
}

export default function EscenarioHistorial({ escenarios, renderActions }: EscenarioHistorialProps) {
    const [expandedEscenarios, setExpandedEscenarios] = useState<Set<string>>(new Set());

    const toggle = (slug: string) => setExpandedEscenarios(prev => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        return next;
    });

    return (
        <div className={styles.historialList}>
            {escenarios.map((esc) => {
                const open = expandedEscenarios.has(esc.slug_escenario);
                return (
                    <div key={esc.slug_escenario} className={styles.escenarioBlock}>
                        <div
                            className={styles.escenarioHeader}
                            onClick={() => toggle(esc.slug_escenario)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(esc.slug_escenario); } }}
                            role="button"
                            tabIndex={0}
                            aria-expanded={open}
                        >
                            <div>
                                <h3 className={styles.escenarioTitle}>{esc.nombre}</h3>
                                <div className={styles.escenarioMetaRow}>
                                    <p className={styles.escenarioMeta}>
                                        {esc.intentos.length} intento{esc.intentos.length !== 1 ? 's' : ''}
                                    </p>
                                    <span className={styles.metaDot}>·</span>
                                    <div className={styles.intentoBars}>
                                        {esc.intentos.slice(-5).map((p) => (
                                            <span
                                                key={p.id_progreso}
                                                className={p.terminado ? styles.barOk : styles.barFail}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.escenarioActions}>
                                {renderActions?.(esc)}
                                <div className={styles.chevronWrap}>
                                    <svg
                                        className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                                        width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {open && esc.intentos.length > 0 && (
                            <div className={styles.intentosList}>
                                {[...esc.intentos].reverse().map((intento, i) => (
                                    <div key={intento.id_progreso} className={styles.intentoRow}>
                                        <span className={`${styles.intentoDot} ${intento.terminado ? styles.dotOk : styles.dotFail}`} />
                                        <span className={styles.intentoNum}>{formatFecha(intento.fecha_creacion) || `Intento ${esc.intentos.length - i}`}</span>
                                        <span className={styles.intentoTiempo}>{formatTiempo(intento.tiempo)}</span>
                                        <span className={intento.terminado ? styles.intentoStatusOk : styles.intentoStatusFail}>
                                            {intento.terminado ? 'Completado' : 'Fallido'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
