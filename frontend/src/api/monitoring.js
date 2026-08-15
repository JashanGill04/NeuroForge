import client from './client';

export const monitoringApi = {
  getDeploymentAnalytics: (projectId) => client.get(`/analytics/projects/${projectId}/deployments`),
  getEnvironmentDeployments: (projectId) => client.get(`/projects/${projectId}/deployments`),
  getSystemHealth: () => client.get('/actuator/health'),
  getMetricOverview: (metricName) => client.get(`/actuator/metrics/${metricName}`),
};