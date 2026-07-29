import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { sprintsApi } from '../api/sprints'
import { milestonesApi } from '../api/milestones'
import { useAuth } from '../context/AuthContext'
import { Alert, StatusBadge, EmptyState } from '../components/ui'
import { canManage } from '../utils/roles'

export default function ProjectDetail() {
  const { id } = useParams()
  const { roles } = useAuth()
  
  const [project, setProject] = useState(null)
  const [sprints, setSprints] = useState([])
  const [milestones, setMilestones] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Added name field to sprintForm state
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '', startDate: '', endDate: '', milestoneId: '' })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', targetDate: '' })
  const [savingSprint, setSavingSprint] = useState(false)
  const [savingMilestone, setSavingMilestone] = useState(false)

  const canEdit = canManage(roles?.[0])

  const load = async () => {
    setLoading(true)
    try {
      const [proj, sp, ms] = await Promise.all([
        projectsApi.getById(id),
        sprintsApi.getByProject(id),
        milestonesApi.getByProject(id)
      ])
      setProject(proj)
      setSprints(sp)
      setMilestones(ms)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleAddSprint = async (e) => {
    e.preventDefault()
    setError('')
    setSavingSprint(true)
    try {
      const sprint = await sprintsApi.create({
        name: sprintForm.name.trim(),
        goal: sprintForm.goal.trim(),
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        projectId: Number(id),
        milestoneId: sprintForm.milestoneId ? Number(sprintForm.milestoneId) : null
      })
      setSprints((prev) => [sprint, ...prev])
      setSprintForm({ name: '', goal: '', startDate: '', endDate: '', milestoneId: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingSprint(false)
    }
  }

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    setError('')
    setSavingMilestone(true)
    try {
      const milestone = await milestonesApi.create({
        title: milestoneForm.title.trim(),
        targetDate: milestoneForm.targetDate,
        projectId: Number(id)
      })
      setMilestones((prev) => [milestone, ...prev])
      setMilestoneForm({ title: '', targetDate: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingMilestone(false)
    }
  }

  if (loading) return <div className="page">Loading…</div>

  if (!project) {
    return (
      <div className="page">
        <Alert>{error || 'Project not found'}</Alert>
        <Link className="link" to="/projects">
          ← Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <Link className="link back-link" to="/projects">
        ← Back to projects
      </Link>

      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p className="page-subtitle">
            <StatusBadge status={project.status} /> · Team: {project.teamName} · Manager:{' '}
            {project.managerUsername || '—'} · Created {project.createdAt}
          </p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <div className="two-col">
        {/* Sprints Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2>Sprints</h2>
          </div>

          {canEdit && (
            <form onSubmit={handleAddSprint} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input
                placeholder="Sprint Name (e.g. Sprint 1)"
                value={sprintForm.name}
                onChange={(e) => setSprintForm((f) => ({ ...f, name: e.target.value }))}
                required
                style={{ width: '100%' }}
              />
              <input
                placeholder="Sprint Goal (e.g. Implement Payment Service)"
                value={sprintForm.goal}
                onChange={(e) => setSprintForm((f) => ({ ...f, goal: e.target.value }))}
                required
                style={{ width: '100%' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="date"
                  title="Start Date"
                  value={sprintForm.startDate}
                  onChange={(e) => setSprintForm((f) => ({ ...f, startDate: e.target.value }))}
                  required
                />
                <input
                  type="date"
                  title="End Date"
                  value={sprintForm.endDate}
                  onChange={(e) => setSprintForm((f) => ({ ...f, endDate: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  className="inline-select"
                  value={sprintForm.milestoneId}
                  onChange={(e) => setSprintForm((f) => ({ ...f, milestoneId: e.target.value }))}
                  style={{ flex: 1 }}
                >
                  <option value="">-- Assign to Milestone (Optional) --</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
                <button className="btn-primary" type="submit" disabled={savingSprint} style={{ whiteSpace: 'nowrap' }}>
                  {savingSprint ? 'Adding…' : 'Add sprint'}
                </button>
              </div>
            </form>
          )}

          {sprints.length === 0 ? (
            <EmptyState title="No sprints yet" />
          ) : (
            <ul className="list">
              {sprints.map((s) => {
                const assignedMilestone = milestones.find((m) => m.id === s.milestoneId)
                return (
                  <li key={s.id} className="list-item">
                    <div>
                      <div className="list-item-title">{s.name} — <span style={{ fontWeight: 'normal', color: 'var(--ink-soft)' }}>{s.goal}</span></div>
                      <div className="list-item-sub">{s.startDate} to {s.endDate}</div>
                    </div>
                    {assignedMilestone ? (
                      <span className="badge" style={{ background: 'var(--accent-soft)', color: '#cfc9ff' }}>
                        {assignedMilestone.title}
                      </span>
                    ) : (
                      <span className="list-item-sub" style={{ fontStyle: 'italic' }}>No milestone</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Milestones Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2>Milestones</h2>
          </div>

          {canEdit && (
            <form onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input
                placeholder="Milestone title (e.g. v1)"
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
                required
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  value={milestoneForm.targetDate}
                  onChange={(e) => setMilestoneForm((f) => ({ ...f, targetDate: e.target.value }))}
                  required
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" type="submit" disabled={savingMilestone} style={{ whiteSpace: 'nowrap' }}>
                  {savingMilestone ? 'Adding…' : 'Add milestone'}
                </button>
              </div>
            </form>
          )}

          {milestones.length === 0 ? (
            <EmptyState title="No milestones yet" />
          ) : (
            <ul className="list">
              {milestones.map((m) => (
                <li key={m.id} className="list-item">
                  <div className="list-item-title">{m.title}</div>
                  <div className="list-item-sub">Due {m.targetDate}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}