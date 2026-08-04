import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Lock, AlertTriangle, Users, Activity, Hash } from 'lucide-react'
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
  const [confirmingDelete, setConfirmingDelete] = useState(false)

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

  const isDirty = status !== (project.status || 'ACTIVE') || String(teamId) !== String(project.teamId || '')
  const currentTeamName = teams.find((t) => String(t.id) === String(teamId))?.name || 'Unassigned'

  const handleSave = async (e) => {
    e.preventDefault()
    if (!isDirty) return
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
    setDeleting(true)
    try {
      await projectsApi.remove(project.id)
      navigate('/projects')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="page">
      {/* Inlined since there's no separate stylesheet in this project.
          Every rule here is namespaced with "ps-" so it can never collide
          with a class your global stylesheet already defines — that's what
          caused the last layout bug (this file reused .settings-danger-zone,
          which your global CSS already styled as a flex row). */}
      <style>{`
        .ps-field-locked input {
          color: var(--ink-soft, #8a8fa3);
          cursor: not-allowed;
        }
        .ps-field-locked span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .ps-lock-icon {
          opacity: 0.6;
        }

        .ps-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 820px) {
          .ps-layout {
            grid-template-columns: 1fr;
          }
        }

        .ps-overview-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .ps-overview-row:last-child {
          border-bottom: none;
        }
        .ps-overview-icon {
          opacity: 0.6;
          flex-shrink: 0;
        }
        .ps-overview-label {
          font-size: 12px;
          color: var(--ink-soft, #8a8fa3);
        }
        .ps-overview-value {
          font-weight: 600;
          margin-left: auto;
          text-align: right;
        }
        .ps-status-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          background: rgba(52, 211, 153, 0.15);
          color: #34d399;
        }
        .ps-status-pill[data-status="ON_HOLD"] {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
        }
        .ps-status-pill[data-status="COMPLETED"] {
          background: rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
        }

        .ps-danger-zone {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ps-danger-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #f87171;
        }
        .ps-danger-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px;
          border: 1px solid rgba(248, 113, 113, 0.25);
          border-radius: 10px;
          background: rgba(248, 113, 113, 0.05);
        }
        .ps-danger-card.ps-danger-confirm {
          border-color: rgba(248, 113, 113, 0.5);
          background: rgba(248, 113, 113, 0.1);
        }
        .ps-btn-danger {
          background: #dc2626;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .ps-btn-danger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1>Project Settings</h1>
          <p className="page-subtitle">Reassign team, change status, or delete {project.name}.</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <div className="ps-layout">
        <div className="panel">
          <form onSubmit={handleSave} className="modal-form">
            <label className="field ps-field-locked" title="Renaming isn't supported by the backend yet">
              <span>Project name <Lock size={11} className="ps-lock-icon" /></span>
              <input value={project.name} disabled />
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

            <label className="field ps-field-locked" title="Changing the manager isn't supported by the backend yet">
              <span>Manager <Lock size={11} className="ps-lock-icon" /></span>
              <input value={project.managerUsername || '—'} disabled />
            </label>

            <button className="btn-primary btn-block" type="submit" disabled={saving || !isDirty}>
              {saving ? 'Saving…' : isDirty ? 'Save changes' : 'No changes to save'}
            </button>
          </form>

          <div className="ps-danger-zone">
            <div className="ps-danger-header">
              <AlertTriangle size={15} />
              <span>Danger zone</span>
            </div>

            {!confirmingDelete ? (
              <div className="ps-danger-card">
                <div>
                  <div className="list-item-title">Delete this project</div>
                  <div className="list-item-sub">Removes the project and its association with sprints/milestones. This cannot be undone.</div>
                </div>
                <button className="btn-danger-ghost" onClick={() => setConfirmingDelete(true)}>
                  Delete project
                </button>
              </div>
            ) : (
              <div className="ps-danger-card ps-danger-confirm">
                <div>
                  <div className="list-item-title">Delete "{project.name}"?</div>
                  <div className="list-item-sub">This is permanent — sprints, milestones, and tasks go with it.</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-ghost-sm" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                    Cancel
                  </button>
                  <button className="ps-btn-danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Yes, delete it'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Overview</h2>
          </div>
          <div className="ps-overview-row">
            <Activity size={14} className="ps-overview-icon" />
            <span className="ps-overview-label">Status</span>
            <span className="ps-overview-value">
              <span className="ps-status-pill" data-status={status}>{status.replaceAll('_', ' ')}</span>
            </span>
          </div>
          <div className="ps-overview-row">
            <Users size={14} className="ps-overview-icon" />
            <span className="ps-overview-label">Team</span>
            <span className="ps-overview-value">{currentTeamName}</span>
          </div>
          <div className="ps-overview-row">
            <Lock size={14} className="ps-overview-icon" />
            <span className="ps-overview-label">Manager</span>
            <span className="ps-overview-value">{project.managerUsername || '—'}</span>
          </div>
          {project.id != null && (
            <div className="ps-overview-row">
              <Hash size={14} className="ps-overview-icon" />
              <span className="ps-overview-label">Project ID</span>
              <span className="ps-overview-value">{project.id}</span>
            </div>
          )}
          {project.createdAt && (
            <div className="ps-overview-row">
              <span className="ps-overview-label">Created</span>
              <span className="ps-overview-value">{project.createdAt}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}