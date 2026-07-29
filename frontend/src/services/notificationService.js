// ---------------------------------------------------------------------------
// NotificationService — MOCK IMPLEMENTATION (Milestone 2)
// ---------------------------------------------------------------------------
// The Milestone 2 brief mentions notifying an assignee via Kafka when a task
// is created/updated (see Backend TaskService -> KafkaProducerService). The
// actual delivery mechanism (websocket push, polling a /api/notifications
// endpoint, etc.) hasn't been decided by the backend team yet, so this mock
// simply derives a short in-memory feed from task/blocker activity so the
// Notifications UI has something real to render. Swap the body of these
// functions for a real subscription/fetch once that decision is made.
// ---------------------------------------------------------------------------


import client from '../api/client'

export const notificationService = {
  getAll: () => client.get('/notifications').then((r) => r.data),

  markRead: (id) => client.put(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => client.put('/notifications/read-all').then((r) => r.data),

  delete: (id) => client.delete(`/notifications/${id}`).then((r) => r.data)
}



/*
Old Code

let seq = 1
let notifications = [
  { id: seq++, type: 'TASK_STATUS_UPDATED', message: 'Task "Implement REST endpoint" moved to In Progress', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: seq++, type: 'BLOCKER_RAISED', message: 'A blocker was raised on "Fix CORS issue"', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: seq++, type: 'TASK_ASSIGNED', message: 'You were assigned to "Write unit tests"', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
]

const LATENCY = 150
function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY))
}

export const notificationService = {
  getAll: () => delay([...notifications]),
  push: (type, message) => {
    notifications = [{ id: seq++, type, message, read: false, createdAt: new Date().toISOString() }, ...notifications]
    return delay(notifications[0])
  },
  markRead: (id) => {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    return delay(true)
  },
  markAllRead: () => {
    notifications = notifications.map((n) => ({ ...n, read: true }))
    return delay(true)
  }
}

*/
