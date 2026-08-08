// ---------------------------------------------------------------------------
// PipelineService — wired to the real backend (Milestone 3)
// ---------------------------------------------------------------------------
//   GET /api/pipelines      -> PipelineResponse[]  (build history)
//   GET /api/pipelines/kpi  -> PipelineKpiDTO       (stat cards)
//   GET /api/pipelines/{id} -> PipelineDetailDTO    (build details)
// Note: these endpoints return build history across ALL projects — the
// backend doesn't scope pipelines by project yet (Pipeline.project is
// optional and most seed rows don't set it). If per-project scoping is
// added later, pass projectId as a query param here.
// ---------------------------------------------------------------------------
import client from '../api/client'

export const pipelineService = {
  getHistory: () => client.get('/pipelines').then((r) => r.data),
  getKpis: () => client.get('/pipelines/kpi').then((r) => r.data),
  getDetail: (id) => client.get(`/pipelines/${id}`).then((r) => r.data),
  triggerBuild: (projectId) => client.post(`/pipelines/trigger/${projectId}`).then((r) => r.data),
  rollbackBuild: (pipelineId) => client.post(`/pipelines/${pipelineId}/rollback`).then((r) => r.data)
}