import { NivelController } from "../../../../ecs/controllers/NivelController";
import type { EscenarioPreview } from "../../../../shared/types/EscenarioTypes";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useSelectedLevel } from "../../../common/contexts/SelectedLevelContext";
import type { Escenario } from "../../../../shared/types/EscenarioTypes";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface Progreso {
    id_progreso: number;
    id_estudiante: number;
    slug_escenario: string;
    nombre_escenario: string;
    terminado: boolean;
    tiempo: number | null;
}

interface CategoriaGroup {
    categoria: string;
    escenarios: EscenarioPreview[];
}

// Zigzag pattern: horizontal positions as % from left (50 = center)
// 50 → 60 → 70 → 60 → 50 → 40 → 30 → 40 → repeat
const ZIGZAG_PATTERN = [50, 60, 70, 60, 50, 40, 30, 40];
const NODE_SIZE = 64;
const TARGET_ARC = 100;
const zigzagOffset = (index: number): number =>
    (ZIGZAG_PATTERN[index % ZIGZAG_PATTERN.length] - 50) * 4;

function nodeMarginTop(index: number): number {
    if (index === 0) return 0;
    const dx = zigzagOffset(index) - zigzagOffset(index - 1);
    const dy = Math.sqrt(Math.max(0, TARGET_ARC * TARGET_ARC - dx * dx));
    return Math.max(4, dy - NODE_SIZE);
}

// Category display order (Cap. 1 at top, Cap. 6 at bottom)
const CATEGORY_ORDER = [
    'Cap. 1 — Introducción',
    'Cap. 2 — Criptografía',
    'Cap. 3 — Autenticación',
    'Cap. 4 — Seguridad de Redes',
    'Cap. 5 — Administración de Riesgos',
    'Cap. 6 — Tendencias Actuales',
];

