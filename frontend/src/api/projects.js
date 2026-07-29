import client from './client'

export const projectsApi = {
  getAll: () => client.get('/projects/getProject').then((r) => r.data),
  getById: (id) => client.get(`/projects/${id}`).then((r) => r.data),
  create: (payload) => client.post('/projects/create', payload).then((r) => r.data),
  assignTeam: (id, teamId) =>
    client.post(`/projects/${id}/assign-team`, null, { params: { teamId } }).then((r) => r.data),
  updateStatus: (id, status) =>
    client.patch(`/projects/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => client.delete(`/projects/${id}`)
}
