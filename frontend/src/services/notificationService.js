// ---------------------------------------------------------------------------
// NotificationService — wired to the real backend
// ---------------------------------------------------------------------------
import client from '../api/client'

export const notificationService = {
  getAll: () => client.get('/notifications').then((r) => r.data),
  markRead: (id) => client.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => client.put('/notifications/read-all').then((r) => r.data),
  delete: (id) => client.delete(`/notifications/${id}`).then((r) => r.data)
}
