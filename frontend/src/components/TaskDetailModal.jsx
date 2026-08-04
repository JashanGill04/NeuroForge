import { useEffect, useState } from 'react'
import { X, MessageSquare } from 'lucide-react'
import { taskService } from '../services/taskService'
import { blockerService } from '../services/blockerService'
import { useAuth } from '../context/AuthContext'

const STATUS_LABEL = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }

export default function TaskDetailModal({ task, sprintId, sprintName, users, canEdit, onClose, onTaskChanged }) {
  const { username } = useAuth()

  const [descriptionDraft, setDescriptionDraft] = useState(task.description || '')
  const [savingDescription, setSavingDescription] = useState(false)
  const [descriptionSaved, setDescriptionSaved] = useState(true)
  const [commentDraft, setCommentDraft] = useState('')
  const [activity, setActivity] = useState([])
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const assignee = users.find((u) => u.id === task.assigneeId)
  const commentsList = task.comments || []

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

  const handleDescriptionChange = (e) => {
    setDescriptionDraft(e.target.value)
    setDescriptionSaved(false)
  }

  const saveDescription = async () => {
    if (descriptionDraft === (task.description || '')) {
      setDescriptionSaved(true)
      return
    }
    setSavingDescription(true)
    try {
      const updatedTask = await taskService.updateDescription(task.id, descriptionDraft)
      onTaskChanged(updatedTask)
      setDescriptionSaved(true)
    } catch (error) {
      console.error('Failed to save description:', error)
      alert('Failed to save description.')
    } finally {
      setSavingDescription(false)
    }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentDraft.trim()) return

    setIsSubmittingComment(true)

    const formattedComment = `${username || 'User'} - ${new Date().toLocaleString()}: ${commentDraft.trim()}`

    try {
      const updatedTask = await taskService.addComment(task.id, formattedComment)
      onTaskChanged(updatedTask)
      setCommentDraft('')
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment.')
    } finally {
      setIsSubmittingComment(false)
    }
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
                onChange={handleDescriptionChange}
                onBlur={saveDescription}
                placeholder="What needs to be done…"
                disabled={!canEdit}
              />
              <div className="task-detail-hint">
                {savingDescription
                  ? 'Saving…'
                  : descriptionSaved
                  ? 'Saved'
                  : 'Unsaved changes — click outside the box to save'}
              </div>
            </div>

            <div className="task-detail-section">
              <div className="task-detail-label">Comments ({commentsList.length})</div>
              <div className="task-comment-list">
                {commentsList.length === 0 && <div className="empty-sub">No comments yet.</div>}

                {commentsList.map((commentString, idx) => (
                  <div className="task-comment" key={idx}>
                    <div className="task-comment-text">{commentString}</div>
                  </div>
                ))}
              </div>

              <form className="task-comment-form" onSubmit={submitComment}>
                <MessageSquare size={15} className="task-comment-icon" />
                <input
                  placeholder="Add a comment…"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  disabled={isSubmittingComment}
                />
                <button type="submit" className="btn-ghost-sm" disabled={isSubmittingComment}>
                  {isSubmittingComment ? 'Posting...' : 'Post'}
                </button>
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