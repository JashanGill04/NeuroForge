import { NavLink, Outlet, useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ChevronLeft, KanbanSquare, ListTodo, CalendarRange,
  AlertTriangle, BarChart3, Settings, Rocket, Activity, Menu, X   // + Activity
} from 'lucide-react'
import { useProject } from '../hooks/useProject'
import { StatusBadge, EmptyState } from './ui'
import ThemeToggle from './ThemeToggle'

const projectNavItems = [
  { to: 'board', label: 'Board', Icon: KanbanSquare },
  { to: 'backlog', label: 'Backlog', Icon: ListTodo },
  { to: 'sprints', label: 'Sprints & Milestones', Icon: CalendarRange },
  { to: 'blockers', label: 'Blockers', Icon: AlertTriangle },
  { to: 'reports', label: 'Reports', Icon: BarChart3 },
  { to: 'settings', label: 'Settings', Icon: Settings },
]

const milestone3NavItems = [
  { to: 'pipeline', label: 'Pipeline & Deployments', Icon: Rocket }
]

// NEW — Milestone 4
const milestone4NavItems = [
  { to: 'releases', label: 'Releases & Monitoring', Icon: Activity }
]

export default function ProjectLayout() {
  const { projectId } = useParams()
  const projectCtx = useProject(projectId)
  const { project, sprints, sprintId, setSprintId, loading, error } = projectCtx
  const [sidebarOpen, setSidebarOpen] = useState(false)

{loading ? (
  <div className="empty-sub">Loading…</div>
) : !project ? (
  <EmptyState title="Project not found" subtitle={error} />
) : (
  <Outlet context={projectCtx} />
)}


  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar project-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="project-sidebar-top-row">
          <Link to="/projects" className="project-back-link" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft size={15} /> Projects
          </Link>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="project-sidebar-title">
          {loading ? (
            <div className="project-sidebar-name skeleton-text">Loading…</div>
          ) : project ? (
            <>
              <div className="project-sidebar-name">{project.name}</div>
              <div className="project-sidebar-sub">{project.teamName || 'No team'}</div>
            </>
          ) : (
            <div className="project-sidebar-name">Project</div>
          )}
        </div>

        <nav className="nav-list">
          {projectNavItems.map((item) => (
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

        <div className="nav-section-label">CI/CD</div>
        <nav className="nav-list">
          {milestone3NavItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <item.Icon size={17} className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* NEW */}
        <div className="nav-section-label">Release Mgmt</div>
        <nav className="nav-list">
          {milestone4NavItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <item.Icon size={17} className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      

      <div className="app-main-col">
        <header className="topbar project-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          {project && <StatusBadge status={project.status} />}
          <div className="topbar-spacer" />
          <ThemeToggle />
        </header>
        <main className="main-content">
          {!loading && !project ? (
            <EmptyState title="Project not found" subtitle={error} />
          ) : (
            <Outlet context={projectCtx} />
          )}
        </main>
      </div>
    </div>
  )
}