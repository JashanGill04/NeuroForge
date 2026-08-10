import { createPortal } from 'react-dom'
import { X, Loader2, FolderKanban, RotateCcw } from 'lucide-react'
import { STATUS_BADGE } from './pipelineConstants'
import BuildOverviewSection from './BuildOverviewSection'
import BuildStagesTimeline from './BuildStagesTimeline'
import TestMetricsCard from './TestMetricsCard'
import DeploymentStatusCard from './DeploymentStatusCard'

export default function BuildDetailModal({ buildId, buildDetails, loading, onClose, canEdit, onRollback, rollingBack }) {
  const canRollback = canEdit && !loading && buildDetails?.deployment?.rollbackEligible

  return createPortal(
    <div className="bd-modal-overlay">
      <div className="panel bd-modal">
        <div className="bd-header">
          <div className="bd-header-titles">
            <div className="bd-header-title-row">
              <span
                className="bd-status-dot"
                style={{ background: STATUS_BADGE[buildDetails?.status]?.dot || 'var(--info)' }}
              />
              <h2 className="bd-title">Build #{buildId} Details</h2>
            </div>
            <div className="bd-subtitle">
              <FolderKanban size={13} /> Project: {buildDetails?.projectName || 'NeuroForge Nexus'}
            </div>
          </div>
          
          {/* Explicit flex row styling applied here to fix the vertical stacking */}
          <div className="bd-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {canRollback && (
              <button
                className="btn-danger-ghost"
                onClick={() => onRollback(buildId)}
                disabled={rollingBack}
                title="Redeploy the previous successful image for this environment"
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
          {loading || !buildDetails ? (
            <div className="bd-loading">
              <Loader2 size={32} className="bd-loading-spinner" />
              <p>Fetching full pipeline data...</p>
            </div>
          ) : (
            <>
              <BuildOverviewSection buildDetails={buildDetails} />

              <div className="bd-columns">
                <BuildStagesTimeline stages={buildDetails.stages} />
                <div className="bd-side-col">
                  <TestMetricsCard tests={buildDetails.tests} />
                  <DeploymentStatusCard deployment={buildDetails.deployment} />
                </div>
              </div>
            </>
          )}
        </div>

        {buildDetails && (
          <div className="bd-footer">
            <span>Dashboard version 2.1</span>
            <span>System on {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN')}</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}