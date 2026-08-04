import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, AlertTriangle, Trash2 } from 'lucide-react'
import { usersApi } from '../../api/users'
import { taskService } from '../../services/taskService'
import { blockerService } from '../../services/blockerService'
import { useAuth } from '../../context/AuthContext'
import { canManage } from '../../utils/roles'
import { Alert, Modal, EmptyState } from '../../components/ui'
import TaskDetailModal from '../../components/TaskDetailModal'

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' }
]

export default function Board() {
  // ADDED sprints, setSprintId HERE
  const { project, sprints, sprintId, setSprintId, selectedSprint } = useOutletContext()
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [blockingTask, setBlockingTask] = useState(null)
  const [openTask, setOpenTask] = useState(null)
  const [dragTaskId, setDragTaskId] = useState(null)

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(() => {})
  }, [])

  const teamUsers = project?.teamName ? users.filter((u) => u.team?.name === project.teamName || u.teamName === project.teamName) : users

  useEffect(() => {
    if (!sprintId) {
      setTasks([])
      return
    }
    let mounted = true
    setLoading(true)
    taskService
      .getTasksForSprint(sprintId)
      .then((data) => mounted && setTasks(data))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [sprintId])

  const applyUpdate = (updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))

  const moveTask = async (taskId, status) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task?.isBlocked) return
    try {
      applyUpdate(await taskService.updateStatus(sprintId, taskId, status))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskService.deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDrop = (status) => (e) => {
    e.preventDefault()
    if (dragTaskId != null) {
      const task = tasks.find((t) => t.id === dragTaskId)
      if (task && !task.isBlocked) moveTask(dragTaskId, status)
    }
    setDragTaskId(null)
  }

return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{selectedSprint ? selectedSprint.name || 'Board' : 'Board'}</h1>
          <p className="page-subtitle">{selectedSprint ? `Goal: ${selectedSprint.goal || 'No goal set'}` : 'Pick a sprint to see its board.'}</p>
        </div>
        
        {/* ADDED SPRINT SELECTOR ALONGSIDE THE NEW TASK BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="project-topbar-sprint" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sprint:</span>
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
          
          <button className="btn-primary" onClick={() => setShowCreate(true)} disabled={!sprintId || !canEdit} title={!canEdit ? 'Only Admins and Project Managers can create tasks' : ''}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>
      
      {/* ... (Keep the rest of the file the same) ... */}

      {!sprintId ? (
        <EmptyState title="No sprint selected" subtitle="Create a sprint under Sprints & Milestones first." />
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key)
            return (
              <div key={col.key} className="kanban-column" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop(col.key)}>
                <div className="kanban-column-header">
                  <span>{col.label}</span>
                  <span className="kanban-count">{colTasks.length}</span>
                </div>
                <div className="kanban-column-body">
                  {loading && <div className="empty-sub">Loading…</div>}
                  {!loading && colTasks.length === 0 && <div className="kanban-empty">Drop tasks here</div>}
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className={'kanban-card' + (task.isBlocked ? ' kanban-card-blocked' : '')}
                      draggable={!task.isBlocked}
                      onDragStart={() => !task.isBlocked && setDragTaskId(task.id)}
                      onClick={() => setOpenTask(task)}
                    >
                      <div className="kanban-card-title">
                        {task.isBlocked && <AlertTriangle size={14} className="kanban-card-blocked-icon" />}
                        {task.title}
                      </div>
                      <div className="kanban-card-meta">
                        <span className="points-badge">{task.points} pts</span>
                        {task.assigneeId && (
                          <span className="assignee-chip">{teamUsers.find((u) => u.id === task.assigneeId)?.username || `#${task.assigneeId}`}</span>
                        )}
                      </div>
                      <div className="kanban-card-actions" onClick={(e) => e.stopPropagation()}>
                        <select
                          className="inline-select inline-select-sm"
                          value={task.status}
                          onChange={(e) => moveTask(task.id, e.target.value)}
                          disabled={task.isBlocked}
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                          ))}
                        </select>
                        <button className="btn-ghost-sm" onClick={() => !task.isBlocked && setBlockingTask(task)} disabled={task.isBlocked} title="Flag as blocked">
                          <AlertTriangle size={14} />
                        </button>
                        <button className="btn-ghost-sm" onClick={() => handleDelete(task.id)} title="Delete task">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <CreateTaskModal
          users={teamUsers}
          sprintId={sprintId}
          onClose={() => setShowCreate(false)}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev])
            setShowCreate(false)
          }}
        />
      )}

      {blockingTask && (
        <FlagBlockerModal
          task={blockingTask}
          sprintId={sprintId}
          onClose={() => setBlockingTask(null)}
          onFlagged={() => {
            setTasks((prev) => prev.map((t) => (t.id === blockingTask.id ? { ...t, isBlocked: true } : t)))
            setBlockingTask(null)
          }}
        />
      )}

      {openTask && (
        <TaskDetailModal
          task={tasks.find((t) => t.id === openTask.id) || openTask}
          sprintId={sprintId}
          sprintName={selectedSprint?.name}
          users={teamUsers}
          canEdit={canEdit}
          onClose={() => setOpenTask(null)}
          onTaskChanged={(updated) => {
            applyUpdate(updated)
            setOpenTask(updated)
          }}
        />
      )}
    </div>
  )
}

function CreateTaskModal({ users, onClose, onCreated, sprintId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(3)
  const [assigneeId, setAssigneeId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const task = await taskService.createTask(sprintId, {
        title: title.trim(),
        points: Number(points),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        status: 'TODO',
        description: description.trim() // Sends description straight to the backend
      })
      onCreated(task)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="New task" onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What needs to be done…" />
        </label>
        <label className="field">
          <span>Story points</span>
          <select value={points} onChange={(e) => setPoints(e.target.value)}>
            {[1, 2, 3, 5, 8, 13].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Assignee</span>
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </label>
        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create task'}
        </button>
      </form>
    </Modal>
  )
}

function FlagBlockerModal({ task, sprintId, onClose, onFlagged }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await blockerService.raiseBlocker(sprintId, { taskId: task.id, taskTitle: task.title, reason: reason.trim() })
      onFlagged()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Flag "${task.title}" as blocked`} onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Why is it blocked?</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required autoFocus />
        </label>
        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Flagging…' : 'Flag as blocked'}
        </button>
      </form>
    </Modal>
  )
}