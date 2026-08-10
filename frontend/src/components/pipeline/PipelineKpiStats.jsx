export default function PipelineKpiStats({ kpis }) {
  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-label">Build success rate</div>
        <div className="stat-value stat-value-success">{kpis.successRate.toFixed(1)}%</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total builds</div>
        <div className="stat-value">{kpis.totalBuilds.toLocaleString()}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Avg. deploy time</div>
        <div className="stat-value">{kpis.avgDeployTimeMinutes.toFixed(1)}<span className="stat-value-unit">min</span></div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Builds today</div>
        <div className="stat-value">{kpis.buildsToday}</div>
      </div>
    </div>
  )
}
