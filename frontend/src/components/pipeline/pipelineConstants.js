import { CheckCircle2, XCircle, Loader2, CircleDashed } from 'lucide-react'

export const ENV_LABEL = { DEV: 'Dev', STAGING: 'Staging', PRODUCTION: 'Production' }

export const STATUS_BADGE = {
  SUCCESS: { cls: 'badge-success', Icon: CheckCircle2, label: 'Pass', dot: 'var(--success)' },
  FAILED: { cls: 'badge-blocked', Icon: XCircle, label: 'Fail', dot: 'var(--danger)' },
  RUNNING: { cls: 'badge-in_progress', Icon: Loader2, label: 'Running', dot: 'var(--hold)' },
  PENDING: { cls: 'badge-todo', Icon: CircleDashed, label: 'Pending', dot: 'var(--info)' }
}

// Backend timestamps come back without reliable timezone info (server runs in
// UTC inside Docker). Force everything through IST explicitly so the UI never
// depends on the browser's assumed timezone.
export function formatIST(dateStr) {
  if (!dateStr) return null
  const hasTzInfo = /Z$|[+-]\d{2}:\d{2}$/.test(dateStr)
  const iso = hasTzInfo ? dateStr : `${dateStr}Z`
  const parsed = new Date(iso)
  if (isNaN(parsed.getTime())) return dateStr
  return parsed.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
