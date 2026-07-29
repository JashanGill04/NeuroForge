import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { teamsApi } from '../api/teams'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { Alert, Modal, StatusBadge, EmptyState } from '../components/ui'
import { canManage, canDelete } from '../utils/roles'

const STATUS_OPTIONS = ['ACTIVE', 'ON_HOLD', 'COMPLETED']

export default function Projects() {
  // 1. Destructure roles and username from Keycloak
  const { roles, username } = useAuth()
  
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [assigningProject, setAssigningProject] = useState(null)

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

  const handleStatusChange = async (project, status) => {
    setError('')
    try {
      const updated = await projectsApi.updateStatus(project.id, status)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (project) => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return
    setError('')
    try {
      await projectsApi.remove(project.id)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    } catch (err) {
      setError(err.message)
    }
  }

  // 2. Pass the primary role for permissions
  const canEdit = canManage(roles?.[0])
  const canRemove = canDelete(roles?.[0])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">Create, track and manage every project in the platform.</p>
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
                <th>Sprints &amp; Milestones</th>
                {(canEdit || canRemove) && <th></th>}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    {canEdit ? (
                      <select
                        className="inline-select"
                        value={p.status}
                        onChange={(e) => handleStatusChange(p, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replaceAll('_', ' ')}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={p.status} />
                    )}
                  </td>
                  <td>
                    {p.teamName}
                    {canEdit && (
                      <button className="link-btn" onClick={() => setAssigningProject(p)}>
                        change
                      </button>
                    )}
                  </td>
                  <td>{p.managerUsername || '—'}</td>
                  <td>{p.createdAt}</td>
                  <td>
                    <Link className="link" to={`/projects/${p.id}`}>
                      View →
                    </Link>
                  </td>
                  {(canEdit || canRemove) && (
                    <td>
                      {canRemove && (
                        <button className="btn-danger-ghost" onClick={() => handleDelete(p)}>
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          teams={teams}
          users={users}
          currentUsername={username} // 3. Pass username instead of full user object
          onClose={() => setShowCreate(false)}
          onCreated={(project) => {
            setProjects((prev) => [project, ...prev])
            setShowCreate(false)
          }}
        />
      )}

      {assigningProject && (
        <AssignTeamModal
          project={assigningProject}
          teams={teams}
          onClose={() => setAssigningProject(null)}
          onAssigned={(updated) => {
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
            setAssigningProject(null)
          }}
        />
      )}
    </div>
  )
}

function CreateProjectModal({ teams, users, currentUsername, onClose, onCreated }) {
  // 4. Find the matching DB user by their Keycloak username
  const currentUserInDb = users.find((u) => u.username === currentUsername)

  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState('')
  
  // 5. Safely default to the found DB ID
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
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
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

function AssignTeamModal({ project, teams, onClose, onAssigned }) {
  const [teamId, setTeamId] = useState(project.teamId ? String(project.teamId) : '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!teamId) return
    setError('')
    setSubmitting(true)
    try {
      const updated = await projectsApi.assignTeam(project.id, Number(teamId))
      onAssigned(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Assign a team to "${project.name}"`} onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Team</span>
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)} required>
            <option value="">Select a team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Assigning…' : 'Assign team'}
        </button>
      </form>
    </Modal>
  )
}