import { Alert, EmptyState } from '../../components/ui'
import { usePipelineDashboard } from '../../hooks/usePipelineDashboard'
import PipelineKpiStats from '../../components/pipeline/PipelineKpiStats'
import BuildsTable from '../../components/pipeline/BuildsTable'
import BuildDetailModal from '../../components/pipeline/BuildDetailModal'

export default function PipelineDashboard() {
  const {
    kpis, builds, loading, error, setError,
    selectedBuildId, setSelectedBuildId, buildDetails, loadingDetails
  } = usePipelineDashboard()

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
        />
      )}
    </div>
  )
}
