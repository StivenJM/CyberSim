import { Trophy } from 'lucide-react'
import Identicon from '../../../common/components/Identicon'
import type { LeaderboardEntry } from '../hooks/useLeaderboard'
import styles from '../styles/Leaderboard.module.css'

interface LeaderboardProps {
	entries: LeaderboardEntry[]
	groupName: string | null
	loading: boolean
	error: string | null
	currentStudentId: number | null
}

function rankClass(rank: number): string {
	if (rank === 1) return styles.rankGold
	if (rank === 2) return styles.rankSilver
	if (rank === 3) return styles.rankBronze
	return ''
}

// 1250 → "1 250 pts": espacio fino como separador de miles, igual que el resto
// de cifras de la pantalla, sin depender del locale del navegador.
function formatPuntos(puntos: number): string {
	return `${puntos.toLocaleString('en-US').replace(/,/g, '\u202F')} pts`
}

export default function Leaderboard({
	entries,
	groupName,
	loading,
	error,
	currentStudentId,
}: LeaderboardProps) {
	return (
		<section className={styles.card} aria-labelledby="ranking-titulo">
			<div className={styles.header}>
				<Trophy size={16} strokeWidth={2} className={styles.trophy} />
				<h2 className={styles.title} id="ranking-titulo">
					Ranking del grupo
				</h2>
				{groupName && <span className={styles.groupName}>{groupName}</span>}
			</div>

			{loading ? (
				<div className={styles.skeleton}>
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore-start lint/suspicious/noArrayIndexKey: These fixed display slots retain their positional identity.
						<div
							key={i}
							className={styles.skeletonRow}
							style={{ width: `${88 - i * 10}%` }}
						/>
						// biome-ignore-end lint/suspicious/noArrayIndexKey: Limit the positional-key exception to this element.
					))}
				</div>
			) : error ? (
				<div className={styles.empty}>
					<p className={styles.emptyText}>No se pudo cargar el ranking</p>
				</div>
			) : !groupName ? (
				<div className={styles.empty}>
					<p className={styles.emptyText}>
						Únete a un grupo para ver el ranking de tu clase
					</p>
				</div>
			) : entries.length === 0 ? (
				<div className={styles.empty}>
					<p className={styles.emptyText}>Aún no hay progreso en el grupo</p>
				</div>
			) : (
				<>
					<ol className={styles.list}>
						{entries.slice(0, 5).map((entry) => {
							const isCurrent = entry.idEstudiante === currentStudentId
							return (
								<li
									key={entry.idEstudiante}
									className={`${styles.row} ${isCurrent ? styles.currentRow : ''}`}
								>
									<span className={`${styles.rank} ${rankClass(entry.rank)}`}>
										{entry.rank}
									</span>
									<span className={styles.avatar}>
										<Identicon seed={entry.correo} />
									</span>
									<span className={styles.name}>{entry.nombre}</span>
									<span className={styles.score}>
										{formatPuntos(entry.puntaje)}
									</span>
								</li>
							)
						})}
					</ol>
					{entries.length > 5 && (
						<p className={styles.more}>
							y {entries.length - 5}{' '}
							{entries.length - 5 === 1 ? 'estudiante más' : 'estudiantes más'}{' '}
							en el grupo
						</p>
					)}
				</>
			)}
		</section>
	)
}
