import client from '../api/client'

export const alertService = {
  getAlerts: (projectId) => client.get('/alerts', { params: { projectId } }).then((r) => r.data),
  getRules: (projectId) => client.get('/alerts/rules', { params: { projectId } }).then((r) => r.data),
  createRule: (projectId, payload) =>
    client.post('/alerts/rules', { ...payload, projectId }, { params: { projectId } }).then((r) => r.data),
  updateRule: (projectId, id, payload) =>
    client.put(`/alerts/rules/${id}`, { ...payload, projectId }, { params: { projectId } }).then((r) => r.data),
  deleteRule: (projectId, id) => client.delete(`/alerts/rules/${id}`, { params: { projectId } })
}