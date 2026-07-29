export function StatusBadge({ status }) {
  const cls =
    status === 'ACTIVE' ? 'badge badge-active' : status === 'ON_HOLD' ? 'badge badge-hold' : 'badge badge-done'
  const label = status === 'ON_HOLD' ? 'On Hold' : status === 'COMPLETED' ? 'Completed' : 'Active'
  return <span className={cls}>{label}</span>
}

export function Alert({ type = 'error', children, onClose }) {
  if (!children) return null
  return (
    <div className={`alert alert-${type}`}>
      <span>{children}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state">
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-sub">{subtitle}</div>}
    </div>
  )
}
