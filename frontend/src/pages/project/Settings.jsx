import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { projectsApi } from '../../api/projects'
import { teamsApi } from '../../api/teams'
import { Alert } from '../../components/ui'

const STATUS_OPTIONS = ['ACTIVE', 'ON_HOLD', 'COMPLETED']

export default function Settings() {
  const { project, reloadProject } = useOutletContext()
  const navigate = useNavigate()

  const [teams, setTeams] = useState([])
  const [status, setStatus] = useState('')
  const [teamId, setTeamId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    teamsApi.getAll().then(setTeams).catch(() => {})
  }, [])

  useEffect(() => {
    if (project) {
      setStatus(project.status || 'ACTIVE')
      setTeamId(project.teamId ? String(project.teamId) : '')
    }
  }, [project])

  if (!project) return null

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      if (status !== project.status) {
        await projectsApi.updateStatus(project.id, status)
      }
      if (teamId && String(teamId) !== String(project.teamId || '')) {
        await projectsApi.assignTeam(project.id, Number(teamId))
      }
      await reloadProject()
      setSuccess('Changes saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await projectsApi.remove(project.id)
      navigate('/projects')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Project Settings</h1>
          <p className="page-subtitle">Reassign team, change status, or delete {project.name}.</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <div className="panel" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSave} className="modal-form">
          <label className="field">
            <span>Project name</span>
            <input value={project.name} disabled title="Renaming isn't supported by the backend yet" />
          </label>

          <label className="field">
            <span>Status</span>
            <select className="inline-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Team</span>
            <select className="inline-select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">Unassigned</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Manager</span>
            <input value={project.managerUsername || '—'} disabled title="Changing the manager isn't supported by the backend yet" />
          </label>

          <button className="btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="settings-danger-zone">
          <div>
            <div className="list-item-title">Delete this project</div>
            <div className="list-item-sub">Removes the project and its association with sprints/milestones. This cannot be undone.</div>
          </div>
          <button className="btn-danger-ghost" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete project'}
          </button>
        </div>
      </div>
    </div>
  )
}
