import { Box, Globe, Tag, HeartPulse, Cpu } from 'lucide-react'

export default function DeploymentStatusCard({ deployment }) {
  if (!deployment) return null

  return (
    <div>
      <h3 className="bd-section-title">
        <Box size={14} /> Post-Build Deployment Status
      </h3>
      <div className="panel bd-deploy-panel">
        <div className="bd-deploy-row">
          <span className="bd-deploy-label"><Globe size={14} /> Environment</span>
          <span className="badge badge-in_progress">{deployment.environment}</span>
        </div>
        <div className="bd-deploy-row">
          <span className="bd-deploy-label"><Tag size={14} /> Image Tag</span>
          <span className="bd-deploy-mono">{deployment.imageTag}</span>
        </div>
        <div className="bd-deploy-row">
          <span className="bd-deploy-label"><HeartPulse size={14} /> Container Health</span>
          <span className="badge badge-success">{deployment.podsRunning} / {deployment.podsTotal} Running</span>
        </div>
        <div className="bd-deploy-row bd-deploy-row-stacked">
          <span className="bd-deploy-label"><Cpu size={14} /> Resource Load</span>
          <div className="bd-resource-col">
            <div className="bd-resource-line">
              <span>CPU</span><span>{deployment.cpuPercent}%</span>
            </div>
            <div className="bd-resource-track">
              <div className="bd-resource-fill" style={{ width: `${Math.min(deployment.cpuPercent, 100)}%` }} />
            </div>
            <div className="bd-resource-line">
              <span>Mem</span><span>{deployment.memoryPercent}%</span>
            </div>
            <div className="bd-resource-track">
              <div className="bd-resource-fill" style={{ width: `${Math.min(deployment.memoryPercent, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
