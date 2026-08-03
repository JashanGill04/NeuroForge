import { useEffect, useMemo, useState } from 'react'
import { UserPlus, Search } from 'lucide-react'
import { teamsApi } from '../api/teams'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { Alert, Modal, EmptyState } from '../components/ui'
import { canManage, canDelete } from '../utils/roles'

export default function Teams() {
  const { roles } = useAuth()

  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [addingToTeam, setAddingToTeam] = useState(null)
  const [search, setSearch] = useState('')

  const canEdit = canManage(roles?.[0])
  const canRemove = canDelete(roles?.[0])

  const load = async () => {
    setLoading(true)
    try {
      const [t, u] = await Promise.all([teamsApi.getAll(), usersApi.getAll()])
      setTeams(t)
      setUsers(u)
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

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return teams
    return teams.filter((t) => {
      const nameMatch = t.name?.toLowerCase().includes(q)
      const memberMatch = t.memberUsernames?.some((name) => name.toLowerCase().includes(q))
      return nameMatch || memberMatch
    })
  }, [teams, search])

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

      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search teams or members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!loading && (
          <span className="toolbar-result-count">{filteredTeams.length} of {teams.length}</span>
        )}
      </div>

      <div className="card-grid">
        {!loading && teams.length === 0 && (
          <EmptyState title="No teams yet" subtitle={canEdit ? 'Create your first team.' : ''} />
        )}
        {!loading && teams.length > 0 && filteredTeams.length === 0 && (
          <EmptyState title="No matching teams" subtitle="Try a different search term." />
        )}
        {filteredTeams.map((t) => (
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
                  <li key={name} className="chip">{name}</li>
                ))}
              </ul>
            ) : (
              <div className="empty-sub">No members assigned yet</div>
            )}
            {canEdit && (
              <button className="btn-ghost-sm team-add-member-btn" onClick={() => setAddingToTeam(t)}>
                <UserPlus size={14} /> Add member
              </button>
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

      {addingToTeam && (
        <AddMemberModal
          team={addingToTeam}
          users={users}
          onClose={() => setAddingToTeam(null)}
          onAdded={() => {
            setAddingToTeam(null)
            load()
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

function AddMemberModal({ team, users, onClose, onAdded }) {
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
