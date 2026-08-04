// src/components/ProjectLayout.jsx (or wherever this is located)
import { NavLink, Outlet, useParams, Link } from 'react-router-dom'
import {
  ChevronLeft, KanbanSquare, ListTodo, CalendarRange,
  AlertTriangle, BarChart3, Settings, Rocket
} from 'lucide-react'
import { useProject } from '../hooks/useProject'
import { StatusBadge, EmptyState } from './ui'

const projectNavItems = [
  { to: 'board', label: 'Board', Icon: KanbanSquare },
  { to: 'backlog', label: 'Backlog', Icon: ListTodo },
  { to: 'sprints', label: 'Sprints & Milestones', Icon: CalendarRange },
  { to: 'blockers', label: 'Blockers', Icon: AlertTriangle },
  { to: 'reports', label: 'Reports', Icon: BarChart3 },
  { to: 'settings', label: 'Settings', Icon: Settings }
]

const milestone3NavItems = [
  { to: 'pipeline', label: 'Pipeline & Deployments', Icon: Rocket }
]

export default function ProjectLayout() {
  const { projectId } = useParams()
  const projectCtx = useProject(projectId)
  // Ensure we still expose the context for the children
  const { project, sprints, sprintId, setSprintId, loading, error } = projectCtx

  return (
    <div className="app-shell">
      <aside className="sidebar project-sidebar">
        <Link to="/projects" className="project-back-link">
          <ChevronLeft size={15} /> Projects
        </Link>

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
      </aside>

      <div className="app-main-col">
        <header className="topbar project-topbar">
          {project && <StatusBadge status={project.status} />}
          {/* SPRINT DROPDOWN REMOVED FROM HERE */}
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