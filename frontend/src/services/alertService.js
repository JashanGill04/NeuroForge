import client from '../api/client'

export const alertService = {
  getAlerts: () => client.get('/alerts').then((r) => r.data),
  getRules: () => client.get('/alerts/rules').then((r) => r.data),
  createRule: (payload) => client.post('/alerts/rules', payload).then((r) => r.data),
  updateRule: (id, payload) => client.put(`/alerts/rules/${id}`, payload).then((r) => r.data),
  deleteRule: (id) => client.delete(`/alerts/rules/${id}`)
}