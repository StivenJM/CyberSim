import { useEffect, useRef, useState, type ReactNode } from "react";
//import SistemaOpIcon from "../../../common/icons/SistemaOpIcon";
import styles from "../styles/Dispositivos.module.css"

import PanelConfiguraciones from "../components/PanelConfiguraciones";
import { useEscenario } from "../../../common/contexts";
import type { Dispositivo } from "../../../../shared/types/EscenarioTypes";
import { TipoDispositivo } from "../../../../shared/types/DeviceEnums";
import { useDispositivos, useAppsDispositivo } from "../hooks";
import VPNAppIcon from "../../../common/icons/VPNAppIcon";
import ConsolaIcon from "../../../common/icons/ConsolaIcon";
import ModalVPNCliente from "../../simulacion-redes/components/ModalVPNCliente";
import PageTransition from "../../../common/components/PageTransition";
import ShieldCheckIcon from "../../../common/icons/ShieldCheckIcon";
import ModalVerificacionFirma from "../components/ModalVerificacionFirma";
import FileExplorerIcon from "../../../common/icons/FileExplorerIcon";
import ModalExploradorArchivos from "../components/ModalExploradorArchivos";
import AppStoreIcon from "../../../common/icons/AppStoreIcon";
import ModalApps from "../components/ModalApps";
//import ComputadoraIcon from "../../../common/icons/ComputadoraIcon";
import EstePCIcon from "../../../common/icons/EstePCIcon";
import ConfiguracionIcon from "../../../common/icons/ConfiguracionIcon";
import NetScanVizIcon from "../../../common/icons/NetScanVizIcon";
import ConexionIcon from "../../../common/icons/ConexionIcon";
import RedesIcon from "../../../common/icons/RedesIcon";
import ModalEstePC from "../components/ModalEstePC";
import ModalNetScanViz from "../components/ModalNetScanViz";
import ModalSocialSearcher from "../components/ModalSocialSearcher";
import ModalPhishMatic from "../components/ModalPhishMatic";
import ModalConsola from "../components/ModalConsola";
import VentanaOS from "../components/VentanaOS";
import type { SnapZone } from "../components/VentanaOS";
import { OSThemeProvider, getOSCategory, type OSCategory } from "../context/OSThemeContext";
import { DispositivoAppsProvider } from "../context/DispositivoAppsContext";

function getDesktopThemeClass(osCategory: OSCategory, tipo?: TipoDispositivo): string {
    const isServer = tipo === TipoDispositivo.SERVER;
    switch (osCategory) {
        case "windows": return isServer ? styles.escritorioWindowsServer : styles.escritorioWindowsWorkstation;
        case "linux": return `${styles.escritorioLinux} ${isServer ? styles.escritorioLinuxServer : styles.escritorioLinuxWorkstation}`;
        default: return isServer ? styles.escritorioOtherServer : "";
    }
}

function getTaskbarThemeClass(osCategory: OSCategory): string {
    switch (osCategory) {
        case "windows": return styles.barraTareasWindows;
        case "linux": return styles.barraTareasLinux;
        default: return "";
    }
}

type VentanaId = "estePC" | "archivos" | "apps" | "configuracion" | "firmaChecker" | "vpn" | "netScanViz" | "socialSearcher" | "phishMatic" | "consola";

interface VentanaConfig {
    id: VentanaId;
    titulo: string;
    icono: ReactNode;
    contenido: ReactNode;
    posicionInicial: { x: number; y: number };
}

