import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/ui'
import { useDashboardData } from '../hooks/useDashboardData'
import WorkspaceStats from '../components/dashboard/WorkspaceStats'
import RecentProjectsPanel from '../components/dashboard/RecentProjectsPanel'
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel'

export default function Dashboard() {
  const { username, roles } = useAuth()
  const {
    projects, teams, users, error, setError, loading,
    activeCount, recentProjects,
    selectedProjectId, setSelectedProjectId,
    selectedMilestoneId, setSelectedMilestoneId,
    milestones, scopeStats, analyticsLoading, completionPct
  } = useDashboardData()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {username}</h1>
          <p className="page-subtitle">Here's what's happening across NeuroForge Nexus.</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <WorkspaceStats
        loading={loading}
        projects={projects}
        teams={teams}
        users={users}
        activeCount={activeCount}
        roles={roles}
      />

      <RecentProjectsPanel loading={loading} recentProjects={recentProjects} />

      <AnalyticsPanel
        loading={loading}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        selectedMilestoneId={selectedMilestoneId}
        setSelectedMilestoneId={setSelectedMilestoneId}
        milestones={milestones}
        scopeStats={scopeStats}
        analyticsLoading={analyticsLoading}
        completionPct={completionPct}
      />
    </div>
  )
}
