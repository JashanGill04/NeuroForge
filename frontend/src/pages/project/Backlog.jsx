import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ListTodo, Plus } from 'lucide-react'
import { taskService } from '../../services/taskService'
import { Alert, EmptyState } from '../../components/ui'
import { canManage } from '../../utils/roles'
import { useAuth } from '../../context/AuthContext'

// ---------------------------------------------------------------------------
// Backlog — now backed by real tasks.
// Uses taskService (same client the board/modal already use), not a separate
// api module. Creating a task with sprintId = null + a projectId puts it
// straight in the backlog; "Add to sprint" calls scheduleIntoSprint, which is
// the only thing that actually moves a task out of here onto the board.
// ---------------------------------------------------------------------------
export default function Backlog() {
  const { project, sprints, sprintId, setSprintId } = useOutletContext()
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingId, setAddingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', points: 1 })
  const [saving, setSaving] = useState(false)

  const loadBacklog = async () => {
    setLoading(true)
    try {
      const data = await taskService.getBacklog(project.id)
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (project?.id) loadBacklog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // sprintId is explicitly null here — createTask still works unchanged
      // because the backend only requires projectId when sprintId is absent.
      await taskService.createTask(null, {
        title: form.title.trim(),
        points: Number(form.points) || 1,
        projectId: Number(project.id),
        status: 'TODO'
      })
      setForm({ title: '', points: 1 })
      setShowForm(false)
      await loadBacklog()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addToSprint = async (item) => {
    if (!sprintId) return
    setAddingId(item.id)
    setError('')
    try {
      await taskService.scheduleIntoSprint(item.id, sprintId)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Backlog</h1>
          <p className="page-subtitle">Tasks not yet assigned to a sprint.</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} /> {showForm ? 'Cancel' : 'New task'}
          </button>
        )}
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      {showForm && (
        <form onSubmit={handleCreate} className="modal-form panel panel-tight" style={{ marginBottom: 20 }}>
          <input
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="number"
              min="1"
              style={{ width: 100 }}
              value={form.points}
              onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
            />
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Adding…' : 'Add to backlog'}
            </button>
          </div>
        </form>
      )}

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

        {loading ? (
          <div className="empty-sub">Loading…</div>
        ) : items.length === 0 ? (
          <EmptyState title="Backlog is clear" subtitle="Everything has been scheduled into a sprint." />
        ) : (
          <ul className="list">
            {items.map((item) => (
              <li key={item.id} className="list-item">
                <div className="list-item-title"><ListTodo size={14} className="backlog-icon" /> {item.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="points-badge">{item.points} pts</span>
                  <button
                    className="btn-ghost-sm"
                    onClick={() => addToSprint(item)}
                    disabled={addingId === item.id || !sprintId}
                  >
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