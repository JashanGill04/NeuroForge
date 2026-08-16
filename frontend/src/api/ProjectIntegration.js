import client from './client'

export const projectIntegrationApi = {
  get: (projectId) => client.get(`/projects/${projectId}/integration`).then((r) => r.data),
  connect: (projectId, payload) => client.put(`/projects/${projectId}/integration`, payload).then((r) => r.data),
  regenerateSecret: (projectId) => client.post(`/projects/${projectId}/integration/regenerate-secret`).then((r) => r.data),
  disconnect: (projectId) => client.delete(`/projects/${projectId}/integration`)
}