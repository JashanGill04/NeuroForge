// ---------------------------------------------------------------------------
// releaseService — wired to the real backend (Milestone 4)
// ---------------------------------------------------------------------------
//   GET  /api/releases              -> ReleaseResponse[]   (release history)
//   GET  /api/releases/kpi          -> ReleaseKpiDTO        (stat cards)
//   GET  /api/releases/{id}         -> ReleaseDetailDTO     (release details)
//   GET  /api/releases/active/{env} -> Release               (live release for an env)
//   POST /api/releases              -> Release               (cut a release from a deployment)
//   POST /api/releases/{id}/rollback -> 200 text             (rolls back + reactivates prior)
// ---------------------------------------------------------------------------
import client from "../api/client";

export const releaseService = {
  getHistory: () => client.get("/releases").then((r) => r.data),
  getKpis: () => client.get("/releases/kpi").then((r) => r.data),
  getDetail: (id) => client.get(`/releases/${id}`).then((r) => r.data),
  getActive: (environment) =>
    client.get(`/releases/active/${environment}`).then((r) => r.data),
  createRelease: (deploymentId, approved = true) =>
    client
      .post("/releases", { deploymentId, approved })
      .then((r) => r.data),
  rollbackRelease: (releaseId) =>
    client.post(`/releases/${releaseId}/rollback`).then((r) => r.data),
};
