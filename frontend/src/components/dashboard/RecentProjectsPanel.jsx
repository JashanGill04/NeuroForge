import { Link } from 'react-router-dom'
import { StatusBadge } from '../ui'

export default function RecentProjectsPanel({ loading, recentProjects }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Recent Projects</h2>
        <Link className="link" to="/projects">View all →</Link>
      </div>

      {!loading && recentProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No projects yet</div>
          <div className="empty-sub">
            <Link to="/projects">Create your first project</Link> to get started.
          </div>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Team</th>
                <th>Manager</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{p.teamName || '—'}</td>
                  <td>{p.managerUsername || '—'}</td>
                  <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
