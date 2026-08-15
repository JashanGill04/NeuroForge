import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { Alert, EmptyState } from '../../components/ui'
import { useReleaseDashboard } from '../../hooks/useReleaseDashboard'
import { useAuth } from '../../context/AuthContext'
import { canManage } from '../../utils/roles'
import ReleaseKpiStats from '../../components/releases/ReleaseKpiStats'
import EnvironmentHealthPanel from '../../components/releases/EnvironmentHealthPanel'
import ReleasesTable from '../../components/releases/ReleasesTable'
import ReleaseDetailModal from '../../components/releases/ReleaseDetailModal'
import CreateReleaseModal from '../../components/releases/CreateReleaseModal'

export default function ReleasesMonitoring() {
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const {
    kpis, releases, loading, error, setError,
    envHealth, loadingEnv,
    selectedReleaseId, setSelectedReleaseId, releaseDetails, loadingDetails,
    rollingBack, rollbackRelease,
    refresh
  } = useReleaseDashboard()

  const [success, setSuccess] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const handleRollback = async (releaseId) => {
    setSuccess('')
    const ok = await rollbackRelease(releaseId)
    if (ok) setSuccess('Rollback initiated — the previous release is being redeployed.')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Release &amp; Deployment Monitoring</h1>
          <p className="page-subtitle">
            Blue-green releases, environment health, and rollback across every deployment target.
          </p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Rocket size={16} /> Cut release
          </button>
        )}
      </div>

      {error && <Alert onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {loading || !kpis ? (
        <EmptyState title="Loading release data…" />
      ) : (
        <>
          <ReleaseKpiStats kpis={kpis} />

          <EnvironmentHealthPanel envHealth={envHealth} loading={loadingEnv} />

          <div className="panel">
            <div className="panel-header">
              <h2>Release history</h2>
            </div>
            <ReleasesTable releases={releases} onSelectRelease={setSelectedReleaseId} />
          </div>
        </>
      )}

      {selectedReleaseId && (
        <ReleaseDetailModal
          releaseId={selectedReleaseId}
          releaseDetails={releaseDetails}
          loading={loadingDetails}
          onClose={() => setSelectedReleaseId(null)}
          canEdit={canEdit}
          onRollback={handleRollback}
          rollingBack={rollingBack}
        />
      )}

      {showCreate && (
        <CreateReleaseModal
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false)
            setSuccess('Release cut successfully.')
            await refresh()
          }}
        />
      )}
    </div>
  )
}