import { Lock, Users, Activity, Hash } from 'lucide-react'

export default function ProjectOverviewCard({ project, status, currentTeamName }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Overview</h2>
      </div>
      <div className="ps-overview-row">
        <Activity size={14} className="ps-overview-icon" />
        <span className="ps-overview-label">Status</span>
        <span className="ps-overview-value">
          <span className="ps-status-pill" data-status={status}>{status.replaceAll('_', ' ')}</span>
        </span>
      </div>
      <div className="ps-overview-row">
        <Users size={14} className="ps-overview-icon" />
        <span className="ps-overview-label">Team</span>
        <span className="ps-overview-value">{currentTeamName}</span>
      </div>
      <div className="ps-overview-row">
        <Lock size={14} className="ps-overview-icon" />
        <span className="ps-overview-label">Manager</span>
        <span className="ps-overview-value">{project.managerUsername || '—'}</span>
      </div>
      {project.id != null && (
        <div className="ps-overview-row">
          <Hash size={14} className="ps-overview-icon" />
          <span className="ps-overview-label">Project ID</span>
          <span className="ps-overview-value">{project.id}</span>
        </div>
      )}
      {project.createdAt && (
        <div className="ps-overview-row">
          <span className="ps-overview-label">Created</span>
          <span className="ps-overview-value">{project.createdAt}</span>
        </div>
      )}
    </div>
  )
}
