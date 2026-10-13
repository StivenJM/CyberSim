import { ColoresRed } from '../../../../../data/colores';
import {
    EstadoAtaqueDispositivo,
    Mueble,
    TipoDispositivo,
    TipoEvento,
    TipoActivo,
} from '../../../../../shared/types/DeviceEnums';

type RawData = Record<string, unknown>;

export function findInObj(obj: unknown, key: string): unknown[] | null {
    if (!obj || typeof obj !== 'object') return null;
    const record = obj as Record<string, unknown>;
    if (Array.isArray(record[key]) && (record[key] as unknown[]).length > 0) return record[key] as unknown[];
    for (const k of Object.keys(record)) {
        const res = findInObj(record[k], key);
        if (res) return res;
    }
    return null;
}

const PALETA_REDES: Record<string, string> = {
    'internet': ColoresRed.ROJO,
    'lan': ColoresRed.CIAN,
    'wan': ColoresRed.NARANJA,
    'dmz': ColoresRed.AMARILLO,
    'vpn': ColoresRed.INDIGO,
    'wifi': ColoresRed.VERDE,
    'externa': ColoresRed.NARANJA,
    'interna': ColoresRed.CIAN,
    'red-lisa': ColoresRed.INDIGO,
    'redwww': ColoresRed.NARANJA,
};

function normalizarRed(red: unknown): RawData {
    if (red && typeof red === 'object' && 'nombre' in (red as object)) {
        return red as RawData;
    }
    const nombre = String(red ?? '');
    const key = nombre.toLowerCase();
    const color = Object.entries(PALETA_REDES).find(([k]) => key.includes(k))?.[1]
        ?? ColoresRed.GRIS;
    return { nombre, color };
}

function normalizarActivos(activosRaw: unknown[], eventos: RawData[] = []): unknown[] {
    const activosBase = activosRaw.map((a) => {
        if (typeof a === 'string') {
            const strLower = a.toLowerCase();
            let tipo = TipoActivo.DOCUMENTO;
            if (strLower.includes('firma')) tipo = TipoActivo.FIRMA_DIGITAL;
            if (strLower.includes('clave')) tipo = TipoActivo.CLAVE_PUBLICA;

            const result: Record<string, unknown> = {
                nombre: a,
                tipo,
                contenido: `Contenido simulado para ${a}`,
            };

            if (tipo === TipoActivo.FIRMA_DIGITAL || tipo === TipoActivo.CLAVE_PUBLICA) {
                result.propietario = 'Entidad_IA';
            }

            return result;
        }
        return a;
    }) as Record<string, unknown>[];

    const esEventoVerificacion = (e: RawData) => {
        const ia = e.infoAdicional as Record<string, unknown> | undefined;
        return ia !== undefined && 'nombreDocumento' in ia && 'veredicto' in ia;
    };

    let propietarioIndex = 0;
    for (const evento of eventos) {
        if (!esEventoVerificacion(evento)) continue;
        const ia = evento.infoAdicional as Record<string, unknown>;
        const nombreFirma = String(ia.nombreFirma ?? '').trim();
        const nombreClave = String(ia.nombreClave ?? '').trim();
        if (!nombreFirma || !nombreClave) continue;

        propietarioIndex++;
        const propietario = `Entidad_${propietarioIndex}`;

        const firma = activosBase.find(a => String(a.nombre).trim() === nombreFirma);
        const clave = activosBase.find(a => String(a.nombre).trim() === nombreClave);
        if (firma) firma.propietario = propietario;
        if (clave) clave.propietario = propietario;
    }

    const documentos = activosBase.filter(a => a.tipo === TipoActivo.DOCUMENTO);
    const firmas = activosBase.filter(a => a.tipo === TipoActivo.FIRMA_DIGITAL);

    for (const doc of documentos) {
        const firmaCorrespondiente = firmas.find(f =>
            f.nombre && doc.nombre &&
            String(f.nombre).toLowerCase().includes(String(doc.nombre).toLowerCase())
        );

        if (firmaCorrespondiente && !doc.firma) {
            doc.firma = firmaCorrespondiente.nombre;

            const eventoVinculado = eventos.find(e =>
                esEventoVerificacion(e) &&
                String((e.infoAdicional as Record<string, unknown>)?.nombreDocumento).trim() === String(doc.nombre).trim()
            );

            const veredictoEsperado = eventoVinculado ? (eventoVinculado.infoAdicional as Record<string, unknown>)?.veredicto : true;

            if (veredictoEsperado === false) {
                firmaCorrespondiente.contenido = String(doc.contenido) + ' (ALTERADO)';
            } else {
                firmaCorrespondiente.contenido = doc.contenido;
            }
        }
    }

    return activosBase;
}

