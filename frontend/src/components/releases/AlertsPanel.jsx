import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { EmptyState } from '../ui'
import { formatIST } from '../pipeline/pipelineConstants'

const SEVERITY_CLASS = { CRITICAL: 'badge-blocked', WARNING: 'badge-hold', INFO: 'badge-todo' }

export default function AlertsPanel({ alerts, loading }) {
  const active = alerts.filter((a) => a.status === 'ACTIVE')

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><AlertTriangle size={16} /> Active Alerts ({active.length})</h2>
      </div>
      {loading ? (
        <div className="empty-sub">Checking…</div>
      ) : active.length === 0 ? (
        <EmptyState title="No active alerts" subtitle="All monitored metrics are within thresholds." />
      ) : (
        <ul className="list">
          {active.map((a) => (
            <li key={a.id} className="list-item blocker-item">
              <div>
                <div className="list-item-title">
                  <span className={`badge ${SEVERITY_CLASS[a.severity]}`}>{a.severity}</span>{' '}
                  {a.message}
                </div>
                <div className="list-item-sub">
                  Triggered {formatIST(a.triggeredAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}