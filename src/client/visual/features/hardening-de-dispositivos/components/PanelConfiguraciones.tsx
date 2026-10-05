import { useState, useMemo, useEffect, type ReactNode } from 'react';
import styles from '../styles/PanelConfiguraciones.module.css';
import obtenerConfiguraciones from '../utils/obtenerConfiguraciones';
import { useEscenario } from '../../../common/contexts';
import { useECSSceneContext } from '../../escenarios-simulados/context/ECSSceneContext';
import { useOSTheme } from '../context/OSThemeContext';
import ShieldCheckIcon from '../../../common/icons/ShieldCheckIcon';
import SistemaOpIcon from '../../../common/icons/SistemaOpIcon';
import KeyIcon from '../../../common/icons/KeyIcon';
import ComputadoraIcon from '../../../common/icons/ComputadoraIcon';

function StorageIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="10" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="11" cy="4" r="0.75" fill="currentColor" />
            <circle cx="11" cy="12" r="0.75" fill="currentColor" />
        </svg>
    );
}

function PolicyIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
            <path d="M4 2.5H12C12.5523 2.5 13 2.94772 13 3.5V12.5C13 13.0523 12.5523 13.5 12 13.5H4C3.44772 13.5 3 13.0523 3 12.5V3.5C3 2.94772 3.44772 2.5 4 2.5Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 5.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5.5 8H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5.5 10.5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

interface Categoria {
    titulo: string;
    descripcion: string;
    icono: ReactNode;
    configs: string[];
}

const CATEGORIAS: Categoria[] = [
    {
        titulo: 'Antivirus',
        descripcion: 'Actualizaciones automáticas, gestión de antivirus',
        icono: <ShieldCheckIcon size={20} />,
        configs: [
            'Actualizaciones automáticas de antivirus',
            'Antivirus gestionado',
        ],
    },
    {
        titulo: 'Parches y actualizaciones',
        descripcion: 'Aplicación de parches, actualizaciones automáticas',
        icono: <SistemaOpIcon size={20} />,
        configs: [
            'Usuario aplica parches',
            'Actualización automática de parches',
            'Actualizar parches al publicarse',
            'Actualización regular de parches',
        ],
    },
    {
        titulo: 'Contraseñas y autenticación',
        descripcion: 'Políticas de contraseñas, contraseña única',
        icono: <KeyIcon size={20} />,
        configs: [
            'Aplicar política de contraseñas',
            'Usar contraseña única',
        ],
    },
    {
        titulo: 'Seguridad de sesión',
        descripcion: 'Bloqueo por inactividad, cierre de sesión',
        icono: <ComputadoraIcon size={20} />,
        configs: [
            'Bloqueo automático por inactividad',
            'Bloquear o cerrar sesión por inactividad',
        ],
    },
    {
        titulo: 'Almacenamiento y medios',
        descripcion: 'Medios extraíbles, almacenamiento local',
        icono: <StorageIcon size={20} />,
        configs: [
            'Bloquear medios extraíbles',
            'Bloquear almacenamiento local',
        ],
    },
    {
        titulo: 'Políticas adicionales',
        descripcion: 'Adjuntos de email, software externo',
        icono: <PolicyIcon size={20} />,
        configs: [
            'Cuidado con adjuntos de email',
            'Sin software externo',
        ],
    },
];