function Dispositivos({ embedded = false }: { embedded?: boolean }) {
    const { setDispositivoSeleccionado, dispositivoSeleccionado, entidadSeleccionadaId } = useEscenario();
    const { dispositivos } = useDispositivos();
    const appsDispositivo = useAppsDispositivo(entidadSeleccionadaId ?? undefined);
    const appInstalada = (nombre: string) => appsDispositivo.appsInstaladas.some(a => a.nombre === nombre);
    const [ventanasAbiertas, setVentanasAbiertas] = useState<VentanaId[]>([]);
    const [ventanasMinimizadas, setVentanasMinimizadas] = useState<VentanaId[]>([]);
    const [iconoSeleccionado, setIconoSeleccionado] = useState<VentanaId | null>(null);
    const [ordenZ, setOrdenZ] = useState<VentanaId[]>([]);
    const [snapPreviewZone, setSnapPreviewZone] = useState<SnapZone>(null);
    const ultimoClick = useRef<{ id: VentanaId; time: number } | null>(null);
    const estadosPorDispositivo = useRef<Map<string, { ventanasAbiertas: VentanaId[]; ventanasMinimizadas: VentanaId[]; ordenZ: VentanaId[]; iconoSeleccionado: VentanaId | null }>>(new Map());

    const osCategory = getOSCategory(dispositivoSeleccionado?.sistemaOperativo);

    const ventanasConfig: VentanaConfig[] = [
        { id: "estePC", titulo: "Este PC", icono: <EstePCIcon size={14} />, contenido: <ModalEstePC />, posicionInicial: { x: 50, y: 30 } },
        { id: "archivos", titulo: "Explorador de archivos", icono: <FileExplorerIcon size={14} />, contenido: <ModalExploradorArchivos />, posicionInicial: { x: 80, y: 50 } },
        { id: "apps", titulo: "Aplicaciones", icono: <AppStoreIcon size={14} />, contenido: <ModalApps />, posicionInicial: { x: 110, y: 70 } },
        { id: "configuracion", titulo: "Configuración", icono: <ConfiguracionIcon size={14} />, contenido: <PanelConfiguraciones />, posicionInicial: { x: 140, y: 40 } },
        { id: "firmaChecker", titulo: "FirmaChecker", icono: <ShieldCheckIcon size={14} />, contenido: <ModalVerificacionFirma />, posicionInicial: { x: 170, y: 60 } },
        { id: "vpn", titulo: "Cliente VPN", icono: <VPNAppIcon size={14} />, contenido: <ModalVPNCliente />, posicionInicial: { x: 200, y: 80 } },
        { id: "netScanViz", titulo: "Net-Scan Viz", icono: <NetScanVizIcon size={14} />, contenido: <ModalNetScanViz />, posicionInicial: { x: 60, y: 60 } },
        { id: "socialSearcher", titulo: "Social-Searcher", icono: <ConexionIcon size={14} />, contenido: <ModalSocialSearcher />, posicionInicial: { x: 90, y: 40 } },
        { id: "phishMatic", titulo: "Phish-Matic", icono: <RedesIcon size={14} />, contenido: <ModalPhishMatic />, posicionInicial: { x: 120, y: 55 } },
        { id: "consola", titulo: "Consola", icono: <ConsolaIcon size={14} />, contenido: <ModalConsola os={osCategory} />, posicionInicial: { x: 150, y: 35 } },
    ];

    const enfocarVentana = (id: VentanaId) => {
        setOrdenZ(prev => [...prev.filter(v => v !== id), id]);
    };

    const abrirVentana = (id: VentanaId) => {
        setVentanasMinimizadas(prev => {
            if (prev.includes(id)) {
                enfocarVentana(id);
                return prev.filter(v => v !== id);
            }
            return prev;
        });
        setVentanasAbiertas(prev => {
            if (!prev.includes(id)) {
                setOrdenZ(z => [...z, id]);
                return [...prev, id];
            }
            enfocarVentana(id);
            return prev;
        });
    };

    const cerrarVentana = (id: VentanaId) => {
        setVentanasAbiertas(prev => prev.filter(v => v !== id));
        setVentanasMinimizadas(prev => prev.filter(v => v !== id));
        setOrdenZ(prev => prev.filter(v => v !== id));
    };

    const minimizarVentana = (id: VentanaId) => {
        setVentanasMinimizadas(prev => prev.includes(id) ? prev : [...prev, id]);
    };

    const handleClickIcono = (e: React.MouseEvent, id: VentanaId) => {
        e.stopPropagation();
        const ahora = Date.now();
        if (ultimoClick.current && ultimoClick.current.id === id && ahora - ultimoClick.current.time < 400) {
            abrirVentana(id);
            ultimoClick.current = null;
        } else {
            setIconoSeleccionado(id);
            ultimoClick.current = { id, time: ahora };
        }
    };

    useEffect(() => {
        if (dispositivos.length === 0) return;

        const esEntidadValida = entidadSeleccionadaId !== null &&
            dispositivos.some(d => d.entidadId === entidadSeleccionadaId);

        if (!dispositivoSeleccionado || !esEntidadValida) {
            setDispositivoSeleccionado(dispositivos[0]);
        }
    }, [dispositivos, dispositivoSeleccionado, entidadSeleccionadaId, setDispositivoSeleccionado]);

    useEffect(() => {
        if (dispositivoSeleccionado) {
            const dispositivoActualizado = dispositivos.find(d => d.entidadId === dispositivoSeleccionado.entidadId);
            if (dispositivoActualizado) {
                setDispositivoSeleccionado(dispositivoActualizado);
            }
        }
    }, [dispositivos]);

    const cambiarDispositivo = (dispositivo: Dispositivo) => {
        // Save current device state
        if (dispositivoSeleccionado) {
            estadosPorDispositivo.current.set(dispositivoSeleccionado.id, {
                ventanasAbiertas,
                ventanasMinimizadas,
                ordenZ,
                iconoSeleccionado,
            });
        }

        setDispositivoSeleccionado(dispositivo);

        // Restore new device state or start fresh
        const estado = estadosPorDispositivo.current.get(dispositivo.id);
        if (estado) {
            setVentanasAbiertas(estado.ventanasAbiertas);
            setVentanasMinimizadas(estado.ventanasMinimizadas);
            setOrdenZ(estado.ordenZ);
            setIconoSeleccionado(estado.iconoSeleccionado);
        } else {
            setVentanasAbiertas([]);
            setVentanasMinimizadas([]);
            setOrdenZ([]);
            setIconoSeleccionado(null);
        }
        ultimoClick.current = null;
    };

    /*const getIconoDispositivo = (tipo: string) => {
        switch (tipo?.toLowerCase()) {
            case "servidor":
                return <SistemaOpIcon size={16} />;
            default:
                return <ComputadoraIcon size={16} />;
        }
    };*/

    const desktopContent = (
        <OSThemeProvider os={osCategory}>
        <DispositivoAppsProvider value={appsDispositivo}>
        <div className={styles.contenedor}>
            {!embedded && (
                <div className={styles.tabsDispositivos}>
                    {dispositivos.map((dispositivo: Dispositivo) => (
                        <button
                            key={dispositivo.id}
                            className={`${styles.tabDispositivo} ${dispositivoSeleccionado?.id === dispositivo.id ? styles.tabDispositivoActivo : ""}`}
                            onClick={() => cambiarDispositivo(dispositivo)}
                        >
                            {dispositivo.nombre ?? "Sin nombre"}
                        </button>
                    ))}
                </div>
            )}

            <div className={`${styles.escritorio} ${getDesktopThemeClass(osCategory, dispositivoSeleccionado?.tipo)}`}>
                <div className={styles.areaEscritorio} onClick={() => setIconoSeleccionado(null)}>
                    <div className={`${styles.iconosEscritorio} ${osCategory === "linux" ? styles.iconosEscritorioLinux : ""}`}>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "estePC" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "estePC")}>
                            <div className={styles.iconoAppImagen}>
                                <EstePCIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>Este PC</span>
                        </button>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "archivos" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "archivos")}>
                            <div className={styles.iconoAppImagen}>
                                <FileExplorerIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>Archivos</span>
                        </button>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "apps" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "apps")}>
                            <div className={styles.iconoAppImagen}>
                                <AppStoreIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>Apps</span>
                        </button>
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "configuracion" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "configuracion")}>
                            <div className={styles.iconoAppImagen}>
                                <ConfiguracionIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>Configuracion</span>
                        </button>
                        {appInstalada("FirmaChecker") && (
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "firmaChecker" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "firmaChecker")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#4DB6AC' }}>
                                <ShieldCheckIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>FirmaChecker</span>
                        </button>
                        )}
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "vpn" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "vpn")}>
                            <div className={styles.iconoAppImagen}>
                                <VPNAppIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>VPN</span>
                        </button>
                        {appInstalada("Net-Scan Viz") && (
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "netScanViz" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "netScanViz")}>
                            <div className={styles.iconoAppImagen}>
                                <NetScanVizIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>Net-Scan Viz</span>
                        </button>
                        )}
                        {appInstalada("Company Social-Searcher") && (
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "socialSearcher" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "socialSearcher")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#42A5F5' }}>
                                <ConexionIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>Social-Searcher</span>
                        </button>
                        )}
                        {appInstalada("Phish-Matic") && (
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "phishMatic" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "phishMatic")}>
                            <div className={styles.iconoAppImagen} style={{ color: '#EF5350' }}>
                                <RedesIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>Phish-Matic</span>
                        </button>
                        )}
                        <button className={`${styles.iconoApp} ${iconoSeleccionado === "consola" ? styles.iconoAppSeleccionado : ""}`} onClick={(e) => handleClickIcono(e, "consola")}>
                            <div className={styles.iconoAppImagen}>
                                <ConsolaIcon size={48} />
                            </div>
                            <span className={styles.iconoAppNombre}>Consola</span>
                        </button>
                    </div>

                    {ventanasAbiertas.map(id => {
                        const config = ventanasConfig.find(v => v.id === id);
                        if (!config) return null;
                        const minimizada = ventanasMinimizadas.includes(id);
                        return (
                            <VentanaOS
                                key={id}
                                titulo={config.titulo}
                                icono={config.icono}
                                onClose={() => cerrarVentana(id)}
                                onMinimize={() => minimizarVentana(id)}
                                onFocus={() => enfocarVentana(id)}
                                onSnapZoneChange={setSnapPreviewZone}
                                initialPosition={config.posicionInicial}
                                initialMaximized
                                zIndex={10 + ordenZ.indexOf(id)}
                                hidden={minimizada}
                            >
                                {config.contenido}
                            </VentanaOS>
                        );
                    })}

                    {snapPreviewZone && (
                        <div className={`${styles.snapPreview} ${
                            snapPreviewZone === "left" ? styles.snapPreviewLeft :
                            snapPreviewZone === "right" ? styles.snapPreviewRight :
                            styles.snapPreviewTop
                        }`} />
                    )}
                </div>
                <div className={`${styles.barraTareas} ${getTaskbarThemeClass(osCategory)}`}>
                    {osCategory === "windows" && (
                        <button className={styles.botonInicio} title="Inicio">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                                <rect x="1" y="1" width="7.5" height="7.5" rx="1" />
                                <rect x="9.5" y="1" width="7.5" height="7.5" rx="1" />
                                <rect x="1" y="9.5" width="7.5" height="7.5" rx="1" />
                                <rect x="9.5" y="9.5" width="7.5" height="7.5" rx="1" />
                            </svg>
                        </button>
                    )}
                    <div className={styles.appsTareas}>
                        {ventanasAbiertas.map(id => {
                            const config = ventanasConfig.find(v => v.id === id);
                            if (!config) return null;
                            return (
                                <button
                                    key={id}
                                    className={`${styles.appTarea} ${!ventanasMinimizadas.includes(id) ? styles.appTareaActiva : ""}`}
                                    onClick={() => abrirVentana(id)}
                                    title={config.titulo}
                                >
                                    {config.icono}
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.bandejaSistema}>
                        <div className={styles.reloj}>
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>{new Date().toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                    </div>
                    {osCategory === "linux" && (
                        <button className={styles.botonAppsLinux} title="Mostrar aplicaciones">
                            <svg width="20" height="20" viewBox="0 0 22 22" fill="currentColor">
                                <circle cx="4" cy="4" r="1.8" />
                                <circle cx="11" cy="4" r="1.8" />
                                <circle cx="18" cy="4" r="1.8" />
                                <circle cx="4" cy="11" r="1.8" />
                                <circle cx="11" cy="11" r="1.8" />
                                <circle cx="18" cy="11" r="1.8" />
                                <circle cx="4" cy="18" r="1.8" />
                                <circle cx="11" cy="18" r="1.8" />
                                <circle cx="18" cy="18" r="1.8" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
        </DispositivoAppsProvider>
        </OSThemeProvider>
    );

    if (embedded) return desktopContent;
    return <PageTransition>{desktopContent}</PageTransition>;
}
export default Dispositivos;
