import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { teamsApi } from '../api/teams'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { Alert, Modal, StatusBadge, EmptyState } from '../components/ui'
import { canManage } from '../utils/roles'

// Per the Milestone 2 UI restructure handoff: the workspace Projects list is
// now primarily navigational. Row-level status/team edits and delete moved
// to each project's own Settings page (/projects/:id/settings).
export default function Projects() {
  const { roles, username } = useAuth()

  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [p, t, u] = await Promise.all([projectsApi.getAll(), teamsApi.getAll(), usersApi.getAll()])
      setProjects(p)
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

  const canEdit = canManage(roles?.[0])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">Create and manage every project in the platform.</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New Project
          </button>
        )}
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <div className="panel">
        {!loading && projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            subtitle={canEdit ? 'Create your first project to get started.' : 'Check back once a project has been created.'}
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Team</th>
                <th>Manager</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{p.teamName || '—'}</td>
                  <td>{p.managerUsername || '—'}</td>
                  <td>{p.createdAt}</td>
                  <td>
                    <Link className="link" to={`/projects/${p.id}`}>
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="page-subtitle-inline settings-hint">
        Need to rename, reassign a team, change status, or delete a project? Open it, then go to its Settings tab.
      </p>

      {showCreate && (
        <CreateProjectModal
          teams={teams}
          users={users}
          currentUsername={username}
          onClose={() => setShowCreate(false)}
          onCreated={(project) => {
            setProjects((prev) => [project, ...prev])
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}

function CreateProjectModal({ teams, users, currentUsername, onClose, onCreated }) {
  const currentUserInDb = users.find((u) => u.username === currentUsername)

  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState('')
  const [managerId, setManagerId] = useState(currentUserInDb?.id ? String(currentUserInDb.id) : '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const project = await projectsApi.create({
        name: name.trim(),
        teamId: teamId ? Number(teamId) : null,
        managerId: managerId ? Number(managerId) : null
      })
      onCreated(project)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Create a new project" onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Project name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>

        <label className="field">
          <span>Team (optional)</span>
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value="">Unassigned</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Manager</span>
          <select value={managerId} onChange={(e) => setManagerId(e.target.value)} required>
            <option value="">Select a manager</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} {u.id === currentUserInDb?.id ? '(you)' : ''}
              </option>
            ))}
          </select>
        </label>

        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </Modal>
  )
}
