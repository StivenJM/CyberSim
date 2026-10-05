import { useEffect, useState } from "react";
import styles from "../styles/ModalExploradorArchivos.module.css";
import { useEscenario } from "../../../common/contexts";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { useOSTheme } from "../context/OSThemeContext";
import type { Activo } from "../../../../shared/types/EscenarioTypes";
import { TipoActivo } from "../../../../shared/types/DeviceEnums";
import { ArrowLeft, ArrowUp, ArrowRight, RotateCw, ChevronRight } from "lucide-react";

const extensiones: Record<string, string> = {
    [TipoActivo.DOCUMENTO]: ".doc",
    [TipoActivo.FIRMA_DIGITAL]: ".sig",
    [TipoActivo.CLAVE_PUBLICA]: ".pub",
    [TipoActivo.GENERICO]: ".txt",
};

const tipoLabels: Record<string, string> = {
    [TipoActivo.DOCUMENTO]: "Documento",
    [TipoActivo.FIRMA_DIGITAL]: "Firma digital",
    [TipoActivo.CLAVE_PUBLICA]: "Clave pública",
    [TipoActivo.GENERICO]: "Archivo",
};

function getExtension(tipo: TipoActivo): string {
    return extensiones[tipo] ?? ".txt";
}

function tieneExtension(nombre: string): boolean {
    return /\.\w{2,5}$/.test(nombre);
}

function getTipoLabel(tipo: TipoActivo): string {
    return tipoLabels[tipo] ?? "Archivo";
}

const pesoBasePorTipo: Record<string, number> = {
    [TipoActivo.DOCUMENTO]: 4096,
    [TipoActivo.FIRMA_DIGITAL]: 2048,
    [TipoActivo.CLAVE_PUBLICA]: 1024,
    [TipoActivo.GENERICO]: 512,
};

function calcularTamanio(activo: Activo): string {
    const tipo = activo.tipo ?? TipoActivo.GENERICO;
    const base = pesoBasePorTipo[tipo] ?? 512;
    const contenido = (activo.contenido?.length ?? 0) * 2;
    const nombre = activo.nombre.length * 2;
    const bytes = base + contenido + nombre;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}

function FileIcon({ tipo }: { tipo: TipoActivo }) {
    switch (tipo) {
        case TipoActivo.DOCUMENTO:
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4cc2ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                </svg>
            );
        case TipoActivo.FIRMA_DIGITAL:
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-solid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15l2 2 4-4" />
                </svg>
            );
        case TipoActivo.CLAVE_PUBLICA:
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning-solid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
            );
        default:
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
    }
}

function FolderSmallIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3.5C2 3.22 2.22 3 2.5 3H6L7.5 4.5H13.5C13.78 4.5 14 4.72 14 5V12.5C14 12.78 13.78 13 13.5 13H2.5C2.22 13 2 12.78 2 12.5V3.5Z" fill="#FFCA28" />
            <path d="M2 5.5H14V12.5C14 12.78 13.78 13 13.5 13H2.5C2.22 13 2 12.78 2 12.5V5.5Z" fill="#FFC107" />
        </svg>
    );
}

function ComputerSmallIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="8" rx="1" fill="#546E7A" />
            <rect x="3" y="4" width="10" height="6" rx="0.5" fill="#4FC3F7" />
            <path d="M5 13h6M8 11v2" stroke="#78909C" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}

const SIDEBAR_FOLDERS = [
    { id: "documentos", label: "Documentos" },
    { id: "escritorio", label: "Escritorio" },
    { id: "descargas", label: "Descargas" },
    { id: "imagenes", label: "Imágenes" },
    { id: "musica", label: "Música" },
    { id: "videos", label: "Videos" },
];

