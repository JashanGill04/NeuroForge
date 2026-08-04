import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/ui'
import { ROLES, roleLabel } from '../utils/roles'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'DEVELOPER'
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">NF</span>
          <div className="auth-title">Create your account</div>
        </div>
        <p className="auth-subtitle">Join NeuroForge Nexus to start managing projects.</p>

        <Alert onClose={() => setError('')}>{error}</Alert>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Username</span>
            <input type="text" value={form.username} onChange={update('username')} required autoFocus />
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={update('email')} required />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={update('password')} required minLength={4} />
          </label>

          <label className="field">
            <span>Role</span>
            <select value={form.role} onChange={update('role')}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </label>

          <button className="btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
