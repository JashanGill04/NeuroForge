// ---------------------------------------------------------------------------
// TaskService — MOCK IMPLEMENTATION (Milestone 2)
// ---------------------------------------------------------------------------
// Today:   UI -> taskService (this file) -> in-memory mock store
// Future:  UI -> taskService (real version) -> axios -> Spring Boot /api/tasks
//
// Every method here returns a Promise resolving to the same shape the real
// Spring endpoint will return (see mocks/mockStore.js header comment for the
// confirmed backend contract). Components import from this file only — when
// the real Task API is ready, replace the body of these functions with the
// `client.get/post/patch` calls (examples left commented below) and nothing
// else in the app needs to change.
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




/*
Old Code  

//import * as store from '../mocks/mockStore'

const LATENCY = 250

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY))
}


export const taskService = {
  getTasksForSprint: (sprintId) => delay(store.getTasksForSprint(sprintId)),
  // Real version:
  // getTasksForSprint: (sprintId) => client.get(`/tasks/sprint/${sprintId}`).then(r => r.data),

  createTask: (sprintId, payload) => delay(store.createTask(sprintId, payload)),
  // Real version:
  // createTask: (sprintId, payload) => client.post('/tasks/create', { ...payload, sprintId }).then(r => r.data),

  updateStatus: (sprintId, taskId, status) => delay(store.updateTaskStatus(sprintId, taskId, status)),
  // Real version:
  // updateStatus: (sprintId, taskId, status) =>
  //   client.patch(`/tasks/${taskId}/status`, null, { params: { status } }).then(r => r.data),

  assignUser: (sprintId, taskId, assigneeId) => delay(store.assignUserToTask(sprintId, taskId, assigneeId)),
  // Real version:
  // assignUser: (sprintId, taskId, assigneeId) =>
  //   client.patch(`/tasks/${taskId}/assign/${assigneeId}`).then(r => r.data),

  TASK_STATUSES: store.TASK_STATUSES
}

*/
