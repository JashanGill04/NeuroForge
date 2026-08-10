import { Plus } from 'lucide-react'

export default function BoardHeader({ selectedSprint, sprints, sprintId, setSprintId, canEdit, onNewTask }) {
  return (
    <div className="page-header">
      <div>
        <h1>{selectedSprint ? selectedSprint.name || 'Board' : 'Board'}</h1>
        <p className="page-subtitle">
          {selectedSprint ? `Goal: ${selectedSprint.goal || 'No goal set'}` : 'Pick a sprint to see its board.'}
        </p>
      </div>

      <div className="board-header-actions">
        <div className="project-topbar-sprint">
          <span className="board-sprint-label">Sprint:</span>
          <select
            className="inline-select"
            value={sprintId || ''}
            onChange={(e) => setSprintId(e.target.value)}
            disabled={!sprints || sprints.length === 0}
          >
            {(!sprints || sprints.length === 0) && <option value="">No sprints yet</option>}
            {sprints?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name ? `${s.name} — ${s.goal}` : s.goal}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={onNewTask}
          disabled={!sprintId || !canEdit}
          title={!canEdit ? 'Only Admins and Project Managers can create tasks' : ''}
        >
          <Plus size={16} /> New Task
        </button>
      </div>
    </div>
  )
}
