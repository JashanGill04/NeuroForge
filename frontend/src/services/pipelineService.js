// ---------------------------------------------------------------------------
// PipelineService — wired to the real backend (Milestone 3)
// ---------------------------------------------------------------------------
//   GET /api/pipelines      -> PipelineResponse[]  (build history)
//   GET /api/pipelines/kpi  -> PipelineKpiDTO       (stat cards)
// Note: these endpoints return build history across ALL projects — the
// backend doesn't scope pipelines by project yet (Pipeline.project is
// optional and most seed rows don't set it). If per-project scoping is
// added later, pass projectId as a query param here.
// ---------------------------------------------------------------------------
import client from '../api/client'

export const pipelineService = {
  getHistory: () => client.get('/pipelines').then((r) => r.data),
  getKpis: () => client.get('/pipelines/kpi').then((r) => r.data)
}
