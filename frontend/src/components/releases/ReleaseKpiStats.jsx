export default function ReleaseKpiStats({ kpis }) {
  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-label">Uptime</div>
        <div className="stat-value stat-value-success">{kpis.uptimePercent.toFixed(2)}%</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">MTTR</div>
        <div className="stat-value">
          {kpis.mttrMinutes.toFixed(1)}<span className="stat-value-unit">min</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Releases this month</div>
        <div className="stat-value">{kpis.releasesThisMonth}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Rolled back</div>
        <div className="stat-value">
          {kpis.rolledBackReleases}<span className="stat-value-unit"> / {kpis.totalReleases}</span>
        </div>
      </div>
    </div>
  )
}