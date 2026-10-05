import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../common/utils/apiConfig";

export interface LeaderboardEntry {
    idEstudiante: number;
    nombre: string;
    correo: string;
    puntaje: number;
    rank: number;
}

interface UseLeaderboardResult {
    entries: LeaderboardEntry[];
    loading: boolean;
    error: string | null;
}

interface EstudianteAPI {
    id_estudiante: number;
    primernombre: string;
    primer_apellido: string;
    correo_electronico?: string;
}

interface ProgresoAPI {
    slug_escenario: string;
    terminado: boolean;
    tiempo: number | null;
}

export function useLeaderboard(idCurso: number | null): UseLeaderboardResult {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!idCurso) {
            setEntries([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                // Get classmates in the group
                const estRes = await fetch(`${API_BASE_URL}/groups/${idCurso}/estudiantes`);
                if (!estRes.ok) throw new Error("Error al obtener estudiantes");
                const estData = await estRes.json();
                const estudiantes: EstudianteAPI[] = estData.data || [];

                // 3. Fetch progress for each student in parallel
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
                    })
                );

                // 4. Aggregate scores per student
                const aggregated = progresoResults.map(({ estudiante, progresos }) => {
                    // Group progress records by scenario
                    const byEscenario = new Map<string, ProgresoAPI[]>();
                    for (const p of progresos) {
                        const list = byEscenario.get(p.slug_escenario);
                        if (list) list.push(p);
                        else byEscenario.set(p.slug_escenario, [p]);
                    }

                    // For each scenario: count fails before first success, apply formula
                    let puntaje = 0;
                    for (const records of byEscenario.values()) {
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
                        }
                    }

                    return {
                        idEstudiante: estudiante.id_estudiante,
                        nombre: `${estudiante.primernombre} ${estudiante.primer_apellido}`,
                        correo: estudiante.correo_electronico || '',
                        puntaje,
                        rank: 0,
                    };
                });

                // Sort: highest score DESC, tiebreak by name ASC
                aggregated.sort((a, b) => {
                    if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
                    return a.nombre.localeCompare(b.nombre);
                });

                // Assign ranks (same score = same rank)
                for (let i = 0; i < aggregated.length; i++) {
                    if (i === 0) {
                        aggregated[i].rank = 1;
                    } else {
                        const prev = aggregated[i - 1];
                        if (aggregated[i].puntaje === prev.puntaje) {
                            aggregated[i].rank = prev.rank;
                        } else {
                            aggregated[i].rank = i + 1;
                        }
                    }
                }

                if (!cancelled) {
                    setEntries(aggregated);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Error desconocido");
                    setLoading(false);
                }
            }
        })();

        return () => { cancelled = true; };
    }, [idCurso]);

    return { entries, loading, error };
}
