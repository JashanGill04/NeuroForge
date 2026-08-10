import { EmptyState } from '../ui'

export default function MilestonesPanel({ milestones, canEdit, milestoneForm, setMilestoneForm, savingMilestone, onAddMilestone }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Milestones</h2>
      </div>

      {canEdit && (
        <form onSubmit={onAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
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
  )
}
