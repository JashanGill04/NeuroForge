import { EmptyState } from '../ui'

export default function SprintsPanel({ sprints, milestones, canEdit, sprintForm, setSprintForm, savingSprint, onAddSprint }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Sprints</h2>
      </div>

      {canEdit && (
        <form onSubmit={onAddSprint} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
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
  )
}
