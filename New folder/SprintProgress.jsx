import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useProjectSprints } from '../hooks/useProjectSprints'
import { analyticsService } from '../services/analyticsService'
import { taskService } from '../services/taskService'
import { blockerService } from '../services/blockerService'
import SprintSelector from '../components/SprintSelector'
import { Alert, EmptyState } from '../components/ui'

export default function SprintProgress() {
  const {
    projects, sprints, projectId, setProjectId, sprintId, setSprintId,
    selectedSprint, loadingSprints, error: pickerError
  } = useProjectSprints()

  const [burndown, setBurndown] = useState(null)
  const [sprintTasks, setSprintTasks] = useState([])
  const [sprintBlockers, setSprintBlockers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedSprint) {
      setBurndown(null)
      return
    }
    setLoading(true)
    analyticsService
      .getBurndown(selectedSprint)
      .then(setBurndown)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectedSprint])

  useEffect(() => {
    if (!selectedSprint) {
      setSprintTasks([])
      setSprintBlockers([])
      return
    }
    taskService.getTasksForSprint(selectedSprint.id).then(setSprintTasks).catch((err) => setError(err.message))
    blockerService.getBlockersForSprint(selectedSprint.id).then(setSprintBlockers).catch((err) => setError(err.message))
  }, [selectedSprint])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Sprint Progress</h1>
          <p className="page-subtitle">
            Active burndown, task tracking &amp; sprint velocity monitoring
          </p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error || pickerError}</Alert>

      <div className="panel panel-tight">
        <SprintSelector
          projects={projects} projectId={projectId} setProjectId={setProjectId}
          sprints={sprints} sprintId={sprintId} setSprintId={setSprintId} loadingSprints={loadingSprints}
        />
      </div>

      {!selectedSprint ? (
        <EmptyState title="No sprint selected" subtitle="Create a project and sprint first." />
      ) : (
        <>
          {(() => {
            const daysRemaining = Math.max(0, Math.ceil((new Date(selectedSprint.endDate) - new Date()) / 86400000))
            const donePoints = sprintTasks.filter((t) => t.status === 'DONE').reduce((s, t) => s + (t.points || 0), 0)
            const totalPoints = sprintTasks.reduce((s, t) => s + (t.points || 0), 0)
            const openBlockerCount = sprintBlockers.filter((b) => !b.resolved).length
            
            return (
              <div className="stat-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                  <div className="stat-label">Days remaining</div>
                  <div className="stat-value">{daysRemaining}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Sprint Velocity (Completed)</div>
                  <div className="stat-value">{donePoints} <span style={{ fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 'normal' }}>pts</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Points done / total</div>
                  <div className="stat-value">{donePoints} / {totalPoints}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active blockers</div>
                  <div className="stat-value" style={{ color: openBlockerCount > 0 ? 'var(--danger, #ef4444)' : 'inherit' }}>
                    {openBlockerCount}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Main Burndown Chart Panel */}
          <div className="panel" style={{ marginBottom: '20px' }}>
            <div className="panel-header">
              <h2>Burndown — {selectedSprint.goal}</h2>
              {burndown && (
                <span className="page-subtitle-inline">
                  {burndown.remainingNow} / {burndown.totalPoints} points remaining
                </span>
              )}
            </div>
            {loading || !burndown ? (
              <div className="empty-sub" style={{ padding: '40px', textAlign: 'center' }}>Loading chart data…</div>
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
                    <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--accent)" strokeWidth={2.5} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Two-Column Grid for Tasks and Blockers to maximize screen space */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Tasks in Sprint Panel */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <h2>Tasks in this sprint</h2>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px' }}>
                {sprintTasks.length === 0 ? (
                  <EmptyState title="No tasks in this sprint" />
                ) : (
                  <table className="table">
                    <thead>
                      <tr><th>Task</th><th>Status</th><th>Points</th></tr>
                    </thead>
                    <tbody>
                      {sprintTasks.map((t) => (
                        <tr key={t.id}>
                          <td>{t.title}</td>
                          <td><span className={`badge badge-${t.status?.toLowerCase()}`}>{t.status}</span></td>
                          <td>{t.points} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Blockers Panel */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <h2>Sprint Blockers</h2>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px' }}>
                {sprintBlockers.length === 0 ? (
                  <EmptyState title="No blockers raised" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sprintBlockers.map((b) => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                        <div>
                          <strong>{b.taskTitle}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{b.reason}</div>
                        </div>
                        <strong style={{ fontSize: '12px', color: b.resolved ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)' }}>
                          {b.resolved ? 'Resolved' : 'Open'}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}