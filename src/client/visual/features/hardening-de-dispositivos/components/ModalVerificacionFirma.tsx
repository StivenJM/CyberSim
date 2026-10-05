import { useState, useEffect, useRef } from "react";
import styles from "../styles/ModalVerificacionFirma.module.css";
import DocumentIcon from "../../../common/icons/DocumentIcon";
import KeyIcon from "../../../common/icons/KeyIcon";
import { useEscenario } from "../../../common/contexts";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import { ActivoComponent } from "../../../../ecs/components";
import type { Activo } from "../../../../shared/types/EscenarioTypes";
import { TipoActivo } from "../../../../shared/types/DeviceEnums";
import { ArrowLeft, ArrowRight, ArrowUp, RotateCw, ChevronRight } from "lucide-react";

type Paso = 1 | 2 | 3 | 4;

/* ── Icons ── */

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

/* ── Helpers ── */

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

const pesoBasePorTipo: Record<string, number> = {
    [TipoActivo.DOCUMENTO]: 4096,
    [TipoActivo.FIRMA_DIGITAL]: 2048,
    [TipoActivo.CLAVE_PUBLICA]: 1024,
    [TipoActivo.GENERICO]: 512,
};

function getExtension(tipo: TipoActivo): string {
    return extensiones[tipo] ?? ".txt";
}

function getTipoLabel(tipo: TipoActivo): string {
    return tipoLabels[tipo] ?? "Archivo";
}

function tieneExtension(nombre: string): boolean {
    return /\.\w{2,5}$/.test(nombre);
}

function calcularTamanio(activo: Activo): string {
    const tipo = activo.tipo ?? TipoActivo.GENERICO;
    const base = pesoBasePorTipo[tipo] ?? 512;
    const contenido = (activo.contenido?.length ?? 0) * 2;
    const nombre = activo.nombre.length * 2;
    const bytes = base + contenido + nombre;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}

const FP_SIDEBAR_FOLDERS = [
    { id: "documentos", label: "Documentos" },
    { id: "escritorio", label: "Escritorio" },
    { id: "descargas", label: "Descargas" },
    { id: "imagenes", label: "Imágenes" },
    { id: "musica", label: "Música" },
    { id: "videos", label: "Videos" },
];

/* ── Draggable File Picker ── */

interface FilePickerItem {
    id: string;
    nombre: string;
    activo: Activo;
}

interface FilePickerProps {
    items: FilePickerItem[];
    selectedItem: FilePickerItem | null;
    onSelect: (item: FilePickerItem) => void;
    onConfirm: () => void;
    placeholder: string;
    emptyMessage: string;
    confirmDisabled: boolean;
}

