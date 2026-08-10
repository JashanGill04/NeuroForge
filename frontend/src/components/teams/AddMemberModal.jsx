import { useState } from 'react'
import { usersApi } from '../../api/users'
import { Alert, Modal } from '../ui'

export default function AddMemberModal({ team, users, onClose, onAdded }) {
  const eligible = users.filter((u) => String(u.teamId || '') !== String(team.id))
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) return
    setError('')
    setSubmitting(true)
    try {
      await usersApi.assignTeam(Number(userId), team.id)
      onAdded()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Add a member to "${team.name}"`} onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>User</span>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
            <option value="">Select a user</option>
            {eligible.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}{u.teamName ? ` (currently: ${u.teamName})` : ''}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add to team'}
        </button>
      </form>
    </Modal>
  )
}
