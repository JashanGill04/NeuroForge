import { useState } from 'react'
import { taskService } from '../../services/taskService'
import { Alert, Modal } from '../ui'

export default function CreateTaskModal({ users, onClose, onCreated, sprintId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(3)
  const [assigneeId, setAssigneeId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const task = await taskService.createTask(sprintId, {
        title: title.trim(),
        points: Number(points),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        status: 'TODO',
        description: description.trim()
      })
      onCreated(task)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="New task" onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What needs to be done…" />
        </label>
        <label className="field">
          <span>Story points</span>
          <select value={points} onChange={(e) => setPoints(e.target.value)}>
            {[1, 2, 3, 5, 8, 13].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Assignee</span>
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </label>
        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create task'}
        </button>
      </form>
    </Modal>
  )
}
