import { Lock } from 'lucide-react'

const STATUS_OPTIONS = ['ACTIVE', 'ON_HOLD', 'COMPLETED']

export default function ProjectSettingsForm({ project, teams, status, setStatus, teamId, setTeamId, saving, isDirty, onSave }) {
  return (
    <form onSubmit={onSave} className="modal-form">
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
  )
}

export { STATUS_OPTIONS }
