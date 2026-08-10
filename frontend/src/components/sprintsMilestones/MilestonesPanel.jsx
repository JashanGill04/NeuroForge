import { Plus, Flag } from 'lucide-react'
import { EmptyState } from '../ui'

export default function MilestonesPanel({
  milestones,
  canEdit,
  showMilestoneForm,
  setShowMilestoneForm,
  milestoneForm,
  setMilestoneForm,
  savingMilestone,
  onAddMilestone
}) {
  return (
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
        <form onSubmit={onAddMilestone} className="modal-form sm-card" style={{ marginBottom: 16 }}>
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
  )
}