export default function PanelConfiguraciones() {
    const baseConfiguraciones = useMemo(() => obtenerConfiguraciones(), []);
    const [checkedItems, setCheckedItems] = useState<boolean[]>(
        new Array(baseConfiguraciones.length).fill(false)
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

    const { toggleConfigWorkstation } = useECSSceneContext();
    const { dispositivoSeleccionado } = useEscenario();
    const isLinux = useOSTheme() === "linux";
    const rootClass = `${styles.contenedor} ${isLinux ? styles.linux : ""}`;

    useEffect(() => {
        if (!dispositivoSeleccionado || !dispositivoSeleccionado.configuraciones) {
            setCheckedItems(new Array(baseConfiguraciones.length).fill(false));
            return;
        }

        const newChecked = baseConfiguraciones.map((cfg) => {
            const confs = dispositivoSeleccionado.configuraciones as unknown;
            const arr = Array.isArray(confs) ? (confs as unknown[]) : [];
            const found = arr.find((c) => ((c as unknown as Record<string, unknown>)?.nombreConfig as string | undefined) === cfg.configuracion);
            return found ? !!((found as unknown as Record<string, unknown>).activado as boolean | undefined) : false;
        });

        setCheckedItems(newChecked);
    }, [dispositivoSeleccionado, baseConfiguraciones]);

    const handleToggle = (index: number, configuracion: string) => {
        const entidadId = (dispositivoSeleccionado as unknown as { entidadId?: number })?.entidadId;
        if (typeof entidadId !== 'number') return;

        toggleConfigWorkstation(entidadId, configuracion);
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = !newCheckedItems[index];
        setCheckedItems(newCheckedItems);
    };

    const configIndex = useMemo(() => {
        const map = new Map<string, number>();
        baseConfiguraciones.forEach((cfg, i) => map.set(cfg.configuracion, i));
        return map;
    }, [baseConfiguraciones]);

    const catActiva = CATEGORIAS.find(c => c.titulo === categoriaActiva);

    // Detail view
    if (catActiva) {
        const items = catActiva.configs
            .map((nombre) => {
                const idx = configIndex.get(nombre);
                if (idx === undefined) return null;
                return { nombre, idx };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        return (
            <div className={rootClass}>
                <div className={styles.breadcrumb}>
                    <button className={styles.breadcrumbLink} onClick={() => setCategoriaActiva(null)}>
                        Configuración
                    </button>
                    <span className={styles.breadcrumbSep}>{'›'}</span>
                    <span className={styles.breadcrumbActual}>{catActiva.titulo}</span>
                </div>

                <div className={styles.detalleCard}>
                    {items.map(({ nombre, idx }) => (
                        <div
                            key={idx}
                            className={styles.configRow}
                            onClick={() => handleToggle(idx, nombre)}
                            data-context={nombre.toLowerCase()}
                            data-object-name={`Configuración: ${nombre}`}
                        >
                            <div className={styles.configInfo}>
                                <span className={styles.configNombre}>{nombre}</span>
                                <span className={styles.configEstado}>
                                    {checkedItems[idx] ? 'Activado' : 'Desactivado'}
                                </span>
                            </div>
                            <label className={styles.toggle} onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    aria-label={nombre}
                                    className={styles.toggleInput}
                                    checked={checkedItems[idx]}
                                    onChange={() => handleToggle(idx, nombre)}
                                />
                                <span className={styles.toggleTrack} />
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Category list view
    const query = searchQuery.toLowerCase();
    const categoriasVisibles = CATEGORIAS.filter(cat =>
        !query || cat.titulo.toLowerCase().includes(query) ||
        cat.descripcion.toLowerCase().includes(query) ||
        cat.configs.some(c => c.toLowerCase().includes(query))
    );

    return (
        <div className={rootClass}>
            <div className={styles.searchBar}>
                <span className={styles.searchIcon}>
                    <SearchIcon size={14} />
                </span>
                <input
                    type="text"
                    aria-label="Buscar configuración"
                    className={styles.searchInput}
                    placeholder="Buscar configuración"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {categoriasVisibles.length === 0 ? (
                <div className={styles.emptyState}>
                    No se encontraron configuraciones
                </div>
            ) : (
                <div className={styles.listaCards}>
                    {categoriasVisibles.map((cat) => (
                        <button
                            key={cat.titulo}
                            className={styles.catCard}
                            onClick={() => { setCategoriaActiva(cat.titulo); setSearchQuery(''); }}
                        >
                            <span className={styles.catIcono}>{cat.icono}</span>
                            <div className={styles.catTexto}>
                                <span className={styles.catTitulo}>{cat.titulo}</span>
                                <span className={styles.catDesc}>{cat.descripcion}</span>
                            </div>
                            <span className={styles.catChevron}><ChevronRight /></span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
