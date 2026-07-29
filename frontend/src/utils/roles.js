// Simple client-side RBAC helpers for Milestone 1.
// Real enforcement still happens (or will happen) server-side once
// Keycloak/JWT auth is wired in - this just keeps the UI honest and
// hides actions a given role shouldn't normally see.

export const ROLES = ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DEVOPS_ENGINEER']

export function canManage(role) {
  return role === 'ADMIN' || role === 'PROJECT_MANAGER'
}

export function canDelete(role) {
  return role === 'ADMIN'
}

export function roleLabel(role) {
  if (!role) return '—'
  return role
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}