export default function ModalExploradorArchivos() {
    const [activos, setActivos] = useState<Activo[]>([]);
    const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);
    const { entidadSeleccionadaId } = useEscenario();
    const { escenarioController } = useECSSceneContext();
    const isLinux = useOSTheme() === "linux";

    useEffect(() => {
        if (entidadSeleccionadaId !== null) {
            const activosDispositivo = escenarioController.getActivosDeDispositivo(entidadSeleccionadaId);
            if (activosDispositivo) {
                setActivos([...activosDispositivo]);
                if (activosDispositivo.length > 0) {
                    setActivoSeleccionado(activosDispositivo[0]);
                }
            }
        }
    }, [entidadSeleccionadaId, escenarioController]);

    return (
        <div className={`${styles.contenedor} ${isLinux ? styles.linux : ""}`}>
            {/* Address bar */}
            <div className={styles.addressBar}>
                <div className={styles.navButtons}>
                    <span className={styles.navBtn}><ArrowLeft size={16} /></span>
                    <span className={styles.navBtn}><ArrowRight size={16} /></span>
                    <span className={styles.navBtn}><ArrowUp size={16} /></span>
                    <span className={styles.navBtn}><RotateCw size={14} /></span>
                </div>
                <div className={styles.addressPath}>
                    <ComputerSmallIcon />
                    <ChevronRight size={14} className={styles.addressSep} />
                    <span>Documentos</span>
                    <ChevronRight size={14} className={styles.addressSep} />
                </div>
            </div>

            {/* Main body */}
            <div className={styles.body}>
                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarSection}>
                        <div className={styles.sidebarItem}>
                            <ComputerSmallIcon />
                            <span>Este PC</span>
                        </div>
                    </div>
                    <div className={styles.sidebarSection}>
                        {SIDEBAR_FOLDERS.map(folder => (
                            <div
                                key={folder.id}
                                className={`${styles.sidebarItem} ${folder.id === "documentos" ? styles.sidebarItemActive : ""}`}
                            >
                                <FolderSmallIcon />
                                <span>{folder.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* File list */}
                <div className={styles.filePanel}>
                    {activos.length === 0 ? (
                        <div className={styles.sinArchivos}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#9e9e9e" opacity="0.25">
                                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                            </svg>
                            <p>Carpeta vacía</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.columnHeaders}>
                                <span className={styles.colNombre}>Nombre</span>
                                <span className={styles.colTipo}>Tipo</span>
                                <span className={styles.colTamanio}>Tamaño</span>
                            </div>
                            <div className={styles.listaArchivos}>
                                {activos.map((activo) => {
                                    const tipo = activo.tipo ?? TipoActivo.GENERICO;
                                    return (
                                        <div
                                            key={activo.nombre}
                                            className={`${styles.itemArchivo} ${activoSeleccionado?.nombre === activo.nombre ? styles.seleccionado : ""}`}
                                            onClick={() => setActivoSeleccionado(activo)}
                                        >
                                            <span className={styles.colNombre}>
                                                <FileIcon tipo={tipo} />
                                                <span className={styles.nombreArchivo}>
                                                    {activo.nombre}{!tieneExtension(activo.nombre) && <span className={styles.extension}>{getExtension(tipo)}</span>}
                                                </span>
                                            </span>
                                            <span className={styles.colTipo}>{getTipoLabel(tipo)}</span>
                                            <span className={styles.colTamanio}>{calcularTamanio(activo)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Preview panel */}
                <div className={styles.previewPanel}>
                    {activoSeleccionado ? (
                        <div className={styles.visorDocumento}>
                            <div className={styles.documento}>
                                <pre>{activoSeleccionado.contenido ?? "Sin contenido"}</pre>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.sinSeleccion}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#9e9e9e" opacity="0.2">
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                            </svg>
                            <p>Selecciona un archivo</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status bar */}
            <div className={styles.statusBar}>
                <span>{activos.length} elemento{activos.length !== 1 ? "s" : ""}</span>
                {activoSeleccionado && (
                    <>
                        <span className={styles.statusSep} />
                        <span>{activoSeleccionado.nombre}{!tieneExtension(activoSeleccionado.nombre) && getExtension(activoSeleccionado.tipo ?? TipoActivo.GENERICO)}</span>
                    </>
                )}
            </div>
        </div>
    );
}
