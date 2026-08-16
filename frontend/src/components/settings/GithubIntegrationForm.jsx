import { useState, useEffect } from 'react'
import { Github, RefreshCw, Copy } from 'lucide-react'
import { projectIntegrationApi } from '../../api/ProjectIntegration'
import { Alert } from '../ui'

export default function GithubIntegrationForm({ projectId, canEdit }) {
  const [integration, setIntegration] = useState(null)
  const [notConnected, setNotConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    githubOwner: '', githubRepo: '', githubBranch: 'main',
    workflowFile: 'ci-cd.yml', githubToken: ''
  })

  const load = () => {
    setLoading(true)
    projectIntegrationApi.get(projectId)
      .then((data) => {
        setIntegration(data)
        setNotConnected(false)
        setForm((f) => ({
          ...f,
          githubOwner: data.githubOwner || '',
          githubRepo: data.githubRepo || '',
          githubBranch: data.githubBranch || 'main',
          workflowFile: data.workflowFile || 'ci-cd.yml'
        }))
      })
      .catch(() => setNotConnected(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [projectId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await projectIntegrationApi.connect(projectId, form)
      setSuccess('GitHub repository connected.')
      setForm((f) => ({ ...f, githubToken: '' }))
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateSecret = async () => {
    if (!window.confirm('Regenerating invalidates the old webhook secret — update it in your GitHub Actions secrets too.')) return
    try {
      await projectIntegrationApi.regenerateSecret(projectId)
      setSuccess('Webhook secret regenerated.')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(integration.webhookSecret)
    setSuccess('Webhook secret copied to clipboard.')
  }

  if (loading) return <div className="empty-sub">Loading GitHub connection…</div>

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><Github size={16} /> GitHub Repository</h2>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      {notConnected && (
        <p className="page-subtitle-inline" style={{ marginBottom: 16 }}>
          No repository connected yet — connect one below to enable build triggers and rollbacks for this project.
        </p>
      )}

      {canEdit ? (
        <form onSubmit={handleSubmit} className="modal-form">
          <div style={{ display: 'flex', gap: 10 }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Repo owner</span>
              <input
                value={form.githubOwner}
                onChange={(e) => setForm((f) => ({ ...f, githubOwner: e.target.value }))}
                placeholder="e.g. RajanGill04"
                required
              />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Repo name</span>
              <input
                value={form.githubRepo}
                onChange={(e) => setForm((f) => ({ ...f, githubRepo: e.target.value }))}
                placeholder="e.g. NeuroForge"
                required
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Branch</span>
              <input
                value={form.githubBranch}
                onChange={(e) => setForm((f) => ({ ...f, githubBranch: e.target.value }))}
              />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Workflow file</span>
              <input
                value={form.workflowFile}
                onChange={(e) => setForm((f) => ({ ...f, workflowFile: e.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            <span>Personal access token {integration?.tokenConfigured && '(leave blank to keep current token)'}</span>
            <input
              type="password"
              value={form.githubToken}
              onChange={(e) => setForm((f) => ({ ...f, githubToken: e.target.value }))}
              placeholder={integration?.tokenConfigured ? '••••••••••••' : 'ghp_...'}
              required={!integration?.tokenConfigured}
            />
          </label>

          <button className="btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? 'Saving…' : integration ? 'Update connection' : 'Connect repository'}
          </button>
        </form>
      ) : (
        <p className="empty-sub">Only Admins and Project Managers can manage this connection.</p>
      )}

      {integration && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
          <div className="field" style={{ marginBottom: 10 }}>
            <span>Webhook secret</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={integration.webhookSecret} readOnly style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
              <button type="button" className="btn-ghost-sm" onClick={copySecret} title="Copy">
                <Copy size={14} />
              </button>
              {canEdit && (
                <button type="button" className="btn-ghost-sm" onClick={handleRegenerateSecret} title="Regenerate">
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </div>
          <p className="page-subtitle-inline">
            Add this as the <code>WEBHOOK_SECRET</code> Actions secret in your repo, alongside your existing{' '}
            <code>CONTROLLER_URL</code>, so NeuroForge can verify builds are really coming from your workflow.
          </p>
        </div>
      )}
    </div>
  )
}