import { useState, useEffect, useCallback } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Rocket, Plus } from 'lucide-react'
import { Alert, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { canManage } from '../../utils/roles'
import { releaseService } from '../../services/releaseService'
import { ENVIRONMENTS } from '../../components/releases/releaseConstants'
import ReleaseKpiStats from '../../components/releases/ReleaseKpiStats'
import EnvironmentHealthPanel from '../../components/releases/EnvironmentHealthPanel'
import ReleasesTable from '../../components/releases/ReleasesTable'
import CreateReleaseModal from '../../components/releases/CreateReleaseModal'
import ReleaseDetailModal from '../../components/releases/ReleaseDetailModal'

export default function ReleasesMonitoring() {
  const { project } = useOutletContext()
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const [searchParams, setSearchParams] = useSearchParams()

  const [kpis, setKpis] = useState(null)
  const [releases, setReleases] = useState([])
  const [envHealth, setEnvHealth] = useState({})
  const [loading, setLoading] = useState(true)
  const [envLoading, setEnvLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [prefillDeploymentId, setPrefillDeploymentId] = useState(null)

  const [selectedReleaseId, setSelectedReleaseId] = useState(null)
  const [releaseDetails, setReleaseDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [rollingBack, setRollingBack] = useState(false)

  const fetchReleasesAndKpis = useCallback(async () => {
    try {
      setLoading(true)
      const [releaseList, kpiData] = await Promise.all([
        releaseService.getHistory(),
        releaseService.getKpis()
      ])
      setReleases(releaseList || [])
      setKpis(kpiData || null)
    } catch (err) {
      setError(err.message || 'Failed to load releases.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEnvHealth = useCallback(async () => {
    setEnvLoading(true)
    // No active release in an environment is a normal, expected state (not
    // an error) — ReleaseService.getActiveRelease throws when none exists,
    // so a failed call just means "nothing live there yet".
    const results = await Promise.allSettled(
      ENVIRONMENTS.map((env) => releaseService.getActiveRelease(env))
    )
    const next = {}
    ENVIRONMENTS.forEach((env, i) => {
      if (results[i].status === 'fulfilled' && results[i].value) {
        next[env] = results[i].value
      }
    })
    setEnvHealth(next)
    setEnvLoading(false)
  }, [])

  const refetchAll = useCallback(() => {
    fetchReleasesAndKpis()
    fetchEnvHealth()
  }, [fetchReleasesAndKpis, fetchEnvHealth])

  useEffect(() => {
    refetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Auto-open + pre-fill from DeploymentStatusCard's "Cut a release" link ---
  // Link shape: /projects/{id}/releases?deploymentId={id}
  useEffect(() => {
    const deploymentId = searchParams.get('deploymentId')
    if (deploymentId) {
      setPrefillDeploymentId(Number(deploymentId))
      setIsCreateModalOpen(true)
      // Strip the query param immediately so a refresh, a manual "Cut
      // release" click afterwards, or navigating back doesn't reopen the
      // modal with a stale/unintended deployment id pre-filled.
      const next = new URLSearchParams(searchParams)
      next.delete('deploymentId')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (!selectedReleaseId) {
      setReleaseDetails(null)
      return
    }
    let cancelled = false
    setLoadingDetails(true)
    releaseService.getDetail(selectedReleaseId)
      .then((data) => { if (!cancelled) setReleaseDetails(data) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load release details.') })
      .finally(() => { if (!cancelled) setLoadingDetails(false) })
    return () => { cancelled = true }
  }, [selectedReleaseId])

  const handleOpenCreateModal = () => {
    setPrefillDeploymentId(null)
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
    setPrefillDeploymentId(null)
  }

  const handleCreated = () => {
    setIsCreateModalOpen(false)
    setPrefillDeploymentId(null)
    setSuccess('Release cut successfully.')
    refetchAll()
  }

  const handleRollback = async (releaseId) => {
    setSuccess('')
    setRollingBack(true)
    try {
      await releaseService.rollback(releaseId)
      setSuccess('Rollback initiated — the previous release is being restored.')
      setSelectedReleaseId(null)
      refetchAll()
    } catch (err) {
      setError(err.message || 'Rollback failed.')
    } finally {
      setRollingBack(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Releases &amp; Monitoring</h1>
          <p className="page-subtitle">
            Blue-green releases, environment health, and rollback for {project?.name || 'this project'}.
          </p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Cut release
          </button>
        )}
      </div>

      {error && <Alert onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {loading || !kpis ? (
        <EmptyState title="Loading release data…" icon={Rocket} />
      ) : (
        <>
          <ReleaseKpiStats kpis={kpis} />

          <EnvironmentHealthPanel envHealth={envHealth} loading={envLoading} />

          <div className="panel">
            <div className="panel-header">
              <h2>Release history</h2>
            </div>
            <ReleasesTable releases={releases} onSelectRelease={setSelectedReleaseId} />
          </div>
        </>
      )}

      {isCreateModalOpen && (
        <CreateReleaseModal
          onClose={handleCloseCreateModal}
          onCreated={handleCreated}
          initialDeploymentId={prefillDeploymentId}
        />
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
    </div>
  )
}