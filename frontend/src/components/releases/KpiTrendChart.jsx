import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { EmptyState } from '../ui'

export default function KpiTrendChart({ history }) {
  // toLocaleTimeString([]) uses whatever timezone the browser/OS is set
  // to — fine if every viewer is in IST, wrong the moment someone isn't.
  // Pinning timeZone explicitly means the axis always reads IST
  // regardless of who's looking at it, matching formatIST elsewhere.
  const data = history.map((h) => ({
    time: new Date(h.capturedAt).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    uptime: h.uptimePercent,
    successRate: h.pipelineSuccessRate
  }))

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Uptime & Pipeline Success — last 24h</h2>
      </div>
      {data.length === 0 ? (
        <EmptyState title="No history yet" subtitle="Snapshots are captured every 5 minutes." />
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="time" stroke="var(--chart-axis)" fontSize={12} />
              <YAxis stroke="var(--chart-axis)" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="uptime" name="Uptime %" stroke="var(--chart-committed)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="successRate" name="Pipeline Success %" stroke="var(--chart-completed)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}