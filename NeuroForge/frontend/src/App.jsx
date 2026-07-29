import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Landing from './pages/Landing' // 1. Make sure to import this
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Teams from './pages/Teams'
import Users from './pages/Users'
import KanbanBoard from './pages/KanbanBoard'
import SprintProgress from './pages/SprintProgress'
import Blockers from './pages/Blockers'
import Notifications from './pages/Notifications'
import Analytics from './pages/Analytics'
import PipelineDashboardTest from './pages/PipelineDashboardTest'

export default function App() {
  return (
    <Routes>
      {/* 2. The public landing page */}
      <Route path="/" element={<Landing />} />

      {/* 3. Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/users" element={<Users />} />

          {/* Milestone 2 — mock-service-backed modules (see MILESTONE_2_REPORT.md) */}
          <Route path="/tasks" element={<KanbanBoard />} />
          <Route path="/sprint-progress" element={<SprintProgress />} />
          <Route path="/blockers" element={<Blockers />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/pipelinesdemo" element={<PipelineDashboardTest/>} />
        </Route>
      </Route>

      {/* 4. Catch-all: Redirect any unknown URL to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}