/*  eslint-disable  @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import ComboBox from '../../../common/components/ComboBox';
import styles from '../styles/ModalFirewall.module.css';
import { useFirewall } from '../hooks';
import BotonServicioFirewall from './BotonServicioFirewall';
import type { Entidad } from '../../../../ecs/core';
import { DireccionTrafico } from '../../../../shared/types/FirewallTypes';
import { useEscenario } from '../../../common/contexts';
import { getConfiguracionesProtocolos } from '../utils/obtenerConfiguraciones';

type RedOption = {
    label: string;
    value: Entidad;
};

export default function ModalFirewall() {
    const configuracionesProtocolos = getConfiguracionesProtocolos();
    const { redesRouter, toggleTodosServicios, obtenerTextoBoton, logsFirewall } = useFirewall();
    const { entidadSeleccionadaId } = useEscenario();

    const REDES: RedOption[] = useMemo(() => {
        return redesRouter.map(red => ({
            label: red.nombre,
            value: red.entidadId
        }));
    }, [redesRouter]);

    const [redSeleccionada, setRedSeleccionada] = useState<Entidad | null>(REDES[0]?.value || null);

    if (!redSeleccionada) {
        return (
            <div className={styles.modalFirewallContainer}>
                <p style={{ color: 'white', padding: '1rem' }}>No hay redes disponibles para configurar en este firewall.</p>
            </div>
        );
    }

    return (
        <div className={styles.modalFirewallContainer}>
            <div style={{ width: "180px" }}>
                <ComboBox
                    items={REDES}
                    value={REDES.find(r => r.value === redSeleccionada) || null}
                    onChange={(item) => setRedSeleccionada(item.value)}
                    getKey={(item) => String(item.value)}
                    getLabel={(item) => item.label}
                    placeholder="Selecciona una red"
                />
            </div>

            <div className={styles.reglasGrid}>
                <div className={styles.redSection}>
                    <div className={styles.direccionGroup}>
                        <div className={styles.direccionHeader}>
                            <span className={styles.direccionLabel}>
                                {`Desde ${REDES.find(r => r.value === redSeleccionada)?.label}`}
                            </span>
                            <button
                                className={styles.toggleTodosBtn}
                                onClick={() => { toggleTodosServicios(entidadSeleccionadaId!, redSeleccionada, DireccionTrafico.DESDE) }}
                            >
                                {obtenerTextoBoton(redSeleccionada, DireccionTrafico.DESDE)}
                            </button>
                        </div>
                        <div className={styles.serviciosGrid}>
                            {configuracionesProtocolos.map((protocolo) => (
                                <BotonServicioFirewall
                                    key={protocolo.protocolo}
                                    protocolo={protocolo.protocolo}
                                    label={protocolo.nombre}
                                    redSeleccionada={redSeleccionada}
                                    direccion={DireccionTrafico.DESDE}
                                />
                            ))}
                        </div>

                    </div>
                    <div className={styles.separator} />
                    <div className={styles.direccionGroup}>
                        <div className={styles.direccionHeader}>
                            <span className={styles.direccionLabel}>
                                {`Hacia ${REDES.find(r => r.value === redSeleccionada)?.label}`}
                            </span>
                            <button
                                className={styles.toggleTodosBtn}
                                onClick={() => { toggleTodosServicios(entidadSeleccionadaId!, redSeleccionada, DireccionTrafico.HACIA) }}
                            >
                                {obtenerTextoBoton(redSeleccionada, DireccionTrafico.HACIA)}
                            </button>
                        </div>
                        <div className={styles.serviciosGrid}>
                            {configuracionesProtocolos.map((protocolo) => (
                                <BotonServicioFirewall
                                    key={protocolo.protocolo}
                                    protocolo={protocolo.protocolo}
                                    label={protocolo.nombre}
                                    redSeleccionada={redSeleccionada}
                                    direccion={DireccionTrafico.HACIA}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>



            <div className={styles.logsSection}>
                <h3 className={styles.subtitle}>Registro de Actividad</h3>
                <div className={styles.logsContent}>
                    {logsFirewall.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No hay registro de actividad en el firewall.</p>
                        </div>
                    ) : (
                        <div className={styles.logsGrid}>
                            {logsFirewall.map((log: any, index) => (
                                <LogItem key={index} log={log} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface LogItemProps {
    log: {
        tipo: 'PERMITIDO' | 'BLOQUEADO' | string;
        origen: string;
        destino: string;
        protocolo: string;
        router?: string;
        mensaje: string;
    };
}

function LogItem({ log }: LogItemProps) {
    const esPermitido = log.tipo === 'PERMITIDO';

    return (
        <div className={`${styles.logItem} ${esPermitido ? styles.logPermitido : styles.logBloqueado}`}>
            <div className={styles.logEstado}>
                {esPermitido ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
                    </svg>
                )}
            </div>
            <div className={styles.logDetalles}>
                <div className={styles.logConexion}>
                    <span className={styles.logOrigen}>{log.origen}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className={styles.logFlecha}>
                        <path fill="currentColor" d="M16.15 13H5q-.425 0-.712-.288T4 12t.288-.712T5 11h11.15L13.3 8.15q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L19.3 11.3q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.575 4.575q-.3.3-.712.288t-.713-.313q-.275-.3-.288-.7t.288-.7z" />
                    </svg>
                    <span className={styles.logDestino}>{log.destino}</span>
                </div>
                <div className={styles.logMeta}>
                    <span className={styles.logProtocolo}>{log.protocolo}</span>
                    {log.router && (
                        <>
                            <span className={styles.logSeparador}>•</span>
                            <span className={styles.logRouter}>{log.router}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