function normalizarEspacios(oficina: RawData, oficinaIdx: number, eventos: RawData[] = []): RawData[] {
    if (Array.isArray(oficina.espacios) && (oficina.espacios as unknown[]).length > 0) {
        return (oficina.espacios as RawData[]).map((esp, espIdx) => ({
            ...esp,
            id: esp.id ?? (oficinaIdx * 100 + espIdx + 1),
            mueble: esp.mueble ?? Mueble.MESA,
            dispositivos: ((esp.dispositivos ?? []) as RawData[]).map((d) => ({
                ...d,
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: normalizarActivos((d.activos ?? []) as unknown[], eventos),
                redes: d.redes ?? [],
            })),
        }));
    }

    const dispositivos = (oficina.dispositivos ?? []) as RawData[];
    return [{
        id: oficinaIdx * 100 + 1,
        mueble: Mueble.MESA,
        dispositivos: dispositivos.map((disp) => ({
            ...disp,
            estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
            activos: normalizarActivos((disp.activos ?? []) as unknown[], eventos),
            redes: disp.redes ?? [],
        })),
    }];
}

export function normalizarZonas(zonas: unknown[], eventos: RawData[] = []): RawData[] {
    const clon = JSON.parse(JSON.stringify(zonas)) as RawData[];

    return clon.map((zona) => {
        const oficinas = (zona.oficinas ?? []) as RawData[];

        const oficinasNormalizadas = oficinas.map((oficina, idx) => {
            const espacios = normalizarEspacios(oficina, idx + 1, eventos);
            return {
                ...oficina,
                id: oficina.id ?? (idx + 101),
                posicion: oficina.posicion ?? { x: idx * 6, y: 0, z: 0, rotacionY: 0 },
                espacios,
            };
        });

        const redesZona = (zona.redes ?? []) as unknown[];

        return {
            ...zona,
            redes: redesZona.map(normalizarRed),
            oficinas: oficinasNormalizadas,
        };
    });
}

export function inyectarRouterSiFalta(zonas: RawData[]): void {
    zonas.forEach((zona) => {
        let tieneRouter = false;
        const oficinas = (zona.oficinas ?? []) as RawData[];
        const primerEspacio = ((oficinas[0]?.espacios ?? []) as RawData[])[0] as RawData | undefined;

        oficinas.forEach((ofi: RawData) => {
            const espacios = (ofi.espacios ?? []) as RawData[];
            espacios.forEach((esp: RawData) => {
                const dispositivos = (esp.dispositivos ?? []) as RawData[];
                dispositivos.forEach((disp: RawData) => {
                    const t = String(disp.tipo ?? '').toLowerCase();
                    if (t.includes('router') || t.includes('vpn')) tieneRouter = true;
                });
            });
        });

        const redes = (zona.redes ?? []) as (string | { nombre: string })[];
        const necesitaInternet = redes.some(
            (r) =>
                (typeof r === 'string' && r === 'Internet') ||
                (typeof r !== 'string' && r.nombre === 'Internet')
        );

        if (necesitaInternet && !tieneRouter && primerEspacio) {
            console.warn(`Zona ${String(zona.nombre)} sin router detectada. Inyectando Gateway.`);
            primerEspacio.dispositivos = (primerEspacio.dispositivos ?? []) as RawData[];
            (primerEspacio.dispositivos as RawData[]).push({
                id: 9990 + Number(zona.id),
                nombre: `GW-${String(zona.nombre).substring(0, 3).toUpperCase()}`,
                tipo: TipoDispositivo.ROUTER,
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                redes: ['Internet', 'LAN-Interna'],
                posicion: { x: 0, y: 0, z: 0 },
            });
        }
    });
}

