// ---------------------------------------------------------------------------
// TaskService — wired to the real backend
// ---------------------------------------------------------------------------
import client from '../api/client'

export const taskService = {
  getTasksForSprint: (sprintId) =>
    client.get(`/tasks/sprint/${sprintId}`).then((r) => r.data),

  createTask: (sprintId, payload) =>
    client.post('/tasks/create', { ...payload, sprintId }).then((r) => r.data),

  updateStatus: (sprintId, taskId, status) =>
    client.patch(`/tasks/${taskId}/status`, null, { params: { status } }).then((r) => r.data),

  deleteTask: (taskId) => client.delete(`/tasks/${taskId}`).then((r) => r.data),

  assignUser: (sprintId, taskId, assigneeId) =>
    client.patch(`/tasks/${taskId}/assign/${assigneeId}`).then((r) => r.data),

  // FIXED: Adjusted to match backend endpoint "addComments" and forced plain-text header
  addComment: (taskId, comment) =>
    client.post(`/tasks/${taskId}/addComments`, comment, {
      headers: { 'Content-Type': 'text/plain' }
    }).then((r) => r.data),

  // NEW: description is a raw String @RequestBody on the backend too, same as addComment
  updateDescription: (taskId, description) =>
    client.patch(`/tasks/${taskId}/description`, description, {
      headers: { 'Content-Type': 'text/plain' }
    }).then((r) => r.data),

  // NEW: unscheduled tasks for a project — powers the real Backlog page
  getBacklog: (projectId) =>
    client.get(`/tasks/backlog/${projectId}`).then((r) => r.data),

  // NEW: moves a backlog task into a sprint — what "Add to sprint" calls
  scheduleIntoSprint: (taskId, sprintId) =>
    client.patch(`/tasks/${taskId}/schedule/${sprintId}`).then((r) => r.data),

  TASK_STATUSES: ['TODO', 'IN_PROGRESS', 'DONE']
}