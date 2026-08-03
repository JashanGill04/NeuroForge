import client from './client'

export const analyticsApi = {
  getProjectOverview: (projectId) =>
    client.get(`/analytics/project/${projectId}/overview`).then((r) => r.data)
}
