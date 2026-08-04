// In Reports.jsx
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { analyticsApi } from '../../api/analytics'
import { analyticsService } from '../../services/analyticsService'
import { taskService } from '../../services/taskService'
import { blockerService } from '../../services/blockerService'
import { Alert, EmptyState } from '../../components/ui'

export default function Reports() {
  const { project, sprints, sprintId, setSprintId, selectedSprint } = useOutletContext()

  const [overview, setOverview] = useState(null)
  const [burndown, setBurndown] = useState(null)
  const [velocity, setVelocity] = useState([])
  const [sprintTasks, setSprintTasks] = useState([])
  const [sprintBlockers, setSprintBlockers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Project-wide rollup (was the standalone Analytics page)
  useEffect(() => {
    if (!project?.id) return
    analyticsApi.getProjectOverview(project.id).then(setOverview).catch((err) => setError(err.message))
  }, [project?.id])

  useEffect(() => {
    if (!sprints || sprints.length === 0) {
      setVelocity([])
      return
    }
    analyticsService.getVelocity(sprints).then(setVelocity).catch((err) => setError(err.message))
  }, [sprints])

  // Sprint-specific burndown (was the standalone Sprint Progress page)
  useEffect(() => {
    if (!selectedSprint) {
      setBurndown(null)
      return
    }
    setLoading(true)
    analyticsService.getBurndown(selectedSprint).then(setBurndown).catch((err) => setError(err.message)).finally(() => setLoading(false))
    taskService.getTasksForSprint(selectedSprint.id).then(setSprintTasks).catch(() => {})
    blockerService.getBlockersForSprint(selectedSprint.id).then(setSprintBlockers).catch(() => {})
  }, [selectedSprint])

  const openBlockerCount = sprintBlockers.filter((b) => !b.resolved).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Project-wide analytics and sprint burndown for {project?.name}.</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      {/* --- GLOBAL REPORTS --- */}
      {overview && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Sprints</div>
            <div className="stat-value">{overview.totalSprints}</div>
          </div>
          {/* REMOVED TOTAL TASKS FROM HERE */}
          <div className="stat-card">
            <div className="stat-label">Completed tasks</div>
            <div className="stat-value">{overview.projectCompletedTasks}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overall completion</div>
            <div className="stat-value">{Math.round(overview.overallProjectCompletion)}%</div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2>Velocity by sprint</h2>
        </div>
        {velocity.length === 0 ? (
          <EmptyState title="No sprint history yet" />
        ) : (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={velocity} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="sprint" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis stroke="var(--chart-axis)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="committed" name="Committed" fill="var(--chart-committed)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="var(--chart-completed)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* --- SPRINT SELECTOR DIVIDER --- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2rem 0 1rem 0' }}>
        <h2 style={{ margin: 0 }}>Sprint Reports</h2>
        <div className="project-topbar-sprint" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sprint:</span>
          <select
            className="inline-select"
            value={sprintId || ''}
            onChange={(e) => setSprintId(e.target.value)}
            disabled={!sprints || sprints.length === 0}
          >
            {(!sprints || sprints.length === 0) && <option value="">No sprints yet</option>}
            {sprints?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name ? `${s.name} — ${s.goal}` : s.goal}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- SPRINT SPECIFIC REPORTS --- */}
      {!selectedSprint ? (
          <EmptyState title="Select a sprint above to view burndown and metrics" />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Days remaining</div>
              <div className="stat-value">{Math.max(0, Math.ceil((new Date(selectedSprint.endDate) - new Date()) / 86400000))}</div>
            </div>
            
            {/* ADDED TOTAL TASKS HERE */}
            <div className="stat-card">
              <div className="stat-label">Total tasks</div>
              <div className="stat-value">{sprintTasks.length}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Points done / total</div>
              <div className="stat-value stat-value-sm">{sprintTasks.filter((t) => t.status === 'DONE').reduce((s, t) => s + (t.points || 0), 0)} / {sprintTasks.reduce((s, t) => s + (t.points || 0), 0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active blockers</div>
              <div className="stat-value" style={{ color: openBlockerCount > 0 ? 'var(--danger)' : 'inherit' }}>{openBlockerCount}</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Burndown — {selectedSprint.goal}</h2>
              {burndown && <span className="page-subtitle-inline">{burndown.remainingNow} / {burndown.totalPoints} points remaining</span>}
            </div>
            {loading || !burndown ? (
              <div className="empty-sub">Loading chart data…</div>
            ) : (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={burndown.series} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="day" stroke="var(--chart-axis)" fontSize={12} />
                    <YAxis stroke="var(--chart-axis)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="ideal" name="Ideal" stroke="var(--ink-soft)" strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--chart-completed)" strokeWidth={2.5} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}