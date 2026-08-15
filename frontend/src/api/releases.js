import client from './client';

export const releaseApi = {
  getProjectReleases: (projectId) => client.get(`/projects/${projectId}/releases`),
  getReleaseById: (releaseId) => client.get(`/releases/${releaseId}`),
  getReleaseKpis: (projectId) => client.get(`/projects/${projectId}/releases/kpis`),
  createRelease: (projectId, data) => client.post(`/projects/${projectId}/releases`, data),
  updateReleaseStatus: (releaseId, status) => client.patch(`/releases/${releaseId}/status`, { status }),
  deleteRelease: (releaseId) => client.delete(`/releases/${releaseId}`),
};