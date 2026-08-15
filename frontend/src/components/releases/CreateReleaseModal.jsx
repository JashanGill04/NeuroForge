import { useState, useEffect } from 'react'
import { releaseService } from '../../services/ReleaseService'
import { Alert, Modal } from '../ui'

export default function CreateReleaseModal({ onClose, onCreated, initialDeploymentId }) {
  const [deploymentId, setDeploymentId] = useState(initialDeploymentId ?? '')
  const [approved, setApproved] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // The modal is only ever mounted while it's open (ReleasesMonitoring renders
  // it conditionally), so the useState initializer above covers the normal
  // case. This effect just guards the edge case where the parent flips
  // initialDeploymentId while the modal is already mounted (e.g. clicking a
  // second "Cut a release" link without the modal fully unmounting first).
  useEffect(() => {
    if (initialDeploymentId != null) {
      setDeploymentId(String(initialDeploymentId))
    }
  }, [initialDeploymentId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const release = await releaseService.createRelease({
        deploymentId: Number(deploymentId),
        approved
      })
      onCreated(release)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Cut a new release" onClose={onClose}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field">
          <span>Deployment ID</span>
          <input
            type="number"
            min="1"
            value={deploymentId}
            onChange={(e) => setDeploymentId(e.target.value)}
            placeholder="e.g. 14"
            required
            autoFocus={initialDeploymentId == null}
          />
          {initialDeploymentId != null && (
            <span className="field-hint">Pre-filled from the deployment you opened this from.</span>
          )}
        </label>
        <label className="field field-inline">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
            style={{ width: 'auto' }}
          />
          <span>Approved for release</span>
        </label>
        <button className="btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Cutting release…' : 'Cut release'}
        </button>
      </form>
    </Modal>
  )
}