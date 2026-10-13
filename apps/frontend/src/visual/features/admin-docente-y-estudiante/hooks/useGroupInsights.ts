import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../common/utils/apiConfig";
import type { LeaderboardEntry } from "../../escenarios-simulados/hooks/useLeaderboard";

interface EstudianteAPI {
  id_estudiante: number;
  primernombre: string;
  primer_apellido: string;
  correo_electronico?: string;
}

interface ProgresoAPI {
  slug_escenario: string;
  nombre_escenario?: string;
  terminado: boolean;
  tiempo: number | null;
}

export interface ScenarioCompletion {
  nombre: string;
  completados: number;
  total: number;
}

export interface AttemptDistribution {
  primerIntento: number;
  dosATres: number;
  cuatroOMas: number;
  sinCompletar: number;
}

export interface GroupInsightsResult {
  leaderboard: LeaderboardEntry[];
  scenarios: ScenarioCompletion[];
  distribution: AttemptDistribution;
  totalStudents: number;
  loading: boolean;
  error: string | null;
}

export function useGroupInsights(idCurso: number | null): GroupInsightsResult {
  const [state, setState] = useState<GroupInsightsResult>({
    leaderboard: [],
    scenarios: [],
    distribution: { primerIntento: 0, dosATres: 0, cuatroOMas: 0, sinCompletar: 0 },
    totalStudents: 0,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!idCurso) return;

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      try {
        const estRes = await fetch(`${API_BASE_URL}/groups/${idCurso}/estudiantes`);
        if (!estRes.ok) throw new Error("Error al obtener estudiantes");
        const estData = await estRes.json();
        const estudiantes: EstudianteAPI[] = estData.data || [];

        const progresoResults = await Promise.all(
          estudiantes.map(async (est) => {
            try {
              const res = await fetch(`${API_BASE_URL}/progreso/estudiante/${est.id_estudiante}`);
              if (!res.ok) return { estudiante: est, progresos: [] as ProgresoAPI[] };
              const data = await res.json();
              return { estudiante: est, progresos: (data.data || []) as ProgresoAPI[] };
            } catch {
              return { estudiante: est, progresos: [] as ProgresoAPI[] };
            }
          }),
        );

        const allScenarios = new Map<string, string>();
        for (const { progresos } of progresoResults) {
          for (const p of progresos) {
            if (p.slug_escenario === "ai-generated-scenario") continue;
            if (!allScenarios.has(p.slug_escenario)) {
              allScenarios.set(p.slug_escenario, p.nombre_escenario || p.slug_escenario);
            }
          }
        }

        const leaderboard: LeaderboardEntry[] = [];
        const scenarioCompletions = new Map<string, number>();
        const dist: AttemptDistribution = {
          primerIntento: 0,
          dosATres: 0,
          cuatroOMas: 0,
          sinCompletar: 0,
        };

        for (const { estudiante, progresos } of progresoResults) {
          const byEscenario = new Map<string, ProgresoAPI[]>();
          for (const p of progresos) {
            if (p.slug_escenario === "ai-generated-scenario") continue;
            const list = byEscenario.get(p.slug_escenario);
            if (list) list.push(p);
            else byEscenario.set(p.slug_escenario, [p]);
          }

          let puntaje = 0;
          for (const [slug, records] of byEscenario) {
            let failedBefore = 0;
            let completed = false;
            for (const r of records) {
              if (r.terminado) {
                completed = true;
                break;
              }
              failedBefore++;
            }

            if (completed) {
              puntaje += Math.round(1000 * Math.pow(0.7, failedBefore));
              scenarioCompletions.set(slug, (scenarioCompletions.get(slug) || 0) + 1);

              if (failedBefore === 0) dist.primerIntento++;
              else if (failedBefore <= 2) dist.dosATres++;
              else dist.cuatroOMas++;
            } else {
              dist.sinCompletar++;
            }
          }

          leaderboard.push({
            idEstudiante: estudiante.id_estudiante,
            nombre: `${estudiante.primernombre} ${estudiante.primer_apellido}`,
            correo: estudiante.correo_electronico || "",
            puntaje,
            rank: 0,
          });
        }

        leaderboard.sort((a, b) => {
          if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
          return a.nombre.localeCompare(b.nombre);
        });
        for (let i = 0; i < leaderboard.length; i++) {
          if (i === 0) leaderboard[i].rank = 1;
          else if (leaderboard[i].puntaje === leaderboard[i - 1].puntaje)
            leaderboard[i].rank = leaderboard[i - 1].rank;
          else leaderboard[i].rank = i + 1;
        }

        const scenarios: ScenarioCompletion[] = [];
        for (const [slug, nombre] of allScenarios) {
          scenarios.push({
            nombre,
            completados: scenarioCompletions.get(slug) || 0,
            total: estudiantes.length,
          });
        }
        scenarios.sort((a, b) => a.completados / a.total - b.completados / b.total);

        if (!cancelled) {
          setState({
            leaderboard,
            scenarios,
            distribution: dist,
            totalStudents: estudiantes.length,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : "Error desconocido",
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idCurso]);

  return state;
}
