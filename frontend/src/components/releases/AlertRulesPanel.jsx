import { useState } from 'react'
import { Plus, Trash2, Bell } from 'lucide-react'
import { alertService } from '../../services/alertService'
import { Alert, EmptyState } from '../ui'

const METRICS = [
  { value: 'UPTIME_PERCENT', label: 'Uptime %' },
  { value: 'MTTR_MINUTES', label: 'MTTR (minutes)' },
  { value: 'RELEASES_THIS_MONTH', label: 'Releases this month' },
  { value: 'ROLLED_BACK_RELEASES', label: 'Rolled back releases' },
  { value: 'PIPELINE_SUCCESS_RATE', label: 'Pipeline success rate %' },
  { value: 'AVG_DEPLOY_MINUTES', label: 'Avg deploy time (minutes)' }
]

const OPERATORS = [
  { value: 'GT', label: '>' },
  { value: 'LT', label: '<' },
  { value: 'GTE', label: '>=' },
  { value: 'LTE', label: '<=' }
]

const SEVERITIES = ['INFO', 'WARNING', 'CRITICAL']

export default function AlertRulesPanel({ rules, loading, onRulesChanged, canEdit, projectId }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ metric: 'UPTIME_PERCENT', operator: 'LT', thresholdValue: 100, severity: 'WARNING' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await alertService.createRule(projectId, { ...form, thresholdValue: Number(form.thresholdValue), enabled: true })
      setShowForm(false)
      onRulesChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert rule?')) return
    setError('')
    try {
      await alertService.deleteRule(projectId, id)
      onRulesChanged()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleEnabled = async (rule) => {
    setError('')
    try {
      await alertService.updateRule(projectId, rule.id, {
        metric: rule.metric,
        operator: rule.operator,
        thresholdValue: rule.thresholdValue,
        severity: rule.severity,
        enabled: !rule.enabled
      })
      onRulesChanged()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><Bell size={16} /> Alert Rules</h2>
        {canEdit && (
          <button className="btn-ghost-sm" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> {showForm ? 'Cancel' : 'New rule'}
          </button>
        )}
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      {showForm && (
        <form onSubmit={handleSubmit} className="modal-form" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select className="inline-select" value={form.metric} onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))} style={{ flex: '1 1 200px' }}>
              {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select className="inline-select" value={form.operator} onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))} style={{ width: 80 }}>
              {OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input
              type="number"
              step="any"
              value={form.thresholdValue}
              onChange={(e) => setForm((f) => ({ ...f, thresholdValue: e.target.value }))}
              style={{ width: 100 }}
              required
            />
            <select className="inline-select" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))} style={{ width: 120 }}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add rule'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="empty-sub">Loading rules…</div>
      ) : rules.length === 0 ? (
        <EmptyState title="No alert rules yet" subtitle="Add one above to start testing alerts." />
      ) : (
        <ul className="list">
          {rules.map((r) => (
            <li key={r.id} className="list-item">
              <div>
                <div className="list-item-title">
                  {METRICS.find((m) => m.value === r.metric)?.label || r.metric}{' '}
                  {OPERATORS.find((o) => o.value === r.operator)?.label || r.operator}{' '}
                  {r.thresholdValue}
                </div>
                <div className="list-item-sub">{r.severity} · {r.enabled ? 'Enabled' : 'Disabled'}</div>
              </div>
              {canEdit && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-ghost-sm" onClick={() => handleToggleEnabled(r)}>
                    {r.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn-ghost-sm" onClick={() => handleDelete(r.id)} title="Delete rule">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}