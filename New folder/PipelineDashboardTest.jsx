import { useEffect, useState } from 'react'
import { pipelinesApi } from '../api/pipeline'
import { Alert, StatusBadge, EmptyState } from '../components/ui'

const POLL_INTERVAL_MS = 30000

export default function PipelineDashboard() {
  const [history, setHistory] = useState([])
  const [kpis, setKpis] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [h, k] = await Promise.all([pipelinesApi.getHistory(), pipelinesApi.getKpis()])
      setHistory(h)
      setKpis(k)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Picks up whatever Jenkins just reported without the user refreshing.
    const interval = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="page">Loading…</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>CI/CD Pipeline</h1>
          <p className="page-subtitle">Build and deployment history for NeuroForge Nexus</p>
        </div>
        <button onClick={load}>Refresh</button>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <KpiCard label="Total builds" value={kpis.totalBuilds} />
          <KpiCard label="Success rate" value={`${kpis.successRate.toFixed(1)}%`} />
          <KpiCard label="Avg deploy (min)" value={kpis.avgDeployTimeMinutes.toFixed(1)} />
          <KpiCard label="Builds today" value={kpis.buildsToday} />
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2>Recent runs</h2>
        </div>

        {history.length === 0 ? (
          <EmptyState title="No pipeline records yet" />
        ) : (
          <ul className="list">
            {history
              .slice()
              .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))
              .map((p) => (
                <li key={p.id} className="list-item">
                  <div>
                    <div className="list-item-title">
                      {p.branch} — <span style={{ fontWeight: 'normal', color: 'var(--ink-soft)' }}>{p.commitHash}</span>
                    </div>
                    <div className="list-item-sub">
                      {p.environment} · {p.duration}s · {p.finishedAt ? new Date(p.finishedAt).toLocaleString() : '—'}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value }) {
  return (
    <div className="panel" style={{ padding: '12px' }}>
      <div style={{ fontSize: '19px', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>{label}</div>
    </div>
  )
}