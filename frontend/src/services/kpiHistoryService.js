import client from '../api/client'

export const kpiHistoryService = {
  getHistory: (hours = 24) => client.get('/kpi-history', { params: { hours } }).then((r) => r.data)
}