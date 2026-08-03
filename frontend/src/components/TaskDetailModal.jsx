import { useEffect, useState } from 'react'
import { X, MessageSquare } from 'lucide-react'
import { taskService } from '../services/taskService'
import { blockerService } from '../services/blockerService'
import { getTaskExtras, setTaskDescription, addTaskComment } from '../services/taskExtras'
import { useAuth } from '../context/AuthContext'

const STATUS_LABEL = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }

export default function TaskDetailModal({ task, sprintId, sprintName, users, canEdit, onClose, onTaskChanged }) {
  const { username } = useAuth()
  const [extras, setExtras] = useState(() => getTaskExtras(task.id))
  const [descriptionDraft, setDescriptionDraft] = useState(extras.description)
  const [commentDraft, setCommentDraft] = useState('')
  const [activity, setActivity] = useState([])

  const assignee = users.find((u) => u.id === task.assigneeId)

  useEffect(() => {
    let mounted = true
    const events = [{ label: 'Task created', tone: 'default' }]
    if (task.assigneeId) events.push({ label: `Assigned to ${assignee?.username || `user #${task.assigneeId}`}`, tone: 'default' })
    events.push({ label: `Status: ${STATUS_LABEL[task.status] || task.status}`, tone: 'default' })

    blockerService
      .getBlockersForSprint(sprintId)
      .then((blockers) => {
        if (!mounted) return
        const related = blockers.filter((b) => b.taskId === task.id)
        related.forEach((b) => {
          events.push({ label: `Flagged as blocked — ${b.reason}`, tone: 'danger' })
          if (b.resolved) events.push({ label: 'Blocker resolved', tone: 'success' })
        })
        setActivity(events)
      })
      .catch(() => setActivity(events))
    return () => {
      mounted = false
    }
  }, [task.id, task.assigneeId, task.status, sprintId])

  const saveDescription = () => {
    const entry = setTaskDescription(task.id, descriptionDraft)
    setExtras({ ...entry })
  }

  const submitComment = (e) => {
    e.preventDefault()
    if (!commentDraft.trim()) return
    addTaskComment(task.id, username || 'you', commentDraft.trim())
    setExtras({ ...getTaskExtras(task.id) })
    setCommentDraft('')
  }

  const changeStatus = async (status) => {
    const updated = await taskService.updateStatus(sprintId, task.id, status)
    onTaskChanged(updated)
  }

  const changeAssignee = async (assigneeId) => {
    const updated = await taskService.assignUser(sprintId, task.id, assigneeId || null)
    onTaskChanged(updated)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{task.title}</h3>
            {task.isBlocked && <span className="badge badge-blocked">Blocked</span>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body task-detail-body">
          <div className="task-detail-main">
            <div className="task-detail-section">
              <div className="task-detail-label">Description</div>
              <textarea
                className="task-detail-description"
                rows={4}
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={saveDescription}
                placeholder="What needs to be done…"
                disabled={!canEdit}
              />
              <div className="task-detail-hint">Stored in this browser session only — backend persistence coming soon.</div>
            </div>

            <div className="task-detail-section">
              <div className="task-detail-label">Comments ({extras.comments.length})</div>
              <div className="task-comment-list">
                {extras.comments.length === 0 && <div className="empty-sub">No comments yet.</div>}
                {extras.comments.map((c) => (
                  <div className="task-comment" key={c.id}>
                    <div className="task-comment-author">{c.author} <span className="task-comment-time">{new Date(c.createdAt).toLocaleString()}</span></div>
                    <div className="task-comment-text">{c.text}</div>
                  </div>
                ))}
              </div>
              <form className="task-comment-form" onSubmit={submitComment}>
                <MessageSquare size={15} className="task-comment-icon" />
                <input
                  placeholder="Add a comment…"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                />
                <button type="submit" className="btn-ghost-sm">Post</button>
              </form>
            </div>
          </div>

          <div className="task-detail-side">
            <div className="task-detail-field">
              <div className="task-detail-label">Status</div>
              <select className="inline-select" value={task.status} onChange={(e) => changeStatus(e.target.value)} disabled={task.isBlocked}>
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="task-detail-field">
              <div className="task-detail-label">Assignee</div>
              <select className="inline-select" value={task.assigneeId || ''} onChange={(e) => changeAssignee(e.target.value)} disabled={!canEdit || task.isBlocked}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
            <div className="task-detail-field">
              <div className="task-detail-label">Story points</div>
              <div className="task-detail-value">{task.points}</div>
            </div>
            <div className="task-detail-field">
              <div className="task-detail-label">Sprint</div>
              <div className="task-detail-value">{sprintName || '—'}</div>
            </div>

            <div className="task-detail-field">
              <div className="task-detail-label">Activity</div>
              <ul className="task-activity-list">
                {activity.map((a, i) => (
                  <li key={i} className={`task-activity-item task-activity-${a.tone}`}>{a.label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
