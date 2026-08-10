import { AlertTriangle, Trash2 } from 'lucide-react'

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' }
]

export { COLUMNS }

export default function KanbanBoard({
  tasks, loading, teamUsers,
  onDragStart, onDrop, onOpenTask, onMoveTask, onFlagBlocked, onDelete
}) {
  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key)
        return (
          <div
            key={col.key}
            className="kanban-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop(col.key)}
          >
            <div className="kanban-column-header">
              <span>{col.label}</span>
              <span className="kanban-count">{colTasks.length}</span>
            </div>
            <div className="kanban-column-body">
              {loading && <div className="empty-sub">Loading…</div>}
              {!loading && colTasks.length === 0 && <div className="kanban-empty">Drop tasks here</div>}
              {colTasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  teamUsers={teamUsers}
                  onDragStart={onDragStart}
                  onOpenTask={onOpenTask}
                  onMoveTask={onMoveTask}
                  onFlagBlocked={onFlagBlocked}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function KanbanCard({ task, teamUsers, onDragStart, onOpenTask, onMoveTask, onFlagBlocked, onDelete }) {
  return (
    <div
      className={'kanban-card' + (task.isBlocked ? ' kanban-card-blocked' : '')}
      draggable={!task.isBlocked}
      onDragStart={() => !task.isBlocked && onDragStart(task.id)}
      onClick={() => onOpenTask(task)}
    >
      <div className="kanban-card-title">
        {task.isBlocked && <AlertTriangle size={14} className="kanban-card-blocked-icon" />}
        {task.title}
      </div>
      <div className="kanban-card-meta">
        <span className="points-badge">{task.points} pts</span>
        {task.assigneeId && (
          <span className="assignee-chip">
            {teamUsers.find((u) => u.id === task.assigneeId)?.username || `#${task.assigneeId}`}
          </span>
        )}
      </div>
      <div className="kanban-card-actions" onClick={(e) => e.stopPropagation()}>
        <select
          className="inline-select inline-select-sm"
          value={task.status}
          onChange={(e) => onMoveTask(task.id, e.target.value)}
          disabled={task.isBlocked}
        >
          {COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <button
          className="btn-ghost-sm"
          onClick={() => !task.isBlocked && onFlagBlocked(task)}
          disabled={task.isBlocked}
          title="Flag as blocked"
        >
          <AlertTriangle size={14} />
        </button>
        <button className="btn-ghost-sm" onClick={() => onDelete(task.id)} title="Delete task">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
