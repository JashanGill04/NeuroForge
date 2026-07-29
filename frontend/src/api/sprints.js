import client from './client'

export const sprintsApi = {
  getByProject: (projectId) => client.get(`/sprints/project/${projectId}`).then((r) => r.data),
  create: (payload) => client.post('/sprints/plan', payload).then((r) => r.data)
}
