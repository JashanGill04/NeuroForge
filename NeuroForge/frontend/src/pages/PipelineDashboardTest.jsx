import { useEffect, useState } from 'react'
import { pipelinesApi } from '../api/pipeline'
import { Alert, StatusBadge, EmptyState } from '../components/ui'

const STATUS_OPTIONS = ['SUCCESS', 'FAILED', 'RUNNING', 'PENDING']
const ENV_OPTIONS = ['DEVELOPMENT', 'TESTING', 'STAGING', 'PRODUCTION']

export default function PipelineDashboardTest() {
  const [history, setHistory] = useState([])
  const [kpis, setKpis] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const [form, setForm] = useState({
    projectId: 1,
    status: 'SUCCESS',
    duration: 252,
    commitHash: 'a3f2c1d',
    branch: 'main',
    environment: 'STAGING',
    deploymentSuccess: true
  })

  const load = async () => {
    setLoading(true)
    try {
      const [h, k] = await Promise.all([pipelinesApi.getHistory(), pipelinesApi.getKpis()])
      setHistory(h)
      setKpis(k)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await pipelinesApi.sendWebhook({
        ...form,
        projectId: Number(form.projectId),
        duration: Number(form.duration)
      })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const randomize = () => {
    const statuses = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    setForm((f) => ({
      ...f,
      status,
      duration: Math.floor(120 + Math.random() * 300),
      commitHash: Math.random().toString(16).slice(2, 9),
      environment: ENV_OPTIONS[Math.floor(Math.random() * ENV_OPTIONS.length)],
      deploymentSuccess: status === 'SUCCESS'
    }))
  }

  if (loading) return <div className="page">Loading…</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Pipeline API Test Console</h1>
          <p className="page-subtitle">Milestone 3 — CI/CD pipeline testing</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <div className="two-col">
        {/* Form panel */}
        <div className="panel">
          <div className="panel-header">
            <h2>Send test build</h2>
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="number"
              placeholder="Project ID"
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
              required
              style={{ width: '100%' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select
                className="inline-select"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value, deploymentSuccess: e.target.value === 'SUCCESS' }))
                }
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <select
                className="inline-select"
                value={form.environment}
                onChange={(e) => setForm((f) => ({ ...f, environment: e.target.value }))}
              >
                {ENV_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                placeholder="Commit hash"
                value={form.commitHash}
                onChange={(e) => setForm((f) => ({ ...f, commitHash: e.target.value }))}
                required
              />
              <input
                placeholder="Branch"
                value={form.branch}
                onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
                required
              />
            </div>

            <input
              type="number"
              placeholder="Duration (seconds)"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              required
              style={{ width: '100%' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" type="submit" disabled={sending} style={{ flex: 1 }}>
                {sending ? 'Sending…' : 'Send test build'}
              </button>
              <button type="button" onClick={randomize} style={{ whiteSpace: 'nowrap' }}>
                Randomize
              </button>
            </div>
          </form>
        </div>

        {/* Results panel */}
        <div className="panel">
          <div className="panel-header">
            <h2>Pipeline history</h2>
            <button onClick={load}>Refresh</button>
          </div>

          {kpis && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <KpiCard label="Total builds" value={kpis.totalBuilds} />
              <KpiCard label="Success rate" value={`${kpis.successRate.toFixed(1)}%`} />
              <KpiCard label="Avg deploy (min)" value={kpis.avgDeployTimeMinutes.toFixed(1)} />
              <KpiCard label="Builds today" value={kpis.buildsToday} />
            </div>
          )}

          {history.length === 0 ? (
            <EmptyState title="No pipeline records yet" />
          ) : (
            <ul className="list">
              {history.map((p) => (
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