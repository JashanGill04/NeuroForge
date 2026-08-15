import { createPortal } from 'react-dom'
import { X, Loader2, RotateCcw, Tag, GitBranch, GitCommitHorizontal, Box, Cpu } from 'lucide-react'
import { STATUS_BADGE, SLOT_BADGE, ENV_LABEL } from './releaseConstants'
import { formatIST } from '../pipeline/pipelineConstants'

export default function ReleaseDetailModal({ releaseId, releaseDetails, loading, onClose, canEdit, onRollback, rollingBack }) {
  const canRollback = canEdit && !loading && releaseDetails?.active

  return createPortal(
    <div className="bd-modal-overlay">
      <div className="panel bd-modal">
        <div className="bd-header">
          <div className="bd-header-titles">
            <div className="bd-header-title-row">
              <span
                className="bd-status-dot"
                style={{ background: STATUS_BADGE[releaseDetails?.status]?.dot || 'var(--info)' }}
              />
              <h2 className="bd-title">Release {releaseDetails?.version || `#${releaseId}`}</h2>
            </div>
            <div className="bd-subtitle">
              {releaseDetails?.environment ? ENV_LABEL[releaseDetails.environment] || releaseDetails.environment : ''}
              {releaseDetails?.slot ? ` · ${SLOT_BADGE[releaseDetails.slot]?.label || releaseDetails.slot} slot` : ''}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {canRollback && (
              <button
                className="btn-danger-ghost"
                onClick={() => onRollback(releaseId)}
                disabled={rollingBack}
                title="Roll back to the previously active release in this environment"
              >
                <RotateCcw size={13} /> {rollingBack ? 'Rolling back…' : 'Rollback'}
              </button>
            )}
            <button onClick={onClose} className="bd-close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="bd-body">
          {loading || !releaseDetails ? (
            <div className="bd-loading">
              <Loader2 size={32} className="bd-loading-spinner" />
              <p>Fetching release details...</p>
            </div>
          ) : (
            <>
              <div className="bd-overview-grid">
                <div className="bd-overview-card">
                  <div className="bd-overview-top"><span className="bd-overview-label">Status</span></div>
                  <div className="bd-overview-value">{STATUS_BADGE[releaseDetails.status]?.label || releaseDetails.status}</div>
                </div>
                <div className="bd-overview-card">
                  <div className="bd-overview-top"><span className="bd-overview-label">Approved</span></div>
                  <div className="bd-overview-value">{releaseDetails.approved ? 'Yes' : 'No'}</div>
                </div>
                <div className="bd-overview-card">
                  <div className="bd-overview-top"><span className="bd-overview-label">Released</span></div>
                  <div className="bd-overview-value">{formatIST(releaseDetails.releaseDate) || '—'}</div>
                </div>
                <div className="bd-overview-card">
                  <div className="bd-overview-top"><span className="bd-overview-label">Live now</span></div>
                  <div className="bd-overview-value">{releaseDetails.active ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {releaseDetails.pipeline && (
                <div className="bd-commit-card">
                  <div className="bd-commit-avatar"><GitBranch size={16} /></div>
                  <div className="bd-commit-body">
                    <div className="bd-overview-label bd-commit-label">Commit</div>
                    <div className="bd-commit-text">{releaseDetails.pipeline.commitMessage || '—'}</div>
                  </div>
                  {releaseDetails.pipeline.commitHash && (
                    <span className="bd-hash-chip">
                      <GitCommitHorizontal size={12} /> {releaseDetails.pipeline.commitHash.substring(0, 7)}
                    </span>
                  )}
                </div>
              )}

              {releaseDetails.deployment && (
                <div>
                  <h3 className="bd-section-title"><Box size={14} /> Deployment</h3>
                  <div className="panel bd-deploy-panel">
                    <div className="bd-deploy-row">
                      <span className="bd-deploy-label"><Tag size={14} /> Image Tag</span>
                      <span className="bd-deploy-mono">{releaseDetails.deployment.imageTag || '—'}</span>
                    </div>
                    <div className="bd-deploy-row">
                      <span className="bd-deploy-label">Pods</span>
                      <span className="badge badge-success">
                        {releaseDetails.deployment.podsRunning} / {releaseDetails.deployment.podsTotal} Running
                      </span>
                    </div>
                    <div className="bd-deploy-row bd-deploy-row-stacked">
                      <span className="bd-deploy-label"><Cpu size={14} /> Resource Load</span>
                      <div className="bd-resource-col">
                        <div className="bd-resource-line"><span>CPU</span><span>{releaseDetails.deployment.cpuPercent}%</span></div>
                        <div className="bd-resource-track">
                          <div className="bd-resource-fill" style={{ width: `${Math.min(releaseDetails.deployment.cpuPercent, 100)}%` }} />
                        </div>
                        <div className="bd-resource-line"><span>Mem</span><span>{releaseDetails.deployment.memoryPercent}%</span></div>
                        <div className="bd-resource-track">
                          <div className="bd-resource-fill" style={{ width: `${Math.min(releaseDetails.deployment.memoryPercent, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}