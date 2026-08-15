import { Globe } from 'lucide-react'
import { ENV_LABEL, ENVIRONMENTS, STATUS_BADGE, SLOT_BADGE } from './releaseConstants'

export default function EnvironmentHealthPanel({ envHealth, loading }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2><Globe size={16} /> Environment Health</h2>
      </div>

      {loading ? (
        <div className="empty-sub">Checking environments…</div>
      ) : (
        <div className="stat-grid">
          {ENVIRONMENTS.map((env) => {
            const release = envHealth[env]
            const statusBadge = release ? STATUS_BADGE[release.status] : null
            const slotBadge = release ? SLOT_BADGE[release.slot] : null
            return (
              <div className="stat-card" key={env}>
                <div className="stat-label">{ENV_LABEL[env]}</div>
                {release ? (
                  <>
                    <div className="stat-value stat-value-sm">{release.version}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {statusBadge && (
                        <span className={`badge ${statusBadge.cls}`}>
                          <statusBadge.Icon size={11} /> {statusBadge.label}
                        </span>
                      )}
                      {slotBadge && <span className={`badge ${slotBadge.cls}`}>{slotBadge.label}</span>}
                    </div>
                  </>
                ) : (
                  <div className="empty-sub" style={{ marginTop: 8 }}>No active release</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}