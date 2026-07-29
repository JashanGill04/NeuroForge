import client from './client'

export const pipelinesApi = {
  getHistory: () => client.get('/pipelines').then((r) => r.data),
  getKpis: () => client.get('/pipelines/kpi').then((r) => r.data),
  sendWebhook: (payload) => client.post('/pipelines/webhook', payload).then((r) => r.data)
}