import client from './client'

export const teamsApi = {
  getAll: () => client.get('/teams').then((r) => r.data),
  getById: (id) => client.get(`/teams/${id}`).then((r) => r.data),
  create: (name) => client.post('/teams/create', { name }).then((r) => r.data),
  remove: (id) => client.delete(`/teams/${id}`)
}
