import LevelSelectionMenuList from "../components/LevelSelectionMenuList";
import Leaderboard from "../components/Leaderboard";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useEstudianteGrupo } from "../../admin-docente-y-estudiante/contexts/EstudianteGrupoContext";
import styles from "../styles/VistaSeleccionNiveles.module.css";
import AgentMalvadoUI from "../../agent-malvado/presentation/components/AgentMalvadoUI";

function getStudentId(): number | null {
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        return user.id_estudiante ?? null;
    } catch {
        return null;
    }
}

export default function VistaSeleccionNiveles() {
    const idEstudiante = getStudentId();
    const { grupo, loading: grupoLoading } = useEstudianteGrupo();
    const { entries, loading: leaderboardLoading, error } = useLeaderboard(grupo?.id_curso ?? null);

    const loading = grupoLoading || leaderboardLoading;

    return (
        <div className={styles.main}>
            <div className={styles.path}>
                <LevelSelectionMenuList />
            </div>
            <div className={styles.sidebar}>
                <Leaderboard
                    entries={entries}
                    groupName={grupo?.nombre ?? null}
                    loading={loading}
                    error={error}
                    currentStudentId={idEstudiante}
                />
                <AgentMalvadoUI />
            </div>
        </div>
    );
}
