import { useEffect, useState } from 'react'
import { Plus, AlertTriangle, User, Trash2 } from 'lucide-react'
import { useProjectSprints } from '../hooks/useProjectSprints'
import { projectsApi } from '../api/projects'
import { usersApi } from '../api/users'
import { taskService } from '../services/taskService'
import { blockerService } from '../services/blockerService'
import { useAuth } from '../context/AuthContext'
import { canManage } from '../utils/roles'
import SprintSelector from '../components/SprintSelector'
import { Alert, Modal, EmptyState } from '../components/ui'

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' }
]

export default function KanbanBoard() {
  const {
    projects, sprints, projectId, setProjectId, sprintId, sprintName, setSprintId,
    selectedSprint, loadingSprints, error: pickerError
  } = useProjectSprints()

  const { roles } = useAuth()
  const canEditTeam = canManage(roles?.[0])

  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [blockingTask, setBlockingTask] = useState(null)
  const [dragTaskId, setDragTaskId] = useState(null)
  const [projectTeamName, setProjectTeamName] = useState(null)

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(() => {})
  }, [])

  // Fetch project details and extract teamName
  useEffect(() => {
    if (!projectId) {
      setProjectTeamName(null)
      return
    }
    projectsApi.getById(projectId)
      .then((proj) => {
        setProjectTeamName(proj.teamName || null)
      })
      .catch(() => setProjectTeamName(null))
  }, [projectId])

  // Filter users based on whether their team name matches the project's teamName
  const filteredUsers = projectTeamName
    ? users.filter((u) => u.team?.name === projectTeamName || u.teamName === projectTeamName)
    : users

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

  const moveTask = async (taskId, status) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.isBlocked) return // Prevent moving blocked tasks

    try {
      const updated = await taskService.updateStatus(sprintId, taskId, status)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle Assignee Change
  const handleAssign = async (taskId, userId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.isBlocked) return // Prevent changing assignee for blocked tasks

    try {
      const updated = await taskService.assignUser(sprintId, taskId, userId)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle Task Deletion
  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDrop = (status) => (e) => {
    e.preventDefault()
    if (dragTaskId != null) {
      const task = tasks.find(t => t.id === dragTaskId)
      if (task && !task.isBlocked) {
        moveTask(dragTaskId, status)
      }
    }
    setDragTaskId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{selectedSprint ? selectedSprint.name || 'Sprint' : 'Kanban Board'}</h1>
          <p className="page-subtitle">
            {selectedSprint ? `Goal: ${selectedSprint.goal || 'No goal set'}` : 'Task management for the active sprint'}
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowCreate(true)} 
          disabled={!sprintId || !canEditTeam}
          title={!canEditTeam ? "Only Admins and Project Managers can create tasks" : ""}
          style={!canEditTeam ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      <Alert onClose={() => setError('')}>{error || pickerError}</Alert>

      <div className="panel panel-tight">
        <SprintSelector
          projects={projects} projectId={projectId} setProjectId={setProjectId}
          sprints={sprints} sprintName={sprintName} sprintId={sprintId} setSprintId={setSprintId} loadingSprints={loadingSprints}
        />
      </div>

      {!sprintId ? (
        <EmptyState title="No sprint selected" subtitle="Create a project and sprint first." />
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key)
            return (
              <div
                key={col.key}
                className="kanban-column"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop(col.key)}
              >
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
                      className="kanban-card"
                      draggable={!task.isBlocked}
                      onDragStart={() => !task.isBlocked && setDragTaskId(task.id)}
                      style={task.isBlocked ? { borderLeft: '4px solid var(--danger, #ef4444)', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : {}}
                    >
                      <div className="kanban-card-title">
                        {task.isBlocked && <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--danger, #ef4444)' }} />}
                        {task.title}
                      </div>
                      <div className="kanban-card-meta">
                        <span className="points-badge">{task.points} pts</span>
                      </div>
                      
                      <div className="kanban-card-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {/* Status Select - Disabled if blocked */}
                        <select
                          className="inline-select inline-select-sm"
                          value={task.status}
                          onChange={(e) => moveTask(task.id, e.target.value)}
                          disabled={task.isBlocked}
                          title={task.isBlocked ? "Cannot modify status of a blocked task" : "Change status"}
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                          ))}
                        </select>

                        {/* Assignee Select - Restricted to Admin/Project Manager */}
                        <select
                          className="inline-select inline-select-sm"
                          value={task.assigneeId || ''}
                          onChange={(e) => handleAssign(task.id, e.target.value)}
                          disabled={task.isBlocked || !canEditTeam}
                          title={!canEditTeam ? "Only Admins and Project Managers can assign tasks" : task.isBlocked ? "Cannot reassign a blocked task" : "Change Assignee"}
                          style={!canEditTeam ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                        >
                          <option value="">Unassigned</option>
                          {filteredUsers.map((u) => (
                            <option key={u.id} value={u.id}>{u.username}</option>
                          ))}
                        </select>

                        <div style={{ flex: 1 }}></div>

                        {/* Block Button - Disabled if already blocked */}
                        <button 
                          className="btn-ghost-sm" 
                          onClick={() => !task.isBlocked && setBlockingTask(task)} 
                          disabled={task.isBlocked}
                          title={task.isBlocked ? "Task is already blocked" : "Flag as blocked"}
                          style={task.isBlocked ? { color: 'var(--danger, #ef4444)', opacity: 0.6, cursor: 'not-allowed' } : {}}
                        >
                          <AlertTriangle size={14} />
                        </button>

                        {/* Delete Button */}
                        <button 
                          className="btn-ghost-sm" 
                          onClick={() => handleDelete(task.id)} 
                          title="Delete task"
                          style={{ color: 'var(--ink-soft)' }}
                        >
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
          users={filteredUsers}
          onClose={() => setShowCreate(false)}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev])
            setShowCreate(false)
          }}
          sprintId={sprintId}
        />
      )}

      {blockingTask && (
        <FlagBlockerModal
          task={blockingTask}
          sprintId={sprintId}
          onClose={() => setBlockingTask(null)}
          onFlagged={() => {
            setTasks(prev => prev.map(t => t.id === blockingTask.id ? { ...t, isBlocked: true } : t))
            setBlockingTask(null)
          }}
        />
      )}
    </div>
  )
}

function CreateTaskModal({ users, onClose, onCreated, sprintId }) {
  const [title, setTitle] = useState('')
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
        status: 'TODO'
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