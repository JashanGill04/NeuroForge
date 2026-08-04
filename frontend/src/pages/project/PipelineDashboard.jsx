import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, GitCommitHorizontal, Clock, Loader2, CircleDashed, X, Box, TestTube2, Activity } from 'lucide-react'
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

  // Modal State
  const [selectedBuildId, setSelectedBuildId] = useState(null)
  const [buildDetails, setBuildDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([pipelineService.getKpis(), pipelineService.getHistory()])
      .then(([k, b]) => {
        setKpis(k)
        setBuilds([...b].sort((a, c) => new Date(c.startedAt) - new Date(a.startedAt)))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedBuildId) {
      setLoadingDetails(true)
      pipelineService.getDetail(selectedBuildId)
        .then(setBuildDetails)
        .catch(err => setError(err.message))
        .finally(() => setLoadingDetails(false))
    } else {
      setBuildDetails(null)
    }
  }, [selectedBuildId])

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

      {error && <Alert onClose={() => setError('')}>{error}</Alert>}

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
                      <tr 
                        key={b.id} 
                        onClick={() => setSelectedBuildId(b.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <span className={`badge ${badge.cls}`}><badge.Icon size={12} /> {badge.label}</span>
                        </td>
                        <td>{b.branch}</td>
                        <td className="pipeline-commit"><GitCommitHorizontal size={13} /> {b.commitHash ? b.commitHash.substring(0, 7) : '—'}</td>
                        <td>{ENV_LABEL[b.environment] || b.environment || '—'}</td>
                        <td>
                          {b.finishedAt ? (
                            <><Clock size={12} className="pipeline-duration-icon" /> {Math.floor(b.duration / 60)}m {b.duration % 60}s</>
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

      {/* Details Modal */}
      {selectedBuildId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="panel" style={{
            width: '100%', maxWidth: '900px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', margin: 0, overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            
            {/* Modal Header */}
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Build #{selectedBuildId} Details
              </h2>
              <button 
                onClick={() => setSelectedBuildId(null)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {loadingDetails || !buildDetails ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 size={32} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                  <p>Fetching full pipeline data...</p>
                </div>
              ) : (
                <>
                  {/* Overview Section */}
                  <div>
                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>
                      Overview
                    </h3>
                    <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 0 }}>
                      <div className="stat-card">
                        <div className="stat-label">Trigger</div>
                        <div className="stat-value" style={{ fontSize: '1.2rem' }}>{buildDetails.triggerSource || 'Manual'}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Branch</div>
                        <div className="stat-value" style={{ fontSize: '1.2rem' }}>{buildDetails.branch}</div>
                      </div>
                      <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                        <div className="stat-label">Commit Message</div>
                        <div className="stat-value" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={buildDetails.commitMessage}>
                          {buildDetails.commitMessage || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                    
                    {/* Stages Timeline */}
                    <div style={{ flex: '1 1 350px' }}>
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={14} /> Execution Stages
                      </h3>
                      <div className="panel" style={{ margin: 0 }}>
                        <table className="table" style={{ margin: 0 }}>
                          <tbody>
                            {buildDetails.stages?.map((stage, i) => {
                              const badge = STATUS_BADGE[stage.status] || STATUS_BADGE.PENDING;
                              return (
                                <tr key={i}>
                                  <td style={{ fontWeight: 500 }}>{stage.name}</td>
                                  <td>
                                    <Clock size={12} className="pipeline-duration-icon" /> {stage.durationSeconds}s
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className={`badge ${badge.cls}`}><badge.Icon size={12} /> {badge.label}</span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      
                      {/* Test Summary */}
                      {buildDetails.tests && (
                        <div>
                          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TestTube2 size={14} /> Test Results
                          </h3>
                          <div className="panel" style={{ margin: 0, padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '16px', marginBottom: '16px' }}>
                              <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }}>{buildDetails.tests.coveragePercent.toFixed(1)}%</div>
                                <div className="stat-label" style={{ marginTop: '4px' }}>Overall Coverage</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', textAlign: 'center' }}>
                              <div style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '6px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{buildDetails.tests.passed}</div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Passed</div>
                              </div>
                              <div style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{buildDetails.tests.failed}</div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Failed</div>
                              </div>
                              <div style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(128, 128, 128, 0.1)', borderRadius: '6px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{buildDetails.tests.skipped}</div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Skipped</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Deployment Info */}
                      {buildDetails.deployment && (
                        <div>
                          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Box size={14} /> Deployment Configuration
                          </h3>
                          <div className="panel" style={{ margin: 0 }}>
                            <table className="table" style={{ margin: 0 }}>
                              <tbody>
                                <tr>
                                  <td className="stat-label">Environment</td>
                                  <td><strong>{buildDetails.deployment.environment}</strong></td>
                                </tr>
                                <tr>
                                  <td className="stat-label">Image Tag</td>
                                  <td style={{ fontFamily: 'monospace', opacity: 0.8 }}>{buildDetails.deployment.imageTag}</td>
                                </tr>
                                <tr>
                                  <td className="stat-label">Container Health</td>
                                  <td>{buildDetails.deployment.podsRunning} / {buildDetails.deployment.podsTotal} Running</td>
                                </tr>
                                <tr>
                                  <td className="stat-label">Resource Load</td>
                                  <td>CPU: {buildDetails.deployment.cpuPercent}% | Mem: {buildDetails.deployment.memoryPercent}%</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}