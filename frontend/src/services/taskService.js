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

  TASK_STATUSES: ['TODO', 'IN_PROGRESS', 'DONE']
}
