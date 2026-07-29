import { NavLink, Outlet, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, FolderKanban, Users2, UserCircle, Trello,
  TrendingUp, AlertTriangle, Bell, BarChart3, LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { roleLabel } from '../utils/roles'
import { notificationService } from '../services/notificationService'

const milestone1Items = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', Icon: FolderKanban },
  { to: '/teams', label: 'Teams', Icon: Users2 },
  { to: '/users', label: 'Users', Icon: UserCircle }
]

const milestone2Items = [
  { to: '/tasks', label: 'Task Manager', Icon: Trello },
  { to: '/sprint-progress', label: 'Sprint Progress', Icon: TrendingUp },
  { to: '/blockers', label: 'Blockers', Icon: AlertTriangle },
  { to: '/analytics', label: 'Analytics', Icon: BarChart3 }
]

export default function AppLayout() {
  const { username, roles, logout } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    notificationService.getAll().then((list) => setUnread(list.filter((n) => !n.read).length))
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">NF</span>
          <div>
            <div className="brand-name">NeuroForge</div>
            <div className="brand-sub">Nexus · Enterprise</div>
          </div>
        </div>

        <nav className="nav-list">
          {milestone1Items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <item.Icon size={17} className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-section-label">Agile &amp; Tracking</div>
        <nav className="nav-list">
          {milestone2Items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
          <button className="btn-ghost" onClick={handleLogout}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      <div className="app-main-col">
        <header className="topbar">
          <div />
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
