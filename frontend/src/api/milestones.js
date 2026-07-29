import client from './client'

export const milestonesApi = {
  getByProject: (projectId) => client.get(`/milestones/project/${projectId}`).then((r) => r.data),
  create: (payload) => client.post('/milestones/create', payload).then((r) => r.data)
}