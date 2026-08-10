import { GitCommitHorizontal, Clock } from 'lucide-react'
import { EmptyState } from '../ui'
import { ENV_LABEL, STATUS_BADGE, formatIST } from './pipelineConstants'

export default function BuildsTable({ builds, onSelectBuild }) {
  if (builds.length === 0) {
    return <EmptyState title="No builds yet" />
  }

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Branch</th>
            <th>Commit</th>
            <th>Environment</th>
            <th>Duration</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          {builds.map((b) => {
            const badge = STATUS_BADGE[b.status] || STATUS_BADGE.PENDING
            return (
              <tr key={b.id} onClick={() => onSelectBuild(b.id)} className="pipeline-row-clickable">
                <td>
                  <span className={`badge ${badge.cls}`}><badge.Icon size={12} /> {badge.label}</span>
                </td>
                <td>{b.branch}</td>
                <td className="pipeline-commit">
                  <span className="pipeline-commit-inner">
                    <GitCommitHorizontal size={13} /> {b.commitHash ? b.commitHash.substring(0, 7) : '—'}
                  </span>
                </td>
                <td>{ENV_LABEL[b.environment] || b.environment || '—'}</td>
                <td>
                  {b.finishedAt ? (
                    <span className="pipeline-duration">
                      <Clock size={12} className="pipeline-duration-icon" /> {Math.floor(b.duration / 60)}m {b.duration % 60}s
                    </span>
                  ) : '—'}
                </td>
                <td>{formatIST(b.startedAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
