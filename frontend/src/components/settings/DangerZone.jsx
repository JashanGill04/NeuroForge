import { AlertTriangle } from 'lucide-react'

export default function DangerZone({ project, confirmingDelete, setConfirmingDelete, deleting, onDelete }) {
  return (
    <div className="ps-danger-zone">
      <div className="ps-danger-header">
        <AlertTriangle size={15} />
        <span>Danger zone</span>
      </div>

      {!confirmingDelete ? (
        <div className="ps-danger-card">
          <div>
            <div className="list-item-title">Delete this project</div>
            <div className="list-item-sub">Removes the project and its association with sprints/milestones. This cannot be undone.</div>
          </div>
          <button className="btn-danger-ghost" onClick={() => setConfirmingDelete(true)}>
            Delete project
          </button>
        </div>
      ) : (
        <div className="ps-danger-card ps-danger-confirm">
          <div>
            <div className="list-item-title">Delete "{project.name}"?</div>
            <div className="list-item-sub">This is permanent — sprints, milestones, and tasks go with it.</div>
          </div>
          <div className="ps-danger-actions">
            <button className="btn-ghost-sm" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
              Cancel
            </button>
            <button className="ps-btn-danger" onClick={onDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, delete it'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
