import { Settings, GitBranch, Calendar, Clock, User, GitCommitHorizontal } from 'lucide-react'
import { formatIST } from './pipelineConstants'

export default function BuildOverviewSection({ buildDetails }) {
  return (
    <>
      <div className="bd-overview-grid">
        <div className="bd-overview-card">
          <div className="bd-overview-top">
            <span className="bd-overview-label">Trigger</span>
            <Settings size={15} className="bd-overview-icon" />
          </div>
          <div className="bd-overview-value">{buildDetails.triggerSource || 'Manual'}</div>
        </div>
        <div className="bd-overview-card">
          <div className="bd-overview-top">
            <span className="bd-overview-label">Branch</span>
            <GitBranch size={15} className="bd-overview-icon" />
          </div>
          <div className="bd-overview-value">{buildDetails.branch}</div>
        </div>
        <div className="bd-overview-card">
          <div className="bd-overview-top">
            <span className="bd-overview-label">Started (IST)</span>
            <Calendar size={15} className="bd-overview-icon" />
          </div>
          <div className="bd-overview-value">{formatIST(buildDetails.startedAt) || '—'}</div>
        </div>
        <div className="bd-overview-card">
          <div className="bd-overview-top">
            <span className="bd-overview-label">Finished (IST)</span>
            <Clock size={15} className="bd-overview-icon" />
          </div>
          <div className="bd-overview-value">{formatIST(buildDetails.finishedAt) || 'In progress'}</div>
        </div>
      </div>

      <div className="bd-commit-card">
        <div className="bd-commit-avatar"><User size={16} /></div>
        <div className="bd-commit-body">
          <div className="bd-overview-label bd-commit-label">Commit Message</div>
          <div className="bd-commit-text">{buildDetails.commitMessage || '—'}</div>
        </div>
        {buildDetails.commitHash && (
          <span className="bd-hash-chip">
            <GitCommitHorizontal size={12} /> {buildDetails.commitHash.substring(0, 7)}
          </span>
        )}
      </div>
    </>
  )
}
