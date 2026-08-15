import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import ProjectLayout from './components/ProjectLayout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Teams from './pages/Teams'
import Users from './pages/Users'
import Notifications from './pages/Notifications'

// Project-scoped pages (Milestone 2 restructure + Milestone 3 addition) —
// nested under /projects/:projectId/* so a project is only ever picked once.
import Board from './pages/project/Board'
import Backlog from './pages/project/Backlog'
import SprintsMilestones from './pages/project/SprintsMilestones'
import Blockers from './pages/project/Blockers'
import Reports from './pages/project/Reports'
import Settings from './pages/project/Settings'
import PipelineDashboard from './pages/project/PipelineDashboard'
import ReleasesMonitoring from './pages/project/ReleasesMonitoring'  
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<ProtectedRoute />}>
        {/* Workspace-level shell */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/users" element={<Users />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Project-level shell — its own sidebar (Board, Backlog, Sprints &
            Milestones, Blockers, Reports, Settings, Pipeline & Deployments) */}
        <Route path="/projects/:projectId" element={<ProjectLayout />}>
          <Route index element={<Navigate to="board" replace />} />
          <Route path="board" element={<Board />} />
          <Route path="backlog" element={<Backlog />} />
          <Route path="sprints" element={<SprintsMilestones />} />
          <Route path="blockers" element={<Blockers />} />
          <Route path="reports" element={<Reports />} />
          // In App.jsx routes:

          <Route path="settings" element={<Settings />} />
          <Route path="pipeline" element={<PipelineDashboard />} />
          <Route path="releases" element={<ReleasesMonitoring />} />  
        </Route>
      </Route>
    

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
