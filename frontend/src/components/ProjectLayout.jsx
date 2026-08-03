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

// Milestone 3 interfaces live ONLY in the project sidebar (per the revised
// UI restructure handoff, item 4) — never in the workspace-level sidebar.
const milestone3NavItems = [
  { to: 'pipeline', label: 'Pipeline & Deployments', Icon: Rocket }
]

export default function ProjectLayout() {
  const { projectId } = useParams()
  const projectCtx = useProject(projectId)
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

        <div className="nav-section-label">Milestone 3 · CI/CD</div>
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
          <div className="project-topbar-sprint">
            <span>Sprint</span>
            <select
              className="inline-select"
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
              disabled={sprints.length === 0}
            >
              {sprints.length === 0 && <option value="">No sprints yet</option>}
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ? `${s.name} — ${s.goal}` : s.goal}
                </option>
              ))}
            </select>
          </div>
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