export function reconstruirFasesSiFaltan(
    fasesOriginales: unknown[],
    eventos: unknown[],
    ataques: unknown[],
    scenario: RawData
): RawData[] {
    if (fasesOriginales.length > 0) return fasesOriginales as RawData[];

    const idsDetectados = new Set<number>();
    [...eventos, ...ataques].forEach((item: unknown) => {
        const a = item as RawData;
        if (a.fase) idsDetectados.add(Number(a.fase));
    });

    if (idsDetectados.size > 0) {
        console.warn(`Reconstruyendo ${idsDetectados.size} fases desde eventos.`);
        return Array.from(idsDetectados)
            .sort((a, b) => a - b)
            .map((id) => ({
                id,
                nombre: id === 1 ? (scenario.titulo_desafio ?? scenario.nombre_desafio ?? 'Fase 1') : `Fase ${id}`,
                descripcion: id === 1 ? (scenario.descripcion_desafio ?? 'Análisis inicial') : `Misión ${id}`,
                objetivos: [],
            }));
    }

    if (scenario.titulo_desafio) {
        return [{
            id: 1,
            nombre: scenario.titulo_desafio,
            descripcion: scenario.descripcion_desafio ?? 'Desafío detectado',
            objetivos: [],
        }];
    }

    return [];
}

export function normalizarFases(fases: unknown[]): RawData[] {
    return fases.map((item: unknown, i: number) => {
        const f = item as RawData;
        return {
            id: f.id ?? i + 1,
            nombre: f.nombre ?? f.titulo_desafio ?? `Fase ${i + 1}`,
            descripcion: f.descripcion ?? f.descripcion_desafio ?? 'Análisis de seguridad',
            completada: false,
            faseActual: i === 0,
            objetivos: [] as unknown[],
        };
    });
}

export function validarTipoEvento(valor: string): TipoEvento | null {
    const valoresValidos = Object.values(TipoEvento);
    return valoresValidos.find((v) => v.toLowerCase() === valor.toLowerCase().trim()) ?? null;
}

const OBJETO_ALIAS: Record<string, string> = {
    'aplicación': 'aplicación/software de computadora',
    'aplicacion': 'aplicación/software de computadora',
    'app': 'aplicación/software de computadora',
    'software': 'aplicación/software de computadora',
    'configuración workstation': 'configuración de workstation',
    'configuracion workstation': 'configuración de workstation',
    'config workstation': 'configuración de workstation',
    'workstation': 'configuración de workstation',
    'firewall': 'configuración de firewall',
    'config firewall': 'configuración de firewall',
    'configuracion de firewall': 'configuración de firewall',
    'comando': 'comando de terminal/CLI',
    'terminal': 'comando de terminal/CLI',
    'cli': 'comando de terminal/CLI',
    'correo': 'correo electrónico',
    'email': 'correo electrónico',
    'red': 'red de computadora',
    'network': 'red de computadora',
    'vpn gateway': 'perfil de VPN gateway',
    'gateway vpn': 'perfil de VPN gateway',
    'vpn cliente': 'perfil de cliente VPN',
    'cliente vpn': 'perfil de cliente VPN',
};

const VPN_PROTECCION_ALIAS: Record<string, string> = {
    'ea': 'Encriptar y Autenticar',
    'encriptar y autenticar': 'Encriptar y Autenticar',
    'encriptar': 'Encriptar y Autenticar',
    'a': 'Solo Autenticar',
    'solo autenticar': 'Solo Autenticar',
    'autenticar': 'Solo Autenticar',
    'ninguna': 'Ninguna',
    'none': 'Ninguna',
    'bloquear': 'Bloquear',
    'block': 'Bloquear',
};

