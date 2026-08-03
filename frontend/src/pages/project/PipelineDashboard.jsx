import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, GitCommitHorizontal, Clock, Loader2, CircleDashed } from 'lucide-react'
import { pipelineService } from '../../services/pipelineService'
import { Alert, EmptyState } from '../../components/ui'

const ENV_LABEL = { DEV: 'Dev', STAGING: 'Staging', PRODUCTION: 'Production' }

const STATUS_BADGE = {
  SUCCESS: { cls: 'badge-success', Icon: CheckCircle2, label: 'Pass' },
  FAILED: { cls: 'badge-blocked', Icon: XCircle, label: 'Fail' },
  RUNNING: { cls: 'badge-in_progress', Icon: Loader2, label: 'Running' },
  PENDING: { cls: 'badge-todo', Icon: CircleDashed, label: 'Pending' }
}

export default function PipelineDashboard() {
  const [kpis, setKpis] = useState(null)
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([pipelineService.getKpis(), pipelineService.getHistory()])
      .then(([k, b]) => {
        setKpis(k)
        // Most recent builds first
        setBuilds([...b].sort((a, c) => new Date(c.startedAt) - new Date(a.startedAt)))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Pipeline &amp; Deployment Dashboard</h1>
          <p className="page-subtitle">
            CI/CD build history and deployment status across all projects.
          </p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      {loading || !kpis ? (
        <EmptyState title="Loading pipeline data…" />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Build success rate</div>
              <div className="stat-value stat-value-success">{kpis.successRate.toFixed(1)}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total builds</div>
              <div className="stat-value">{kpis.totalBuilds.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg. deploy time</div>
              <div className="stat-value">{kpis.avgDeployTimeMinutes.toFixed(1)}<span className="stat-value-unit">min</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Builds today</div>
              <div className="stat-value">{kpis.buildsToday}</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Recent builds</h2>
            </div>
            {builds.length === 0 ? (
              <EmptyState title="No builds yet" />
            ) : (
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
                      <tr key={b.id}>
                        <td>
                          <span className={`badge ${badge.cls}`}><badge.Icon size={12} /> {badge.label}</span>
                        </td>
                        <td>{b.branch}</td>
                        <td className="pipeline-commit"><GitCommitHorizontal size={13} /> {b.commitHash}</td>
                        <td>{ENV_LABEL[b.environment] || b.environment || '—'}</td>
                        <td>
                          {b.finishedAt ? (
                            <><Clock size={12} className="pipeline-duration-icon" /> {Math.round(b.duration / 60)}m {b.duration % 60}s</>
                          ) : '—'}
                        </td>
                        <td>{new Date(b.startedAt).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
