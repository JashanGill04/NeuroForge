import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { teamsApi } from '../api/teams'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { Alert, StatusBadge } from '../components/ui'

export default function Dashboard() {
  const { username, roles } = useAuth()
  
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([projectsApi.getAll(), teamsApi.getAll(), usersApi.getAll()])
      .then(([p, t, u]) => {
        if (!mounted) return
        setProjects(p)
        setTeams(t)
        setUsers(u)
      })
      .catch((err) => setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  // Derive dynamic team information from the fetched users list
  const currentUser = users.find((u) => u.username === username);
  const myTeamName = currentUser?.team?.name || 'No team assigned';

  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {username}</h1>
          <p className="page-subtitle">Here's what's happening across NeuroForge Nexus.</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

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
          {/* Dynamic Sync: Replaces "Team sync pending"
          <div className="stat-foot">
            {loading ? '...' : `Team: ${myTeamName}`}
          </div> */}
        </div>
      </div>

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
        )}
      </div>
    </div>
  )
}