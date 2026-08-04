import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Target, Flag } from 'lucide-react'
import { sprintsApi } from '../../api/sprints'
import { milestonesApi } from '../../api/milestones'
import { useAuth } from '../../context/AuthContext'
import { Alert, EmptyState } from '../../components/ui'
import { canManage } from '../../utils/roles'

// ---------------------------------------------------------------------------
// Redesign notes:
// - Removed the separate "Viewing sprint" dropdown panel — the sprint list
//   below already lets you click a sprint to view it, so the dropdown was a
//   second control doing the same job. The active sprint is now just
//   highlighted in the list itself, with a small "Viewing" tag.
// - Both add-forms are collapsed behind a "+ New sprint" / "+ New milestone"
//   button instead of always being open. On a page whose main job is
//   *browsing* sprints and milestones, two multi-field forms sitting open by
//   default was the biggest source of clutter.
// - Replaced ad-hoc inline styles with a couple of small reusable classes
//   (sm-card, sm-card-header, sm-empty) so the two columns read the same way.
// ---------------------------------------------------------------------------
export default function SprintsMilestones() {
  const { project, sprints, milestones, sprintId, setSprintId, reloadSprints, reloadMilestones } = useOutletContext()
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const [error, setError] = useState('')
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '', startDate: '', endDate: '', milestoneId: '' })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', targetDate: '' })
  const [savingSprint, setSavingSprint] = useState(false)
  const [savingMilestone, setSavingMilestone] = useState(false)
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)

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
      setShowSprintForm(false)
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
      setShowMilestoneForm(false)
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

      <div className="two-col">
        <div className="panel">
          <div className="panel-header">
            <h2><Target size={16} /> Sprints</h2>
            {canEdit && (
              <button className="btn-ghost-sm" onClick={() => setShowSprintForm((v) => !v)}>
                <Plus size={14} /> {showSprintForm ? 'Cancel' : 'New sprint'}
              </button>
            )}
          </div>

          {showSprintForm && (
            <form onSubmit={handleAddSprint} className="modal-form sm-card" style={{ marginBottom: 16 }}>
              <input
                placeholder="Sprint name (e.g. Sprint 1)"
                value={sprintForm.name}
                onChange={(e) => setSprintForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                placeholder="Sprint goal (e.g. Implement payment service)"
                value={sprintForm.goal}
                onChange={(e) => setSprintForm((f) => ({ ...f, goal: e.target.value }))}
                required
              />
              <div className="sm-form-row">
                <input type="date" title="Start date" value={sprintForm.startDate} onChange={(e) => setSprintForm((f) => ({ ...f, startDate: e.target.value }))} required />
                <input type="date" title="End date" value={sprintForm.endDate} onChange={(e) => setSprintForm((f) => ({ ...f, endDate: e.target.value }))} required />
              </div>
              <select className="inline-select" value={sprintForm.milestoneId} onChange={(e) => setSprintForm((f) => ({ ...f, milestoneId: e.target.value }))}>
                <option value="">No milestone</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              <button className="btn-primary" type="submit" disabled={savingSprint}>
                {savingSprint ? 'Adding…' : 'Add sprint'}
              </button>
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
                  <li
                    key={s.id}
                    className={'list-item sprint-list-item' + (isActive ? ' sprint-list-item-active' : '')}
                    onClick={() => setSprintId(String(s.id))}
                  >
                    <div>
                      <div className="list-item-title">
                        {s.name}
                        {isActive && <span className="badge badge-active">Viewing</span>}
                      </div>
                      <div className="list-item-sub">{s.goal}</div>
                      <div className="list-item-sub">{s.startDate} – {s.endDate}</div>
                    </div>
                    {assignedMilestone ? (
                      <span className="badge badge-milestone">{assignedMilestone.title}</span>
                    ) : (
                      <span className="list-item-sub sm-muted">No milestone</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2><Flag size={16} /> Milestones</h2>
            {canEdit && (
              <button className="btn-ghost-sm" onClick={() => setShowMilestoneForm((v) => !v)}>
                <Plus size={14} /> {showMilestoneForm ? 'Cancel' : 'New milestone'}
              </button>
            )}
          </div>

          {showMilestoneForm && (
            <form onSubmit={handleAddMilestone} className="modal-form sm-card" style={{ marginBottom: 16 }}>
              <input
                placeholder="Milestone title (e.g. v1)"
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <input
                type="date"
                value={milestoneForm.targetDate}
                onChange={(e) => setMilestoneForm((f) => ({ ...f, targetDate: e.target.value }))}
                required
              />
              <button className="btn-primary" type="submit" disabled={savingMilestone}>
                {savingMilestone ? 'Adding…' : 'Add milestone'}
              </button>
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