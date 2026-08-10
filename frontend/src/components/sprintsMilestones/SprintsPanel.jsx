import { Plus, Target } from 'lucide-react'
import { EmptyState } from '../ui'

export default function SprintsPanel({
  sprints,
  milestones,
  sprintId,
  setSprintId,
  canEdit,
  showSprintForm,
  setShowSprintForm,
  sprintForm,
  setSprintForm,
  savingSprint,
  onAddSprint
}) {
  return (
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
        <form onSubmit={onAddSprint} className="modal-form sm-card" style={{ marginBottom: 16 }}>
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
  )
}
