// ---------------------------------------------------------------------------
// BlockerService — wired to the real backend
// ---------------------------------------------------------------------------
import client from '../api/client'

export const blockerService = {
  getBlockersForSprint: (sprintId) =>
    client.get(`/sprints/${sprintId}/blockers`).then((r) => r.data),

  raiseBlocker: (sprintId, payload) =>
    client.post(`/sprints/${sprintId}/blockers`, payload).then((r) => r.data),

  resolveBlocker: (sprintId, blockerId) =>
    client.put(`/sprints/${sprintId}/blockers/${blockerId}/resolve`).then((r) => r.data)
}