function FilePicker({ items, selectedItem, onSelect, onConfirm, placeholder, emptyMessage, confirmDisabled }: FilePickerProps) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const dragState = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

    const handleDragStart = (e: React.MouseEvent) => {
        e.preventDefault();
        dragState.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: pos.x,
            startPosY: pos.y,
        };

        const handleMouseMove = (ev: MouseEvent) => {
            const { startX, startY, startPosX, startPosY } = dragState.current;
            setPos({
                x: startPosX + (ev.clientX - startX),
                y: startPosY + (ev.clientY - startY),
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const selectedNombre = selectedItem
        ? (tieneExtension(selectedItem.nombre) ? selectedItem.nombre : `${selectedItem.nombre}${getExtension(selectedItem.activo.tipo ?? TipoActivo.GENERICO)}`)
        : "";

    return (
        <div className={styles.filePicker} style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
            <div className={styles.fpAddressBar} onMouseDown={handleDragStart}>
                <div className={styles.fpNavButtons}>
                    <span className={styles.fpNavBtn}><ArrowLeft size={16} /></span>
                    <span className={styles.fpNavBtn}><ArrowRight size={16} /></span>
                    <span className={styles.fpNavBtn}><ArrowUp size={16} /></span>
                    <span className={styles.fpNavBtn}><RotateCw size={14} /></span>
                </div>
                <div className={styles.fpAddressPath}>
                    <ComputerSmallIcon />
                    <ChevronRight size={14} className={styles.fpAddressSep} />
                    <span>Documentos</span>
                    <ChevronRight size={14} className={styles.fpAddressSep} />
                </div>
            </div>

            <div className={styles.fpBody}>
                <div className={styles.fpSidebar}>
                    <div className={styles.fpSidebarSection}>
                        <div className={styles.fpSidebarItem}>
                            <ComputerSmallIcon />
                            <span>Este PC</span>
                        </div>
                    </div>
                    <div className={styles.fpSidebarSection}>
                        {FP_SIDEBAR_FOLDERS.map(folder => (
                            <div
                                key={folder.id}
                                className={`${styles.fpSidebarItem} ${folder.id === "documentos" ? styles.fpSidebarItemActive : ""}`}
                            >
                                <FolderSmallIcon />
                                <span>{folder.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.fpFilePanel}>
                    {items.length === 0 ? (
                        <div className={styles.fpEmpty}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#9e9e9e" opacity="0.25">
                                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                            </svg>
                            <p>{emptyMessage}</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.fpColumnHeaders}>
                                <span className={styles.fpColNombre}>Nombre</span>
                                <span className={styles.fpColTipo}>Tipo</span>
                                <span className={styles.fpColTamanio}>Tamaño</span>
                            </div>
                            <div className={styles.fpFileList}>
                                {items.map((item) => {
                                    const tipo = item.activo.tipo ?? TipoActivo.GENERICO;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`${styles.fpFileItem} ${selectedItem?.id === item.id ? styles.fpFileItemSelected : ""}`}
                                            onClick={() => onSelect(item)}
                                        >
                                            <span className={styles.fpColNombre}>
                                                <FileIcon tipo={tipo} />
                                                <span className={styles.fpFileName}>
                                                    {item.nombre}{!tieneExtension(item.nombre) && <span className={styles.fpExtension}>{getExtension(tipo)}</span>}
                                                </span>
                                            </span>
                                            <span className={styles.fpColTipo}>{getTipoLabel(tipo)}</span>
                                            <span className={styles.fpColTamanio}>{calcularTamanio(item.activo)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.fpPreview}>
                    {selectedItem ? (
                        <div className={styles.fpPreviewContent}>
                            <div className={styles.fpPreviewCard}>
                                <pre>{selectedItem.activo.contenido ?? "Sin contenido"}</pre>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.fpPreviewEmpty}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#9e9e9e" opacity="0.2">
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                            </svg>
                            <p>Selecciona un archivo</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.fpFooter}>
                <span className={styles.fpFooterLabel}>Nombre:</span>
                <input
                    className={styles.fpFooterInput}
                    type="text"
                    aria-label={placeholder}
                    readOnly
                    value={selectedNombre}
                    placeholder={placeholder}
                />
                <button
                    className={styles.fpFooterBtn}
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                >
                    Abrir
                </button>
            </div>
        </div>
    );
}

/* ── Interfaces ── */

interface ClavePublica {
    id: string;
    nombre: string;
    activo: Activo;
}

interface DocumentoDisponible {
    id: string;
    nombre: string;
    activo: Activo;
}

/* ── Main Component ── */

function ModalVerificacionFirma() {
    const { entidadSeleccionadaId } = useEscenario();
    const { redController } = useECSSceneContext();
    const [pasoActual, setPasoActual] = useState<Paso>(1);
    const [documentosDisponibles, setDocumentosDisponibles] = useState<DocumentoDisponible[]>([]);
    const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoDisponible | null>(null);
    const [hashDocumento, setHashDocumento] = useState<string>("");
    const [firmasDisponibles, setFirmasDisponibles] = useState<Activo[]>([]);
    const [firmaActivo, setFirmaActivo] = useState<Activo | null>(null);
    const [clavesPublicasDisponibles, setClavesPublicasDisponibles] = useState<ClavePublica[]>([]);
    const [claveSeleccionada, setClaveSeleccionada] = useState<ClavePublica | null>(null);
    const [hashFirma, setHashFirma] = useState<string>("");
    const [veredicto, setVeredicto] = useState<"valido" | "invalido" | null>(null);
    const [filePickerAbierto, setFilePickerAbierto] = useState(false);
    const [filePickerClaveAbierto, setFilePickerClaveAbierto] = useState(false);

    useEffect(() => {
        if (!entidadSeleccionadaId || !redController) {
            return;
        }

        const activoComponent = redController.ecsManager.getComponentes(entidadSeleccionadaId)?.get(ActivoComponent);

        if (!activoComponent?.activos || activoComponent.activos.length === 0) {
            setDocumentosDisponibles([]);
            setClavesPublicasDisponibles([]);
            setFirmasDisponibles([]);
            setFirmaActivo(null);
            return;
        }

        const activos = activoComponent.activos;

        const documentos = activos
            .filter((activo) => activo.tipo === TipoActivo.DOCUMENTO && activo.firma)
            .map((activo, index) => ({
                id: index.toString(),
                nombre: activo.nombre || `Documento ${index + 1}`,
                activo: activo,
            }));
        setDocumentosDisponibles(documentos);

        const firmas = activos.filter(
            (activo) => activo.tipo === TipoActivo.FIRMA_DIGITAL
        );
        setFirmasDisponibles(firmas || null);
        const firma = firmas.find((firma) => firma.tipo === TipoActivo.FIRMA_DIGITAL);
        setFirmaActivo(firma || null);

        const claves = activos
            .filter((activo) => activo.tipo === TipoActivo.CLAVE_PUBLICA)
            .map((activo, index) => ({
                id: index.toString(),
                nombre: activo.nombre || `Clave Pública ${index + 1}`,
                activo: activo,
            }));
        setClavesPublicasDisponibles(claves);
    }, [entidadSeleccionadaId, redController]);

    const generarHashDocumento = async () => {
        if (!documentoSeleccionado?.activo?.contenido) return;

        const escenarioController = EscenarioController.getInstance();
        const hash = await escenarioController.getHashDocumento(documentoSeleccionado.activo.contenido);
        if (hash) {
            setHashDocumento(hash);
        }
    };

    const descifrarFirma = async () => {
        if (!claveSeleccionada || !firmaActivo) return;

        const escenarioController = EscenarioController.getInstance();
        const firma = firmasDisponibles.find((firma) => firma.propietario === claveSeleccionada.activo.propietario)!;
        setFirmaActivo(firma);
        const hash = await escenarioController.getHashFirma(firma, claveSeleccionada.activo);
        if (hash) {
            setHashFirma(hash);
        }
    };

    const emitirVeredicto = (esValido: boolean) => {
        setVeredicto(esValido ? "valido" : "invalido");

        if (documentoSeleccionado && firmaActivo && claveSeleccionada) {
            const escenarioController = EscenarioController.getInstance();
            escenarioController.registrarVeredictoFirma({
                nombreDocumento: documentoSeleccionado.activo.nombre || "Documento",
                nombreFirma: firmaActivo.nombre || "Firma",
                nombreClave: claveSeleccionada.activo.nombre || "Clave",
                veredicto: esValido,
            });
        }
    };

    const reiniciar = () => {
        setPasoActual(1);
        setDocumentoSeleccionado(null);
        setFilePickerAbierto(false);
        setFilePickerClaveAbierto(false);
        setHashDocumento("");
        setClaveSeleccionada(null);
        setHashFirma("");
        setVeredicto(null);
    };

    return (
        <div className={styles.contenedor}>
            <div className={styles.indicadorPasos}>
                <div className={`${styles.paso} ${pasoActual >= 1 ? styles.pasoActivo : ""}`}>
                    <div className={styles.numeroPaso}>1</div>
                    <span>Documento</span>
                </div>
                <div className={styles.lineaConexion}></div>
                <div className={`${styles.paso} ${pasoActual >= 2 ? styles.pasoActivo : ""}`}>
                    <div className={styles.numeroPaso}>2</div>
                    <span>Generar Hash</span>
                </div>
                <div className={styles.lineaConexion}></div>
                <div className={`${styles.paso} ${pasoActual >= 3 ? styles.pasoActivo : ""}`}>
                    <div className={styles.numeroPaso}>3</div>
                    <span>Descifrar Firma</span>
                </div>
                <div className={styles.lineaConexion}></div>
                <div className={`${styles.paso} ${pasoActual >= 4 ? styles.pasoActivo : ""}`}>
                    <div className={styles.numeroPaso}>4</div>
                    <span>Comparar</span>
                </div>
            </div>

            <div className={styles.contenidoPaso}>
                {pasoActual === 1 && (
                    <div className={styles.pasoContenido}>
                        {!filePickerAbierto ? (
                            <div className={styles.paso1Inicio}>
                                <button className={styles.paso1Btn} onClick={() => setFilePickerAbierto(true)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Explorar archivos
                                </button>
                                <p className={styles.paso1Desc}>Abre el explorador de archivos para elegir el documento cuya firma deseas verificar.</p>
                            </div>
                        ) : (
                            <FilePicker
                                items={documentosDisponibles}
                                selectedItem={documentoSeleccionado}
                                onSelect={setDocumentoSeleccionado}
                                onConfirm={() => setPasoActual(2)}
                                placeholder="Selecciona un documento"
                                emptyMessage="No hay documentos firmados"
                                confirmDisabled={!documentoSeleccionado}
                            />
                        )}
                    </div>
                )}

                {pasoActual === 2 && (
                    <div className={styles.pasoContenido}>
                        <h2 className={styles.tituloPaso}>
                            <DocumentIcon size={24} />
                            Generador de Hash
                        </h2>
                        <div className={styles.visualizacion}>
                            <div className={styles.documentoIcono}>
                                <DocumentIcon size={64} />
                                <span>{documentoSeleccionado?.nombre || "Documento"}</span>
                            </div>
                            <div className={styles.flecha}>→</div>
                            <div className={styles.hashResultado}>
                                <div className={styles.etiquetaHash}>SHA-256</div>
                                <div className={styles.etiquetaHash}>HASH</div>
                            </div>
                        </div>
                        {!hashDocumento ? (
                            <button className={styles.botonPrincipal} onClick={generarHashDocumento}>
                                Calcular Hash del Documento
                            </button>
                        ) : (
                            <>
                                <div className={styles.resultadoHash}>
                                    <span className={styles.etiquetaResultado}>HASH CALCULADO DEL DOCUMENTO</span>
                                    <div className={styles.hashValor}>{hashDocumento}</div>
                                </div>
                                <button
                                    className={styles.botonSiguiente}
                                    onClick={() => setPasoActual(3)}
                                >
                                    Siguiente: Descifrar Firma →
                                </button>
                            </>
                        )}
                    </div>
                )}

                {pasoActual === 3 && (
                    <div className={styles.pasoContenido}>
                        <h2 className={styles.tituloPaso}>
                            <KeyIcon size={24} />
                            Descifrador de Firma
                        </h2>
                        <div className={styles.visualizacion}>
                            <div className={styles.inputVisual}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <span>FIRMA<br />CIFRADA</span>
                            </div>
                            <div className={styles.operador}>+</div>
                            <div className={styles.inputVisual}>
                                <KeyIcon size={32} />
                                <span>CLAVE<br />PÚBLICA</span>
                            </div>
                            <div className={styles.flecha}>→</div>
                            <div className={styles.outputVisual}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                                <span>HASH<br />EXTRAÍDO</span>
                            </div>
                        </div>

                        {!filePickerClaveAbierto && !claveSeleccionada ? (
                            <div className={styles.paso1Inicio}>
                                <p className={styles.paso1Desc}>Selecciona la clave pública para descifrar la firma del documento.</p>
                                <button className={styles.paso1Btn} onClick={() => setFilePickerClaveAbierto(true)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Explorar claves públicas
                                </button>
                            </div>
                        ) : filePickerClaveAbierto && !claveSeleccionada ? (
                            <FilePicker
                                items={clavesPublicasDisponibles}
                                selectedItem={claveSeleccionada}
                                onSelect={setClaveSeleccionada}
                                onConfirm={() => setFilePickerClaveAbierto(false)}
                                placeholder="Selecciona una clave pública"
                                emptyMessage="No hay claves públicas"
                                confirmDisabled={!claveSeleccionada}
                            />
                        ) : (
                            <div className={styles.formulario}>
                                {!hashFirma ? (
                                    <>
                                        <div className={styles.itemClave} style={{ cursor: 'default' }}>
                                            <KeyIcon size={20} />
                                            <span>{claveSeleccionada?.nombre}{!tieneExtension(claveSeleccionada?.nombre ?? "") && ".pub"}</span>
                                        </div>
                                        <button
                                            className={styles.botonPrincipal}
                                            onClick={descifrarFirma}
                                            disabled={!firmaActivo || !claveSeleccionada}
                                        >
                                            Descifrar y Extraer Hash
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.resultadoHash}>
                                            <span className={styles.etiquetaResultado}>HASH EXTRAÍDO DE LA FIRMA</span>
                                            <div className={styles.hashValor}>{hashFirma}</div>
                                        </div>
                                        <button
                                            className={styles.botonSiguiente}
                                            onClick={() => setPasoActual(4)}
                                        >
                                            Siguiente: Comparar →
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {pasoActual === 4 && (
                    <div className={styles.pasoContenido}>
                        <h2 className={styles.tituloPaso}>
                            Comparador de Hashes
                        </h2>

                        <div className={styles.comparador}>
                            <div className={styles.hashComparacion}>
                                <span className={styles.etiquetaComparacion}>HASH DEL DOCUMENTO</span>
                                <div className={`${styles.hashValorComparar} ${styles.hashDocumento}`}>
                                    {hashDocumento}
                                </div>
                            </div>

                            <div className={styles.simboloComparacion}>=</div>

                            <div className={styles.hashComparacion}>
                                <span className={styles.etiquetaComparacion}>HASH DE LA FIRMA</span>
                                <div className={`${styles.hashValorComparar} ${styles.hashFirma}`}>
                                    {hashFirma}
                                </div>
                            </div>
                        </div>

                        {veredicto === null ? (
                            <div className={styles.botonesVeredicto}>
                                <button
                                    className={styles.botonComparar}
                                    onClick={() => emitirVeredicto(true)}
                                >
                                    Los hashes coinciden
                                </button>
                                <button
                                    className={`${styles.botonComparar} ${styles.botonInvalido}`}
                                    onClick={() => emitirVeredicto(false)}
                                >
                                    Los hashes no coinciden
                                </button>
                            </div>
                        ) : (
                            <div className={`${styles.veredictoFinal} ${veredicto === "valido" ? styles.veredictoValido : styles.veredictoInvalido}`}>
                                <div className={styles.iconoVeredicto}>
                                    {veredicto === "valido" ? (
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    ) : (
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    )}
                                </div>
                                <div className={styles.textoVeredicto}>
                                    <h3>{veredicto === "valido" ? "Veredicto: Firma Válida" : "Veredicto: Firma Inválida"}</h3>
                                    <p>
                                        {veredicto === "valido"
                                            ? "El documento es auténtico y no ha sido modificado."
                                            : "El documento puede haber sido alterado o la firma no corresponde."}
                                    </p>
                                </div>
                                <button className={styles.botonReiniciar} onClick={reiniciar}>
                                    Verificar otra firma
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModalVerificacionFirma;
