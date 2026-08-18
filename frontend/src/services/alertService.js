import client from '../api/client'

export const alertService = {
  getAlerts: (projectId) => client.get('/alerts', { params: { projectId } }).then((r) => r.data),
  getRules: (projectId) => client.get('/alerts/rules', { params: { projectId } }).then((r) => r.data),
  createRule: (projectId, payload) => client.post('/alerts/rules', payload, { params: { projectId } }).then((r) => r.data),
  updateRule: (id, payload) => client.put(`/alerts/rules/${id}`, payload).then((r) => r.data),
  deleteRule: (id) => client.delete(`/alerts/rules/${id}`)
}