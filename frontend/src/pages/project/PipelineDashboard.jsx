import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { Alert, EmptyState } from '../../components/ui'
import { usePipelineDashboard } from '../../hooks/usePipelineDashboard'
import { useAuth } from '../../context/AuthContext'
import { canManage } from '../../utils/roles'
import PipelineKpiStats from '../../components/pipeline/PipelineKpiStats'
import BuildsTable from '../../components/pipeline/BuildsTable'
import BuildDetailModal from '../../components/pipeline/BuildDetailModal'

export default function PipelineDashboard() {

  const { project } = useOutletContext()
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const {
    kpis, builds, loading, error, setError,
    selectedBuildId, setSelectedBuildId, buildDetails, loadingDetails,
    triggering, rollingBack, triggerBuild, rollbackBuild
  } = usePipelineDashboard(project?.id)

  const [success, setSuccess] = useState('')

  const handleTrigger = async () => {
    setSuccess('')
    const ok = await triggerBuild(project.id)
    if (ok) setSuccess('Build triggered - it will appear here once GitHub Actions reports back.')
  }

  const handleRollback = async (pipelineId) => {
    setSuccess('')
    const ok = await rollbackBuild(pipelineId)
    if (ok) setSuccess('Rollback initiated - redeploying the last successful image.')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Pipeline &amp; Deployment Dashboard</h1>
          <p className="page-subtitle">
            CI/CD build history and deployment status across all projects.
          </p>
        </div>
        {canEdit && (
          <button
            className="btn-primary"
            onClick={handleTrigger}
            disabled={triggering || !project?.id}
            title={!project?.id ? 'Loading project...' : 'Dispatch a new CI/CD build for this project'}
          >
            <Rocket size={16} /> {triggering ? 'Triggering...' : 'Trigger build'}
          </button>
        )}
      </div>

      {error && <Alert onClose={() => setError('')}>{error}</Alert>}
      {/* Added the success toast/alert here */}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {loading || !kpis ? (
        <EmptyState title="Loading pipeline data…" />
      ) : (
        <>
          <PipelineKpiStats kpis={kpis} />

          <div className="panel">
            <div className="panel-header">
              <h2>Recent builds</h2>
            </div>
            <BuildsTable builds={builds} onSelectBuild={setSelectedBuildId} />
          </div>
        </>
      )}

      {selectedBuildId && (
        <BuildDetailModal
          buildId={selectedBuildId}
          buildDetails={buildDetails}
          loading={loadingDetails}
          onClose={() => setSelectedBuildId(null)}
          canEdit={canEdit}
          onRollback={handleRollback}
          rollingBack={rollingBack}
          projectId={project?.id}

        />
      )}
    </div>
  )
}