import type { LeaderboardEntry } from "../hooks/useLeaderboard";
import Identicon from "../../../common/components/Identicon";
import styles from "../styles/Leaderboard.module.css";

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    groupName: string | null;
    loading: boolean;
    error: string | null;
    currentStudentId: number | null;
}

function rankClass(rank: number): string {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return "";
}

export default function Leaderboard({
    entries,
    groupName,
    loading,
    error,
    currentStudentId,
}: LeaderboardProps) {
    // No group state
    if (!loading && !groupName && !error) {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Ranking</h3>
                </div>
                <div className={styles.empty}>
                    <p className={styles.emptyText}>
                        Únete a un grupo para ver el ranking de tu clase
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Ranking</h3>
                {groupName && <p className={styles.groupName}>{groupName}</p>}
            </div>

            {loading ? (
                <div className={styles.skeleton}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className={styles.skeletonRow}
                            style={{ width: `${85 - i * 8}%` }}
                        />
                    ))}
                </div>
            ) : error ? (
                <div className={styles.empty}>
                    <p className={styles.emptyText}>No se pudo cargar el ranking</p>
                </div>
            ) : entries.length === 0 ? (
                <div className={styles.empty}>
                    <p className={styles.emptyText}>
                        Aún no hay progreso en el grupo
                    </p>
                </div>
            ) : (
                <div className={styles.list}>
                    {entries.map((entry) => {
                        const isCurrent = entry.idEstudiante === currentStudentId;
                        return (
                            <div
                                key={entry.idEstudiante}
                                className={`${styles.row} ${isCurrent ? styles.currentRow : ""}`}
                            >
                                <span className={`${styles.rank} ${rankClass(entry.rank)}`}>
                                    {entry.rank}
                                </span>
                                <div className={styles.avatar}>
                                    <Identicon seed={entry.correo} />
                                </div>
                                <span className={styles.name}>{entry.nombre}</span>
                                <span className={`${styles.score} ${isCurrent ? styles.scoreCurrent : ""}`}>
                                    {entry.puntaje.toLocaleString()} pts
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
