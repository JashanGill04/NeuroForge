import { useEffect, useState } from 'react'
import { teamsApi } from '../api/teams'
import { useAuth } from '../context/AuthContext'
import { Alert, Modal, EmptyState } from '../components/ui'
import { canManage, canDelete } from '../utils/roles'

export default function Teams() {
  // 1. Destructure 'roles' instead of 'user'
  const { roles } = useAuth()
  
  const [teams, setTeams] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  // 2. Pass the primary Keycloak role into your utility functions
  const canEdit = canManage(roles?.[0])
  const canRemove = canDelete(roles?.[0])

  const load = async () => {
    setLoading(true)
    try {
      setTeams(await teamsApi.getAll())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (team) => {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return
    setError('')
    try {
      await teamsApi.remove(team.id)
      setTeams((prev) => prev.filter((t) => t.id !== team.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Teams</h1>
          <p className="page-subtitle">Organize people into teams and staff them on projects.</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New Team
          </button>
        )}
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <div className="card-grid">
        {!loading && teams.length === 0 && (
          <EmptyState title="No teams yet" subtitle={canEdit ? 'Create your first team.' : ''} />
        )}
        {teams.map((t) => (
          <div className="team-card" key={t.id}>
            <div className="team-card-header">
              <h3>{t.name}</h3>
              {canRemove && (
                <button className="btn-danger-ghost" onClick={() => handleDelete(t)}>
                  Delete
                </button>
              )}
            </div>
            <div className="team-member-count">
              {t.memberCount} {t.memberCount === 1 ? 'member' : 'members'}
            </div>
            {t.memberUsernames?.length > 0 ? (
              <ul className="chip-list">
                {t.memberUsernames.map((name) => (
                  <li key={name} className="chip">
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-sub">No members assigned yet</div>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={(team) => {
            setTeams((prev) => [team, ...prev])
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}

function CreateTeamModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const team = await teamsApi.create(name.trim())
      onCreated(team)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Create a new team" onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Team name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create team'}
        </button>
      </form>
    </Modal>
  )
}