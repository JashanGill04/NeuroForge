import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react'

export const ENVIRONMENTS = ['DEVELOPMENT', 'TESTING', 'STAGING', 'PRODUCTION']

export const ENV_LABEL = {
  DEVELOPMENT: 'Development',
  TESTING: 'Testing',
  STAGING: 'Staging',
  PRODUCTION: 'Production'
}

export const STATUS_BADGE = {
  DEPLOYED: { cls: 'badge-success', Icon: CheckCircle2, label: 'Deployed', dot: 'var(--success)' },
  SUPERSEDED: { cls: 'badge-hold', Icon: Clock, label: 'Superseded', dot: 'var(--hold)' },
  ROLLED_BACK: { cls: 'badge-blocked', Icon: XCircle, label: 'Rolled back', dot: 'var(--danger)' },
  DRAFT: { cls: 'badge-todo', Icon: FileText, label: 'Draft', dot: 'var(--info)' }
}

export const SLOT_BADGE = {
  BLUE: { cls: 'badge-todo', label: 'Blue' },
  GREEN: { cls: 'badge-success', label: 'Green' }
}