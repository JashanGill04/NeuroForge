import { NavLink, Outlet, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutDashboard, FolderKanban, Users2, UserCircle, Bell, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { roleLabel } from '../utils/roles'
import { notificationService } from '../services/notificationService'
import ThemeToggle from './ThemeToggle'

// Workspace-level nav only. Project-level nav (Board, Backlog, Sprints &
// Milestones, Blockers, Reports, Settings, and Milestone 3's Pipeline &
// Deployments) lives in ProjectLayout.jsx instead — a project isn't
// re-picked on every page, per the Milestone 2 UI restructure handoff.
const workspaceItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', Icon: FolderKanban },
  { to: '/teams', label: 'Teams', Icon: Users2 },
  { to: '/users', label: 'Users', Icon: UserCircle }
]

export default function AppLayout() {
  const { username, roles, logout } = useAuth()
  const [unread, setUnread] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    notificationService.getAll().then((list) => setUnread(list.filter((n) => !n.read).length)).catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">NF</span>
          <div>
            <div className="brand-name">NeuroForge</div>
            <div className="brand-sub">Nexus · Enterprise</div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list">
          {workspaceItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <item.Icon size={17} className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{username?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <div className="user-name">{username}</div>
              <div className="user-role">{roleLabel(roles?.[0]) || roles?.[0]}</div>
            </div>
          </div>
          <button className="btn-ghost" onClick={logout}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      <div className="app-main-col">
        <header className="topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="topbar-spacer" />
          <ThemeToggle />
          <Link to="/notifications" className="topbar-bell" title="Notifications">
            <Bell size={18} />
            {unread > 0 && <span className="bell-badge">{unread > 9 ? '9+' : unread}</span>}
          </Link>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
