import type { GroupInsightsResult } from "../hooks/useGroupInsights";
import styles from "../styles/GroupInsights.module.css";

interface Props {
  data: GroupInsightsResult;
}

function completionColor(pct: number): string {
  if (pct >= 70) return "var(--success)";
  if (pct >= 40) return "var(--warning)";
  return "var(--error)";
}

const DIST_ITEMS = [
  { key: "primerIntento" as const, label: "Primer intento", color: "var(--success)" },
  { key: "dosATres" as const, label: "2-3 intentos", color: "var(--warning)" },
  { key: "cuatroOMas" as const, label: "4+ intentos", color: "var(--error)" },
  { key: "sinCompletar" as const, label: "Sin completar", color: "#6b7280" },
];

const VB = 120;
const STROKE = 20;
const RADIUS = (VB - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutChart({ distribution, total }: { distribution: GroupInsightsResult["distribution"]; total: number }) {
  let offset = 0;
  const segments = DIST_ITEMS.map(({ key, color }) => {
    const value = distribution[key];
    const pct = total > 0 ? value / total : 0;
    const dashLength = pct * CIRCUMFERENCE;
    const segment = { color, dashLength, offset, pct };
    offset += dashLength;
    return segment;
  });

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} className={styles.donut}>
      <circle
        cx={VB / 2}
        cy={VB / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={STROKE}
      />
      {segments.map((seg, i) => seg.dashLength > 0 && (
        <circle
          key={i}
          cx={VB / 2}
          cy={VB / 2}
          r={RADIUS}
          fill="none"
          stroke={seg.color}
          strokeWidth={STROKE}
          strokeDasharray={`${seg.dashLength} ${CIRCUMFERENCE - seg.dashLength}`}
          strokeDashoffset={-seg.offset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${VB / 2} ${VB / 2})`}
        />
      ))}
    </svg>
  );
}

export default function GroupInsights({ data }: Props) {
  const { scenarios, distribution, loading, error, leaderboard } = data;

  if (loading) {
    return (
      <div className={styles.grid}>
        <div className={styles.section}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonBars}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonBarItem}>
                <div className={styles.skeletonLabel} style={{ width: `${60 - i * 8}%` }} />
                <div className={styles.skeletonTrack} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonDonutRow}>
            <div className={styles.skeletonDonut} />
            <div className={styles.skeletonLegend}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonLegendItem} style={{ width: `${70 - i * 10}%` }} />
              ))}
            </div>
          </div>
          <div className={styles.skeletonSummary} />
        </div>
      </div>
    );
  }

  if (error || (leaderboard.length === 0 && scenarios.length === 0)) {
    return null;
  }

  const totalDist =
    distribution.primerIntento +
    distribution.dosATres +
    distribution.cuatroOMas +
    distribution.sinCompletar;

  return (
    <div className={styles.grid}>
      {scenarios.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Completitud por laboratorio</h3>
          <div className={styles.barList}>
            {scenarios.map((s) => {
              const pct = s.total > 0 ? (s.completados / s.total) * 100 : 0;
              return (
                <div key={s.nombre} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span className={styles.barName}>{s.nombre}</span>
                    <span className={styles.barValue}>
                      {s.completados}/{s.total}
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${pct}%`, background: completionColor(pct) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalDist > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Distribución de intentos</h3>
          <div className={styles.donutRow}>
            <DonutChart distribution={distribution} total={totalDist} />
            <div className={styles.legend}>
              {DIST_ITEMS.map(({ key, label, color }) => {
                const value = distribution[key];
                const pct = (value / totalDist) * 100;
                return (
                  <div key={key} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: color }} />
                    <span className={styles.legendLabel}>{label}</span>
                    <span className={styles.legendValue}>
                      {value} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className={styles.donutSummary}>
            <span className={styles.donutSummaryPct}>{Math.round((distribution.primerIntento / totalDist) * 100)}%</span> de los escenarios se resuelven al primer intento
          </p>
        </div>
      )}
    </div>
  );
}
