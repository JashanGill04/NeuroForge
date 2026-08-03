import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { sprintsApi } from '../../api/sprints'
import { milestonesApi } from '../../api/milestones'
import { useAuth } from '../../context/AuthContext'
import { Alert, EmptyState } from '../../components/ui'
import { canManage } from '../../utils/roles'

export default function SprintsMilestones() {
  const { project, sprints, milestones, sprintId, setSprintId, reloadSprints, reloadMilestones } = useOutletContext()
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const [error, setError] = useState('')
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '', startDate: '', endDate: '', milestoneId: '' })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', targetDate: '' })
  const [savingSprint, setSavingSprint] = useState(false)
  const [savingMilestone, setSavingMilestone] = useState(false)

  const handleAddSprint = async (e) => {
    e.preventDefault()
    setError('')
    setSavingSprint(true)
    try {
      await sprintsApi.create({
        name: sprintForm.name.trim(),
        goal: sprintForm.goal.trim(),
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        projectId: Number(project.id),
        milestoneId: sprintForm.milestoneId ? Number(sprintForm.milestoneId) : null
      })
      await reloadSprints()
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
      await milestonesApi.create({
        title: milestoneForm.title.trim(),
        targetDate: milestoneForm.targetDate,
        projectId: Number(project.id)
      })
      await reloadMilestones()
      setMilestoneForm({ title: '', targetDate: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingMilestone(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Sprints &amp; Milestones</h1>
          <p className="page-subtitle">Plan sprints and group them under milestones for {project?.name}.</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      {/* Sprint filter — highlights the sprint currently active across Board/Blockers/Reports */}
      {sprints.length > 0 && (
        <div className="panel panel-tight">
          <label className="field field-inline" style={{ margin: 0 }}>
            <span>Viewing sprint</span>
            <select className="inline-select" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.goal}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="two-col">
        <div className="panel">
          <div className="panel-header">
            <h2>Sprints</h2>
          </div>

          {canEdit && (
            <form onSubmit={handleAddSprint} className="modal-form" style={{ marginBottom: 20 }}>
              <input placeholder="Sprint Name (e.g. Sprint 1)" value={sprintForm.name} onChange={(e) => setSprintForm((f) => ({ ...f, name: e.target.value }))} required />
              <input placeholder="Sprint Goal (e.g. Implement Payment Service)" value={sprintForm.goal} onChange={(e) => setSprintForm((f) => ({ ...f, goal: e.target.value }))} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input type="date" title="Start Date" value={sprintForm.startDate} onChange={(e) => setSprintForm((f) => ({ ...f, startDate: e.target.value }))} required />
                <input type="date" title="End Date" value={sprintForm.endDate} onChange={(e) => setSprintForm((f) => ({ ...f, endDate: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <select className="inline-select" style={{ flex: 1 }} value={sprintForm.milestoneId} onChange={(e) => setSprintForm((f) => ({ ...f, milestoneId: e.target.value }))}>
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
                const isActive = String(s.id) === String(sprintId)
                return (
                  <li key={s.id} className={'list-item sprint-list-item' + (isActive ? ' sprint-list-item-active' : '')} onClick={() => setSprintId(String(s.id))}>
                    <div>
                      <div className="list-item-title">{s.name} — <span style={{ fontWeight: 'normal', color: 'var(--ink-soft)' }}>{s.goal}</span></div>
                      <div className="list-item-sub">{s.startDate} to {s.endDate}</div>
                    </div>
                    {assignedMilestone ? (
                      <span className="badge badge-milestone">{assignedMilestone.title}</span>
                    ) : (
                      <span className="list-item-sub" style={{ fontStyle: 'italic' }}>No milestone</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Milestones</h2>
          </div>

          {canEdit && (
            <form onSubmit={handleAddMilestone} className="modal-form" style={{ marginBottom: 20 }}>
              <input placeholder="Milestone title (e.g. v1)" value={milestoneForm.title} onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))} required />
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="date" style={{ flex: 1 }} value={milestoneForm.targetDate} onChange={(e) => setMilestoneForm((f) => ({ ...f, targetDate: e.target.value }))} required />
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
