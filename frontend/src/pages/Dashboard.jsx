import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { teamsApi } from '../api/teams'
import { usersApi } from '../api/users'
import { milestonesApi } from '../api/milestones'
import { sprintsApi } from '../api/sprints'
import { taskService } from '../services/taskService'
import { blockerService } from '../services/blockerService'
import { useAuth } from '../context/AuthContext'
import { Alert, StatusBadge } from '../components/ui'

export default function Dashboard() {
  const { username, roles } = useAuth()

  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // ---- Analytics: project / milestone selection (workspace-level, restored) ----
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('ALL')
  const [milestones, setMilestones] = useState([])
  const [sprints, setSprints] = useState([])
  const [scopeStats, setScopeStats] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([projectsApi.getAll(), teamsApi.getAll(), usersApi.getAll()])
      .then(([p, t, u]) => {
        if (!mounted) return
        setProjects(p)
        setTeams(t)
        setUsers(u)
        if (p.length > 0) setSelectedProjectId(String(p[0].id))
      })
      .catch((err) => setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  // Load milestones + sprints for whichever project is selected in the picker
  useEffect(() => {
    if (!selectedProjectId) return
    let mounted = true
    setSelectedMilestoneId('ALL')
    Promise.all([
      milestonesApi.getByProject(selectedProjectId),
      sprintsApi.getByProject(selectedProjectId),
    ])
      .then(([m, s]) => {
        if (!mounted) return
        setMilestones(m)
        setSprints(s)
      })
      .catch((err) => setError(err.message))
    return () => { mounted = false }
  }, [selectedProjectId])

  // Aggregate tasks + blockers across whichever sprints fall in the current
  // project/milestone scope (mirrors the old workspace Analytics page).
  useEffect(() => {
    const scopedSprints =
      selectedMilestoneId === 'ALL'
        ? sprints
        : sprints.filter((s) => String(s.milestoneId) === String(selectedMilestoneId))

    if (scopedSprints.length === 0) {
      setScopeStats({ sprintsTracked: 0, totalTasks: 0, totalPoints: 0, completedPoints: 0, resolvedBlockers: 0, totalBlockers: 0 })
      setAnalyticsLoading(false)
      return
    }

    let mounted = true
    setAnalyticsLoading(true)
    Promise.all(
      scopedSprints.map((s) =>
        Promise.all([
          taskService.getTasksForSprint(s.id).catch(() => []),
          blockerService.getBlockersForSprint(s.id).catch(() => []),
        ])
      )
    )
      .then((results) => {
        if (!mounted) return
        let totalTasks = 0, totalPoints = 0, completedPoints = 0, resolvedBlockers = 0, totalBlockers = 0
        results.forEach(([tasks, blockers]) => {
          totalTasks += tasks.length
          totalPoints += tasks.reduce((s, t) => s + (t.points || 0), 0)
          completedPoints += tasks.filter((t) => t.status === 'DONE').reduce((s, t) => s + (t.points || 0), 0)
          totalBlockers += blockers.length
          resolvedBlockers += blockers.filter((b) => b.resolved).length
        })
        setScopeStats({ sprintsTracked: scopedSprints.length, totalTasks, totalPoints, completedPoints, resolvedBlockers, totalBlockers })
      })
      .finally(() => mounted && setAnalyticsLoading(false))
    return () => { mounted = false }
  }, [sprints, selectedMilestoneId])

  // Derive dynamic team information from the fetched users list
  const currentUser = users.find((u) => u.username === username);
  const myTeamName = currentUser?.team?.name || 'No team assigned';

  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const completionPct = useMemo(() => {
    if (!scopeStats || scopeStats.totalPoints === 0) return 0
    return Math.round((scopeStats.completedPoints / scopeStats.totalPoints) * 100)
  }, [scopeStats])

  const selectedProject = projects.find((p) => String(p.id) === String(selectedProjectId))

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
            <div className="empty-title">No projects</div>
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

      {/* ---- Analytics (workspace-level, restored from Milestone 2 — project/milestone scoped, no charts) ---- */}
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
    </div>
  )
}
