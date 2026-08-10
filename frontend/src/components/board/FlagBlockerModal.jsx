import { useState } from 'react'
import { blockerService } from '../../services/blockerService'
import { Alert, Modal } from '../ui'

export default function FlagBlockerModal({ task, sprintId, onClose, onFlagged }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await blockerService.raiseBlocker(sprintId, { taskId: task.id, taskTitle: task.title, reason: reason.trim() })
      onFlagged()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Flag "${task.title}" as blocked`} onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Why is it blocked?</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required autoFocus />
        </label>
        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Flagging…' : 'Flag as blocked'}
        </button>
      </form>
    </Modal>
  )
}
