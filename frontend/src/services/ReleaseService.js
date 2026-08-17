// ---------------------------------------------------------------------------
// ReleaseService — wired to the real backend (Milestone 4)
// ---------------------------------------------------------------------------
//   GET  /api/releases                  -> ReleaseResponse[]  (release history)
//   GET  /api/releases/kpi              -> ReleaseKpiDTO       (uptime/MTTR/etc)
//   GET  /api/releases/{id}             -> ReleaseDetailDTO    (release detail)
//   GET  /api/releases/active/{env}     -> Release             (live release per env)
//   POST /api/releases                  -> Release             (cut a new release)
//   POST /api/releases/{id}/rollback    -> 200 text            (rollback)
// ---------------------------------------------------------------------------
import client from '../api/client'

export const releaseService = {
  getHistory: (projectId) => client.get('/releases', { params: { projectId } }).then((r) => r.data),
  getKpis: (projectId) => client.get('/releases/kpi', { params: { projectId } }).then((r) => r.data),
  getDetail: (id) => client.get(`/releases/${id}`).then((r) => r.data),
  getActiveRelease: (projectId, environment) =>
    client.get(`/releases/active/${environment}`, { params: { projectId } }).then((r) => r.data),
  createRelease: (payload) => client.post('/releases', payload).then((r) => r.data),
  rollbackRelease: (id) => client.post(`/releases/${id}/rollback`).then((r) => r.data)
}