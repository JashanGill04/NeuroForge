import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ListTodo } from 'lucide-react'
import { Alert, EmptyState } from '../../components/ui'

// ---------------------------------------------------------------------------
// Backlog — DUMMY DATA ONLY
// ---------------------------------------------------------------------------
// Per the handoff note: this screen "had no current equivalent, so it needs
// a product decision, not just a restyle." The Task entity currently
// requires a sprintId (nullable = false), so a task literally cannot exist
// without a sprint yet — there is no backend concept of "unscheduled work."
// This page is a UI-only preview of what a backlog would look like once that
// decision is made. "Add to sprint" just moves the row out of the local list
// — it does not call any API.
// ---------------------------------------------------------------------------
const SEED_BACKLOG = [
  { id: 'bl-1', title: 'Design notification preferences UI', points: 3 },
  { id: 'bl-2', title: 'Spike: rate-limit Kafka consumer', points: 5 },
  { id: 'bl-3', title: 'Draft onboarding email templates', points: 2 },
  { id: 'bl-4', title: 'Research SSO for enterprise tier', points: 8 }
]

export default function Backlog() {
  const { sprints, sprintId, setSprintId } = useOutletContext()
  const [items, setItems] = useState(SEED_BACKLOG)
  const [addingId, setAddingId] = useState(null)

  const addToSprint = (item) => {
    setAddingId(item.id)
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setAddingId(null)
    }, 300)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Backlog</h1>
          <p className="page-subtitle">Tasks not yet assigned to a sprint. <span className="mock-pill">Demo data</span></p>
        </div>
      </div>

      <Alert type="success">
        This screen uses demo data — the backend doesn't yet support unscheduled tasks (every task requires a sprint today). "Add to sprint" here is a preview only.
      </Alert>

      <div className="panel">
        <div className="panel-header">
          <h2>Unscheduled tasks ({items.length})</h2>
          {sprints.length > 0 && (
            <label className="field field-inline" style={{ margin: 0 }}>
              <span>Target sprint</span>
              <select className="inline-select" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState title="Backlog is clear" subtitle="Everything has been scheduled into a sprint." />
        ) : (
          <ul className="list">
            {items.map((item) => (
              <li key={item.id} className="list-item">
                <div className="list-item-title"><ListTodo size={14} className="backlog-icon" /> {item.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="points-badge">{item.points} pts</span>
                  <button className="btn-ghost-sm" onClick={() => addToSprint(item)} disabled={addingId === item.id || !sprintId}>
                    {addingId === item.id ? 'Adding…' : 'Add to sprint'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