export function normalizarEvento(accion: RawData, faseId: number): void {
    accion.fase = Number(faseId);

    if (accion.nombreEvento) accion.nombreEvento = String(accion.nombreEvento).trim();
    if (accion.nombreAtaque) accion.nombreAtaque = String(accion.nombreAtaque).trim();

    if (!accion.descripcion || String(accion.descripcion).trim() === '') {
        accion.descripcion = accion.nombreEvento ?? accion.nombreAtaque ?? 'Incidente de seguridad.';
    }

    // Garantizar tiempoEnOcurrir si la IA lo olvida
    if (accion.tiempoNotificacion !== undefined && accion.tiempoEnOcurrir === undefined) {
        accion.tiempoEnOcurrir = Number(accion.tiempoNotificacion) + 5;
    }

    if (!accion.infoAdicional) {
        accion.infoAdicional = {};
    }
    const info = accion.infoAdicional as RawData;

    if (accion.tipoEvento !== TipoEvento.COMPLETACION_FASE &&
        accion.tipoEvento !== TipoEvento.COMPLETACION_ESCENARIO) {
        info.esObjetivo = true;
    }

    // Guard de Firmas: Si detectamos campos de firma, forzamos el tipo de evento correcto
    if (info.nombreDocumento || info.nombreFirma) {
        accion.tipoEvento = TipoEvento.VERIFICACION_FIRMA;
    }

    if (info.veredicto !== undefined) {
        info.veredicto = info.veredicto === true || String(info.veredicto).toLowerCase() === 'true';
    }
    if (typeof info.nombreDocumento === 'string') info.nombreDocumento = info.nombreDocumento.trim();
    if (typeof info.nombreFirma === 'string') info.nombreFirma = info.nombreFirma.trim();
    if (typeof info.nombreClave === 'string') info.nombreClave = info.nombreClave.trim();

    if (info?.objeto) {
        const infoKey = String(info.objeto).toLowerCase().trim();
        info.objeto = OBJETO_ALIAS[infoKey] ?? info.objeto;
    }
    if (
        info?.objeto === 'configuración de workstation' &&
        (info.accion === 'ejecutar' || info.accion === 'configurar')
    ) {
        info.accion = 'click';
    }

    const cm = accion.condicionMitigacion as RawData | undefined;
    if (cm?.objeto) {
        const cmKey = String(cm.objeto).toLowerCase().trim();
        cm.objeto = OBJETO_ALIAS[cmKey] ?? cm.objeto;
    }
    if (
        cm?.objeto === 'configuración de workstation' &&
        (cm.accion === 'ejecutar' || cm.accion === 'configurar')
    ) {
        cm.accion = 'click';
    }
    if (cm && cm.val && !Array.isArray(cm.val)) cm.val = [cm.val];

    if (info?.gateway) {
        const gateway = info.gateway as RawData;
        if (gateway.proteccion) {
            const pKey = String(gateway.proteccion).toLowerCase().trim();
            gateway.proteccion = VPN_PROTECCION_ALIAS[pKey] ?? gateway.proteccion;
        }
    }
    if (info?.cliente) {
        const cliente = info.cliente as RawData;
        if (cliente.proteccion) {
            const pKey = String(cliente.proteccion).toLowerCase().trim();
            cliente.proteccion = VPN_PROTECCION_ALIAS[pKey] ?? cliente.proteccion;
        }
    }
}

export function generarFirmaDuplicado(ev: RawData): string {
    const nombre = String(ev.nombreEvento ?? ev.nombreAtaque ?? '');
    const fase = String(ev.fase ?? 0);
    const tipo = String(ev.tipoEvento ?? 'ataque');
    return `${fase}-${tipo}-${nombre}`;
}

export function deduplicarEventos(eventos: RawData[]): RawData[] {
    const logLimpio: RawData[] = [];
    const textosVistos = new Set<string>();

    eventos.forEach((ev) => {
        const signature = generarFirmaDuplicado(ev);
        if (!textosVistos.has(signature)) {
            logLimpio.push(ev);
            textosVistos.add(signature);
        }
    });

    return logLimpio;
}

export function construirObjetivosVisuales(flujoFase: RawData[], faseObjetivos?: unknown[]): RawData[] {
    const objetivosVisuales: RawData[] = [];

    flujoFase.forEach((item) => {
        const esAtaque = item.nombreAtaque !== undefined && item.tipoEvento === undefined;
        const infoAdicional = item.infoAdicional as RawData | undefined;
        const esEventoObjetivo = item.tipoEvento !== undefined && infoAdicional?.esObjetivo === true;

        if (esAtaque || esEventoObjetivo) {
            objetivosVisuales.push({
                descripcion: String(item.nombreAtaque ?? item.nombreEvento).trim(),
                completado: false,
                esOpcional: false,
            });
        }
    });

    if (objetivosVisuales.length === 0 && faseObjetivos) {
        faseObjetivos.forEach((obj) => objetivosVisuales.push(obj as RawData));
    }

    return objetivosVisuales;
}
