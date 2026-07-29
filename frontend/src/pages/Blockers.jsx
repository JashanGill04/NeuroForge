import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useProjectSprints } from '../hooks/useProjectSprints'
import { blockerService } from '../services/blockerService'
import SprintSelector from '../components/SprintSelector'
import { Alert, EmptyState } from '../components/ui'

export default function Blockers() {
  const {
    projects, sprints, projectId, setProjectId, sprintId, setSprintId,
    loadingSprints, error: pickerError
  } = useProjectSprints()

  const [blockers, setBlockers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sprintId) {
      setBlockers([])
      return
    }
    let mounted = true
    setLoading(true)
    blockerService
      .getBlockersForSprint(sprintId)
      .then((data) => mounted && setBlockers(data))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [sprintId])

  const handleResolve = async (blocker) => {
    const updated = await blockerService.resolveBlocker(sprintId, blocker.id)
    setBlockers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
  }

  const open = blockers.filter((b) => !b.resolved)
  const resolved = blockers.filter((b) => b.resolved)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Blockers</h1>
          <p className="page-subtitle">
            Flag and resolve stuck work 
          </p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error || pickerError}</Alert>

      <div className="panel panel-tight">
        <SprintSelector
          projects={projects} projectId={projectId} setProjectId={setProjectId}
          sprints={sprints} sprintId={sprintId} setSprintId={setSprintId} loadingSprints={loadingSprints}
        />
      </div>

      {!sprintId ? (
        <EmptyState title="No sprint selected" subtitle="Create a project and sprint in Milestone 1 first." />
      ) : loading ? (
        <div className="empty-sub">Loading…</div>
      ) : (
        <>
          <div className="panel">
            <div className="panel-header">
              <h2>Open blockers ({open.length})</h2>
            </div>
            {open.length === 0 ? (
              <EmptyState title="Nothing blocked right now" subtitle="Flag a task from the Kanban board when work gets stuck." />
            ) : (
              <ul className="list">
                {open.map((b) => (
                  <li key={b.id} className="list-item blocker-item">
                    <div>
                      <div className="list-item-title"><AlertTriangle size={14} className="blocker-icon" /> {b.taskTitle}</div>
                      <div className="list-item-sub">{b.reason} · raised {new Date(b.raisedAt).toLocaleDateString()}</div>
                    </div>
                    <button className="btn-ghost-sm" onClick={() => handleResolve(b)}>
                      <CheckCircle2 size={14} /> Resolve
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {resolved.length > 0 && (
            <div className="panel">
              <div className="panel-header">
                <h2>Resolved ({resolved.length})</h2>
              </div>
              <ul className="list">
                {resolved.map((b) => (
                  <li key={b.id} className="list-item list-item-muted">
                    <div className="list-item-title">{b.taskTitle}</div>
                    <div className="list-item-sub">{b.reason}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
