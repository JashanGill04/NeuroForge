export default function WorkspaceStats({ loading, projects, teams, users, activeCount, roles }) {
  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-label">Total Projects</div>
        <div className="stat-value">{loading ? '—' : projects.length}</div>
        <div className="stat-foot">{loading ? '' : `${activeCount} active`}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Teams</div>
        <div className="stat-value">{loading ? '—' : teams.length}</div>
        <div className="stat-foot">across the organization</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Users</div>
        <div className="stat-value">{loading ? '—' : users.length}</div>
        <div className="stat-foot">registered accounts</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Your Role</div>
        <div className="stat-value stat-value-sm">
          {roles?.[0]?.replaceAll('_', ' ') || '—'}
        </div>
      </div>
    </div>
  )
}
