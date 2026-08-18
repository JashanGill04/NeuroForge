import client from '../api/client'

export const kpiHistoryService = {
  getHistory: (projectId, hours = 24) =>
    client.get('/kpi-history', { params: { projectId, hours } }).then((r) => r.data)
}