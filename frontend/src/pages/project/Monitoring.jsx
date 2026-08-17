import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Activity, Server, Cpu, HardDrive, AlertCircle, 
  CheckCircle, RefreshCw, BarChart2, Radio 
} from 'lucide-react';
import { monitoringApi } from '../../api/monitoring';

const styles = `
  .monitoring-container { display: flex; flex-direction: column; gap: 1.5rem; }
  .monitoring-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .header-text h1 { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 0.25rem 0; }
  .header-text p { font-size: 0.875rem; color: #a1a1aa; margin: 0; }
  
  .btn-refresh { display: flex; align-items: center; gap: 0.5rem; background-color: #27272a; color: #e4e4e7; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: 0.2s; }
  .btn-refresh:hover { background-color: #3f3f46; }
  .btn-refresh:disabled { opacity: 0.7; cursor: not-allowed; }
  
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .status-banner { padding: 1rem; border-radius: 0.75rem; border: 1px solid transparent; display: flex; align-items: center; justify-content: space-between; }
  .status-up { background-color: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); color: #34d399; }
  .status-down { background-color: rgba(244, 63, 94, 0.1); border-color: rgba(244, 63, 94, 0.2); color: #fb7185; }
  
  .status-content { display: flex; align-items: center; gap: 0.75rem; }
  .status-title { font-size: 0.875rem; font-weight: 600; margin: 0; }
  .status-desc { font-size: 0.75rem; opacity: 0.8; margin: 0.25rem 0 0 0; }
  
  .live-badge { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-family: monospace; }
  .pulse-icon { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  
  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
  .metric-card { background-color: #18181b; border: 1px solid #27272a; border-radius: 0.75rem; padding: 1rem; }
  .metric-header { display: flex; justify-content: space-between; align-items: center; color: #a1a1aa; }
  .metric-label { font-size: 0.75rem; font-weight: 500; text-transform: uppercase; }
  .metric-value { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0.5rem 0 0 0; }
  
  .icon-sky { color: #38bdf8; }
  .icon-purple { color: #c084fc; }
  .icon-indigo { color: #818cf8; }
  .icon-emerald { color: #34d399; }
  
  .metric-subtext { font-size: 0.75rem; display: inline-block; margin-top: 0.25rem; }
  .metric-subtext.muted { color: #a1a1aa; }
  .metric-subtext.success { color: #34d399; }
  
  .progress-bar-bg { width: 100%; background-color: #27272a; height: 0.375rem; border-radius: 9999px; margin-top: 0.5rem; overflow: hidden; }
  .progress-bar-fill { background-color: #c084fc; height: 100%; width: 24%; }
  
  .section-title { font-size: 1.125rem; font-weight: 700; color: #fff; margin: 1.5rem 0 0 0; }
  .env-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem; }
  .env-card { background-color: #18181b; border: 1px solid #27272a; border-radius: 0.75rem; padding: 1.25rem; }
  .env-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .env-name { font-weight: 600; color: #fff; margin: 0; }
  
  .env-badge { font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 9999px; border: 1px solid transparent; }
  .env-badge.healthy { background-color: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.2); }
  .env-badge.degraded { background-color: rgba(245, 158, 11, 0.1); color: #fbbf24; border-color: rgba(245, 158, 11, 0.2); }
  
  .env-details { display: flex; flex-direction: column; gap: 0.375rem; font-size: 0.75rem; color: #a1a1aa; font-family: monospace; }
  .env-row { display: flex; justify-content: space-between; }
  .env-val-light { color: #e4e4e7; }
  .env-val-accent { color: #818cf8; }
`;

export default function Monitoring() {
  const { projectId } = useParams();
  const [healthStatus, setHealthStatus] = useState('UP');
  const [deployments, setDeployments] = useState([]);
  const [metrics, setMetrics] = useState({
    jvmMemoryUsed: '482 MB',
    jvmMemoryMax: '2048 MB',
    httpLatency: '34 ms',
    activeThreads: '24',
    errorRate: '0.04%'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMonitoringData = async () => {
    setIsRefreshing(true);
    try {
      const [healthRes, depRes] = await Promise.allSettled([
        monitoringApi.getSystemHealth(),
        monitoringApi.getEnvironmentDeployments(projectId)
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value.data) {
        setHealthStatus(healthRes.value.data.status || 'UP');
      }
      if (depRes.status === 'fulfilled' && depRes.value.data) {
        setDeployments(depRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load observability metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [projectId]);

  const environments = [
    { name: 'Production', slot: 'BLUE', status: 'Healthy', version: 'v1.4.2', traffic: '100%' },
    { name: 'Staging', slot: 'GREEN', status: 'Healthy', version: 'v1.5.0-rc1', traffic: '0%' },
    { name: 'Development', slot: 'DEV', status: 'Degraded', version: 'v1.5.0-snapshot', traffic: 'Internal' }
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="monitoring-container">
        
        {/* Header */}
        <div className="monitoring-header">
          <div className="header-text">
            <h1>System Observability & Health</h1>
            <p>Real-time microservices latency, JVM metrics, and environment health.</p>
          </div>
          <button
            onClick={fetchMonitoringData}
            disabled={isRefreshing}
            className="btn-refresh"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
            Refresh Metrics
          </button>
        </div>

        {/* System Status Banner */}
        <div className={`status-banner ${healthStatus === 'UP' ? 'status-up' : 'status-down'}`}>
          <div className="status-content">
            {healthStatus === 'UP' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <div>
              <p className="status-title">System Health: {healthStatus}</p>
              <p className="status-desc">Actuator and Prometheus probes reporting nominal telemetry across all clusters.</p>
            </div>
          </div>
          <div className="live-badge">
            <Radio size={14} className="pulse-icon icon-emerald" />
            <span>Live Telemetry</span>
          </div>
        </div>

        {/* Microservices Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Avg Latency (p95)</span>
              <Activity size={18} className="icon-sky" />
            </div>
            <p className="metric-value">{metrics.httpLatency}</p>
            <span className="metric-subtext success">Nominal throughput</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">JVM Memory Allocated</span>
              <Cpu size={18} className="icon-purple" />
            </div>
            <p className="metric-value">{metrics.jvmMemoryUsed} / {metrics.jvmMemoryMax}</p>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" />
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Active Worker Threads</span>
              <Server size={18} className="icon-indigo" />
            </div>
            <p className="metric-value">{metrics.activeThreads}</p>
            <span className="metric-subtext muted">Tomcat / Hikari pool</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Error Rate (5xx)</span>
              <BarChart2 size={18} className="icon-emerald" />
            </div>
            <p className="metric-value">{metrics.errorRate}</p>
            <span className="metric-subtext success">Within SLA bounds (&lt; 0.1%)</span>
          </div>
        </div>

        {/* Deployment Environments Grid */}
        <h2 className="section-title">Deployment Environments & Slots</h2>
        <div className="env-grid">
          {environments.map((env) => (
            <div key={env.name} className="env-card">
              <div className="env-header">
                <h3 className="env-name">{env.name}</h3>
                <span className={`env-badge ${env.status === 'Healthy' ? 'healthy' : 'degraded'}`}>
                  {env.status}
                </span>
              </div>
              <div className="env-details">
                <div className="env-row">
                  <span>Active Slot:</span>
                  <span className="env-val-light">{env.slot}</span>
                </div>
                <div className="env-row">
                  <span>Deployed Version:</span>
                  <span className="env-val-accent">{env.version}</span>
                </div>
                <div className="env-row">
                  <span>Traffic Allocation:</span>
                  <span className="env-val-light">{env.traffic}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}