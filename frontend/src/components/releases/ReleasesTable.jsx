import { EmptyState } from '../ui'
import { ENV_LABEL, STATUS_BADGE, SLOT_BADGE } from './releaseConstants'
import { formatIST } from '../pipeline/pipelineConstants'

export default function ReleasesTable({ releases, onSelectRelease }) {
  if (releases.length === 0) {
    return <EmptyState title="No releases yet" subtitle="Cut a release from a successful deployment to see it here." />
  }

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Version</th>
            <th>Environment</th>
            <th>Status</th>
            <th>Slot</th>
            <th>Live</th>
            <th>Released</th>
          </tr>
        </thead>
        <tbody>
          {releases.map((r) => {
            const badge = STATUS_BADGE[r.status] || STATUS_BADGE.DRAFT
            const slot = SLOT_BADGE[r.slot]
            return (
              <tr key={r.id} onClick={() => onSelectRelease(r.id)} className="pipeline-row-clickable">
                <td>{r.version}</td>
                <td>{ENV_LABEL[r.environment] || r.environment || '—'}</td>
                <td>
                  <span className={`badge ${badge.cls}`}><badge.Icon size={12} /> {badge.label}</span>
                </td>
                <td>{slot ? <span className={`badge ${slot.cls}`}>{slot.label}</span> : '—'}</td>
                <td>{r.active ? <span className="badge badge-success">Live</span> : <span className="list-item-sub">—</span>}</td>
                <td>{formatIST(r.releaseDate)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}