export default function LevelSelectionMenuList() {
    const [escenarios, setEscenarios] = useState<EscenarioPreview[]>([]);
    const [progresos, setProgresos] = useState<Progreso[]>([]);
    const [progresosListos, setProgresosListos] = useState(false);
    const [openTooltip, setOpenTooltip] = useState<number | null>(null);
    const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('bottom');
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { setSelectedEscenario } = useSelectedLevel();
    const nivelController = new NivelController();

    useEffect(() => {
        const escenariosData = nivelController.getEscenarios();
        if (escenariosData) setEscenarios(escenariosData);

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const idEstudiante = user?.id_estudiante;

        // Sin estudiante no hay progresos que esperar: no dejamos el skeleton colgado.
        if (!idEstudiante) {
            setProgresosListos(true);
            return;
        }

        fetch(`${API_BASE_URL}/progreso/estudiante/${idEstudiante}`)
            .then(res => res.json())
            .then(result => {
                if (result.success && result.data) setProgresos(result.data);
            })
            .catch(err => console.error('Error al obtener progresos:', err))
            .finally(() => setProgresosListos(true));
    }, []);

    // Altura estimada del tooltip (título + descripción + botón + padding). Sirve para
    // decidir si cabe abajo del nodo o conviene abrirlo hacia arriba.
    const TOOLTIP_EST_HEIGHT = 260;

    const toggleTooltip = (id: number, nodeEl: HTMLElement) => {
        if (openTooltip === id) {
            setOpenTooltip(null);
            return;
        }
        const rect = nodeEl.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        // Abrir arriba solo si abajo no cabe y arriba hay más espacio.
        const placeTop = spaceBelow < TOOLTIP_EST_HEIGHT + 12 && spaceAbove > spaceBelow;
        setTooltipPlacement(placeTop ? 'top' : 'bottom');
        setOpenTooltip(id);
    };

    const handleSelectLevel = (escenario: EscenarioPreview) => {
        const escenarioCompleto = nivelController.cargarEscenario(escenario.id) as Escenario;
        if (escenarioCompleto) {
            localStorage.setItem("slug_escenario_actual", escenario.slug);
            setSelectedEscenario(escenarioCompleto);
            navigate('/');
        }
    };

    // Close tooltip when clicking outside
    useEffect(() => {
        if (openTooltip === null) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(`.${styles.nodeRow}`)) setOpenTooltip(null);
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [openTooltip]);

    const isCompletado = (slug: string) => progresos.some(p => p.slug_escenario === slug && p.terminado);
    const hasIntentos = (slug: string) => progresos.some(p => p.slug_escenario === slug);

    // Group by categoria, sorted by defined order. Dentro de cada categoría, ordenar por id
    // para que el orden no dependa del orden alfabético de los exports del namespace.
    const groupMap = new Map<string, EscenarioPreview[]>();
    for (const esc of escenarios) {
        const cat = esc.categoria || 'General';
        if (!groupMap.has(cat)) groupMap.set(cat, []);
        groupMap.get(cat)!.push(esc);
    }
    const groups: CategoriaGroup[] = [...groupMap.entries()]
        .sort(([a], [b]) => {
            const ia = CATEGORY_ORDER.indexOf(a);
            const ib = CATEGORY_ORDER.indexOf(b);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        })
        .map(([categoria, escenarios]) => ({
            categoria,
            escenarios: [...escenarios].sort((a, b) => a.id - b.id),
        }));

    // Flat ordered list of all scenario slugs to determine unlock state
    const allSlugs = groups.flatMap(g => g.escenarios.map(e => e.slug));

    const isUnlocked = (flatIndex: number): boolean => {
        if (flatIndex === 0) return true;
        return allSlugs.slice(0, flatIndex).every(slug => isCompletado(slug));
    };

    // Nivel sugerido: primer nodo desbloqueado, no completado y sin intentos previos.
    // Es el candidato natural para "Empezar".
    const suggestedIdx = allSlugs.findIndex(
        (slug, i) => isUnlocked(i) && !isCompletado(slug) && !hasIntentos(slug)
    );

    let globalIndex = 0;

    // Mientras llegan los progresos pintamos un skeleton en las posiciones exactas
    // de los nodos (zigzag), para que la transición al estado real no "salte".
    if (!progresosListos) {
        return (
            <div className={styles.path} ref={containerRef} aria-busy="true">
                {groups.map((group) => (
                    <div key={group.categoria} className={styles.section}>
                        <div className={styles.banner}>
                            <span className={styles.bannerTitle}>{group.categoria}</span>
                        </div>
                        <div className={styles.nodes}>
                            {group.escenarios.map(() => {
                                const offset = zigzagOffset(globalIndex);
                                const mt = nodeMarginTop(globalIndex);
                                globalIndex++;
                                return (
                                    <div
                                        key={globalIndex}
                                        className={styles.nodeRow}
                                        style={{ marginTop: mt, transform: `translateX(${offset}px)` }}
                                    >
                                        <div className={`${styles.node} ${styles.nodeSkeleton}`} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={styles.path} ref={containerRef}>
            {groups.map((group, gi) => (
                <div key={group.categoria} className={styles.section}>
                    <motion.div
                        className={styles.banner}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: gi * 0.06 }}
                    >
                        <span className={styles.bannerTitle}>{group.categoria}</span>
                    </motion.div>

                    <div className={styles.nodes}>
                        {group.escenarios.map((esc) => {
                            const completado = isCompletado(esc.slug);
                            const attempted = hasIntentos(esc.slug);
                            const offset = zigzagOffset(globalIndex);
                            const idx = globalIndex++;
                            const unlocked = isUnlocked(idx);

                            const nodeState = completado ? 'done' : attempted ? 'active' : 'available';

                            const mt = nodeMarginTop(idx);

                            const isOpen = openTooltip === esc.id;
                            const dimmed = !(unlocked || attempted || completado);
                            const isSuggested = idx === suggestedIdx;

                            return (
                                <motion.div
                                    key={esc.id}
                                    className={styles.nodeRow}
                                    style={{ marginTop: mt, zIndex: isOpen || isSuggested ? 10 : 1 }}
                                    initial={{ y: 20, x: offset }}
                                    animate={{ y: 0, x: offset }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                >
                                    {isSuggested && (
                                        <motion.div
                                            className={styles.suggestedLabel}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: openTooltip !== null ? 0 : 1, y: 0 }}
                                            transition={{
                                                opacity: { duration: 0.2 },
                                                y: { duration: 0.25, delay: idx * 0.05 + 0.15 },
                                            }}
                                        >
                                            Empezar
                                            <div className={styles.suggestedArrow} />
                                        </motion.div>
                                    )}
                                    <motion.div
                                        data-node
                                        className={`${styles.node} ${styles[nodeState]}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: (dimmed && !isOpen) ? 0.4 : 1 }}
                                        transition={{ duration: 0.25, delay: idx * 0.05 }}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`${esc.titulo} — ${completado ? 'Completado' : attempted ? 'En progreso' : 'Disponible'}`}
                                        aria-expanded={isOpen}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTooltip(esc.id, e.currentTarget);
                                        }}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTooltip(esc.id, e.currentTarget); } }}
                                    >
                                        {completado ? (
                                            <Check size={24} strokeWidth={3} />
                                        ) : (
                                            <Play size={20} fill="currentColor" />
                                        )}
                                    </motion.div>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                className={`${styles.tooltip} ${tooltipPlacement === 'top' ? styles.tooltipTop : ''}`}
                                                style={{ transform: `translateX(calc(-50% - ${offset}px))` }}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <div className={`${styles.tooltipArrow} ${tooltipPlacement === 'top' ? styles.tooltipArrowTop : ''}`} />
                                                <span className={styles.tooltipTitle}>{esc.titulo}</span>
                                                <p className={styles.tooltipDesc}>{esc.descripcion}</p>
                                                <button
                                                    className={`${styles.tooltipBtn} ${styles[`tooltipBtn--${nodeState}`]}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectLevel(esc);
                                                    }}
                                                >
                                                    {completado ? 'Repetir' : attempted ? 'Continuar' : 'Empezar'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
