import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSelectedLevel } from '../../../../common/contexts/SelectedLevelContext';
import { useAgentMalvado } from '../context/AgentMalvadoContext';
import { TipoEvento } from '../../../../../shared/types/DeviceEnums';
import type { Escenario } from '../../../../../shared/types/EscenarioTypes';
import {
    findInObj,
    normalizarZonas,
    inyectarRouterSiFalta,
    reconstruirFasesSiFaltan,
    normalizarFases,
    validarTipoEvento,
    normalizarEvento,
    deduplicarEventos,
    construirObjetivosVisuales,
} from '../utils/scenarioNormalizer';

type RawData = Record<string, unknown>;

const TIEMPO_INICIAL = 15;
const TIEMPO_INCREMENTO = 15;
const TIEMPO_EJECUCION_OFFSET = 10;

export function useScenarioBuilder() {
    const { generatedScenario, clearScenario } = useAgentMalvado();
    const navigate = useNavigate();
    const { setSelectedEscenario } = useSelectedLevel();

    const buildAndPlay = useCallback(() => {
        if (!generatedScenario) return;

        const scenarioData = Array.isArray(generatedScenario)
            ? (generatedScenario[0] as RawData)
            : (generatedScenario as RawData);

        const scenario = scenarioData;

        const rawZonas = (findInObj(scenario, 'zonas') ?? []) as RawData[];
        const rawFases = (findInObj(scenario, 'fases') ?? []) as RawData[];
        const rawEventos = (findInObj(scenario, 'eventos') ?? []) as RawData[];
        const rawAtaques = (findInObj(scenario, 'ataques') ?? []) as RawData[];

        const zonasNormalizadas = normalizarZonas(rawZonas, rawEventos);
        inyectarRouterSiFalta(zonasNormalizadas);

        const fasesReconstruidas = reconstruirFasesSiFaltan(rawFases, rawEventos, rawAtaques, scenario);
        const fasesNormalizadas = normalizarFases(fasesReconstruidas);

        const todosLosEventos: RawData[] = [];
        let timeCursor = TIEMPO_INICIAL;

        fasesNormalizadas.forEach((item: unknown) => {
            const fase = item as RawData;
            const faseId = Number(fase.id);
            const eventosFase = rawEventos.filter((e) => Number(e.fase) === faseId);
            const ataquesFase = rawAtaques.filter((a) => Number(a.fase) === faseId);

            const flujoFase: RawData[] = [];

            // EVENTOS PRIMERO (VERIFICACION, TRAFICO_RED, VPN, etc.)
            // Deben quedar en índice menor que los ataques en la lista ordenada
            // para que SistemaFase avance correctamente sin bloquearse en el ataque.
            eventosFase.forEach((ev) => {
                const tipoValidado = validarTipoEvento(String(ev.tipoEvento ?? ''));
                if (tipoValidado) ev.tipoEvento = tipoValidado;

                const esCierre = ev.tipoEvento === TipoEvento.COMPLETACION_FASE
                    || ev.tipoEvento === TipoEvento.COMPLETACION_ESCENARIO
                    || ev.nombreEvento === fase.nombre;

                if (!esCierre) flujoFase.push(ev);
            });

            // ATAQUES DESPUÉS — reciben tiempoNotificacion mayor y quedan tras los eventos
            ataquesFase.forEach((atk) => {
                const nombre = String(atk.nombreAtaque ?? '').toLowerCase();
                const esPaz = nombre.includes('escaneo') || nombre.includes('búsqueda') || nombre.includes('auditoría');

                if (esPaz) {
                    flujoFase.push({
                        nombreEvento: atk.nombreAtaque,
                        tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
                        descripcion: atk.descripcion ?? `Realiza: ${atk.nombreAtaque}`,
                        fase: faseId,
                        infoAdicional: { ...(atk.condicionMitigacion as Record<string, unknown> || {}), esObjetivo: true },
                    });
                } else {
                    flujoFase.push(atk);
                }
            });

            const cierreNarrativo = eventosFase.find(
                (e) => e.tipoEvento === TipoEvento.COMPLETACION_FASE
                    || e.tipoEvento === TipoEvento.COMPLETACION_ESCENARIO
            );

            if (cierreNarrativo) {
                flujoFase.push(cierreNarrativo);
            } else {
                const esUltima = fasesNormalizadas.indexOf(fase) === fasesNormalizadas.length - 1;
                flujoFase.push({
                    nombreEvento: esUltima ? 'Escenario Completado' : `Fase ${faseId} Completada`,
                    tipoEvento: esUltima ? TipoEvento.COMPLETACION_ESCENARIO : TipoEvento.COMPLETACION_FASE,
                    descripcion: esUltima
                        ? '¡Has completado todos los objetivos del escenario!'
                        : `Fase ${faseId} completada. Avanzando a la siguiente fase...`,
                    fase: faseId,
                    infoAdicional: { esObjetivo: false },
                });
            }

            flujoFase.forEach((accion) => {
                const esCierre = accion.tipoEvento === TipoEvento.COMPLETACION_FASE
                    || accion.tipoEvento === TipoEvento.COMPLETACION_ESCENARIO;

                if (!esCierre) {
                    accion.tiempoNotificacion = timeCursor;
                    accion.tiempoEnOcurrir = timeCursor + TIEMPO_EJECUCION_OFFSET;
                    timeCursor += TIEMPO_INCREMENTO;
                } else {
                    accion.tiempoNotificacion = timeCursor;
                    accion.tiempoEnOcurrir = timeCursor;
                    timeCursor += TIEMPO_INCREMENTO;
                }

                normalizarEvento(accion, faseId);
                todosLosEventos.push(accion);
            });

            fase.objetivos = construirObjetivosVisuales(flujoFase, fase.objetivos as unknown[]);
        });

        const logLimpio = deduplicarEventos(todosLosEventos);

        const levelToPlay: Escenario = {
            id: Number(scenario.id) || 777,
            slug: 'ai-generated-scenario',
            titulo: String(scenario.titulo ?? scenario.titulo_escenario ?? 'Desafío del Agente Malvado').trim(),
            descripcion: String(scenario.descripcion ?? scenario.descripcion_desafio ?? 'Simulación generada dinámicamente.'),
            presupuestoInicial: Number(scenario.presupuestoInicial) || 5000,
            fases: fasesNormalizadas as Escenario['fases'],
            eventos: logLimpio.filter((e) => e.tipoEvento !== undefined),
            ataques: todosLosEventos.filter((a) => a.nombreAtaque !== undefined && a.tipoEvento === undefined),
            zonas: zonasNormalizadas as Escenario['zonas'],
            accionesEsperadas: (scenario.accionesEsperadas ?? []) as Escenario['accionesEsperadas'],
            redes: [],
        } as unknown as Escenario;



        localStorage.setItem('slug_escenario_actual', 'ai-generated-scenario');
        setSelectedEscenario(levelToPlay);
        clearScenario();
        navigate('/');
    }, [generatedScenario, setSelectedEscenario, clearScenario, navigate]);

    return { buildAndPlay };
}
