export default function AnalyticsPanel({
  loading, projects, selectedProjectId, setSelectedProjectId,
  selectedMilestoneId, setSelectedMilestoneId, milestones,
  scopeStats, analyticsLoading, completionPct
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Analytics</h2>
      </div>

      {!loading && projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No projects yet</div>
          <div className="empty-sub">Analytics will appear once a project exists.</div>
        </div>
      ) : (
        <>
          <div className="analytics-filters">
            <label className="analytics-filter">
              <span>Project:</span>
              <select
                className="inline-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="analytics-filter">
              <span>Milestone:</span>
              <select
                className="inline-select"
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
              >
                <option value="ALL">All Milestones (Project View)</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="progress-panel">
            <div className="progress-panel-header">
              <span className="progress-panel-title">Overall Project Progress</span>
              {scopeStats && (
                <span className="progress-panel-value">
                  {completionPct}% Completed ({scopeStats.completedPoints} / {scopeStats.totalPoints} pts)
                </span>
              )}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          {analyticsLoading ? (
            <div className="empty-sub" style={{ marginTop: 16 }}>Loading analytics…</div>
          ) : (
            <div className="stat-grid" style={{ marginTop: 20 }}>
              <div className="stat-card">
                <div className="stat-label">Sprints Tracked</div>
                <div className="stat-value">{scopeStats?.sprintsTracked ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value">{scopeStats?.totalTasks ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Points Committed</div>
                <div className="stat-value">{scopeStats?.totalPoints ?? 0} <span className="stat-value-unit">pts</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Resolved / Total Blockers</div>
                <div className="stat-value">{scopeStats?.resolvedBlockers ?? 0} / {scopeStats?.totalBlockers ?? 0}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
