import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useProjectSprints } from '../hooks/useProjectSprints'
import { taskService } from '../services/taskService'
import { blockerService } from '../services/blockerService'
import { usersApi } from '../api/users'
import { projectsApi } from '../api/projects'
import { milestonesApi } from '../api/milestones'
import SprintSelector from '../components/SprintSelector'
import { Alert, EmptyState } from '../components/ui'

export default function Analytics() {
  const {
    projects, sprints, projectId, setProjectId,
    loadingSprints, error: pickerError
  } = useProjectSprints()

  const [milestones, setMilestones] = useState([])
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('')
  const [stats, setStats] = useState(null)
  const [sprintHistory, setSprintHistory] = useState([])
  const [blockerStats, setBlockerStats] = useState({ open: 0, resolved: 0, avgAgeDays: 0 })
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [blockers, setBlockers] = useState([])
  const [projectTeam, setProjectTeam] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(() => {})
  }, [])

  // Fetch project team details & milestones using milestonesApi when projectId changes
  useEffect(() => {
    if (!projectId) {
      setProjectTeam(null)
      setMilestones([])
      setSelectedMilestoneId('')
      return
    }

    projectsApi.getById(projectId)
      .then((proj) => {
        if (proj.teamId) {
          setProjectTeam({ name: proj.teamName || 'Assigned Team', id: proj.teamId })
        } else if (proj.teamName) {
          setProjectTeam({ name: proj.teamName })
        }
      })
      .catch(() => setProjectTeam(null))

    milestonesApi.getByProject(projectId)
      .then(data => setMilestones(Array.isArray(data) ? data : []))
      .catch(() => setMilestones([]))

    setSelectedMilestoneId('')
  }, [projectId])

  useEffect(() => {
    if (!sprints || sprints.length === 0) {
      setStats(null)
      setTasks([])
      setBlockers([])
      setSprintHistory([])
      return
    }
    let mounted = true
    setLoading(true)

    const run = async () => {
      // Filter sprints dynamically based on selected milestone ID mapping
      const targetSprints = selectedMilestoneId
        ? sprints.filter(s => s.milestoneId === Number(selectedMilestoneId))
        : sprints

      let totalTasks = 0, totalPoints = 0, completedPointsTotal = 0
      let allTasks = []
      let allBlockers = []
      let history = []

      for (const sprint of targetSprints) {
        const sTasks = await taskService.getTasksForSprint(sprint.id)
        const sBlockers = await blockerService.getBlockersForSprint(sprint.id)

        allTasks = [...allTasks, ...sTasks]
        allBlockers = [...allBlockers, ...sBlockers]

        totalTasks += sTasks.length
        const sCommitted = sTasks.reduce((s, t) => s + (t.points || 0), 0)
        const sVelocity = sTasks.filter((t) => t.status === 'DONE').reduce((s, t) => s + (t.points || 0), 0)

        totalPoints += sCommitted
        completedPointsTotal += sVelocity

        history.push({
          sprint: sprint.goal || `Sprint ${sprint.id}`,
          committed: sCommitted,
          velocity: sVelocity
        })
      }

      if (!mounted) return

      const resolvedBlockers = allBlockers.filter((b) => b.resolved)
      const openBlockersList = allBlockers.filter((b) => !b.resolved)
      const now = Date.now()
      const avgAgeDays = openBlockersList.length
        ? Math.round(
            openBlockersList.reduce((sum, b) => sum + (now - new Date(b.raisedAt).getTime()), 0) /
              openBlockersList.length /
              86400000
          )
        : 0

      setTasks(allTasks)
      setBlockers(allBlockers)
      setSprintHistory(history)
      setBlockerStats({
        open: openBlockersList.length,
        resolved: resolvedBlockers.length,
        avgAgeDays
      })
      setStats({
        totalTasks,
        totalPoints,
        completedPoints: completedPointsTotal,
        sprintCount: targetSprints.length,
        overallProgress: totalPoints === 0 ? 0 : Math.round((completedPointsTotal / totalPoints) * 100)
      })
    }

    run().catch((err) => mounted && setError(err.message)).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [sprints, selectedMilestoneId])

  const projectTeamUsers = projectTeam
    ? users.filter(u => u.team?.name === projectTeam.name || u.teamId === projectTeam.id || u.teamName === projectTeam.name)
    : users

  const teamMemberWorkload = projectTeamUsers.map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id)
    const points = userTasks.reduce((sum, t) => sum + (t.points || 0), 0)
    return {
      ...user,
      assignedTasks: userTasks,
      taskCount: userTasks.length,
      points
    }
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics &amp; Project Overview</h1>
          <p className="page-subtitle">Cross-sprint project health and milestone tracking</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error || pickerError}</Alert>

      <div className="panel panel-tight" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
          <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>Project:</span>
          <select
            className="inline-select"
            value={projectId || ''}
            onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
            style={{ flex: 1 }}
          >
            <option value="">-- Choose Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
          <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>Milestone:</span>
          <select
            className="inline-select"
            value={selectedMilestoneId}
            onChange={(e) => setSelectedMilestoneId(e.target.value)}
            style={{ flex: 1 }}
            disabled={!projectId}
          >
            <option value="">All Milestones (Project View)</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>{m.title} (Target: {m.targetDate})</option>
            ))}
          </select>
        </label>
      </div>

      {!projectId ? (
        <EmptyState title="No project selected" subtitle="Choose a project above to inspect analytics." />
      ) : loading || !stats ? (
        <EmptyState title={loading ? 'Crunching numbers…' : 'No project data yet'} />
      ) : (
        <>
          <div className="panel" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>
                {selectedMilestoneId ? 'Selected Milestone Progress' : 'Overall Project Progress'}
              </h3>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-2)' }}>
                {stats.overallProgress}% Completed ({stats.completedPoints} / {stats.totalPoints} pts)
              </span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ width: `${stats.overallProgress}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Sprints tracked</div>
              <div className="stat-value">{stats.sprintCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total tasks</div>
              <div className="stat-value">{stats.totalTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total points committed</div>
              <div className="stat-value">{stats.totalPoints} pts</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Resolved / Total Blockers</div>
              <div className="stat-value">{blockerStats.resolved} / {blockerStats.open + blockerStats.resolved}</div>
            </div>
          </div>

          <div className="panel" style={{ padding: '20px', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Sprint Velocity &amp; Commitment Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sprintHistory} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="sprint" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis stroke="var(--chart-axis)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="committed" name="Committed Points" fill="var(--accent-soft)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="velocity" name="Sprint Velocity (Completed)" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel" style={{ padding: '20px', marginTop: '20px' }}>
            <div className="panel-header" style={{ marginBottom: '16px' }}>
              <h2>Team &amp; Assigned Tasks Overview</h2>
              <span className="page-subtitle-inline">
                Team: {projectTeam?.name || 'Unassigned Team'}
              </span>
            </div>

            {teamMemberWorkload.length === 0 ? (
              <EmptyState title="No members found in this project team" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {teamMemberWorkload.map((member) => (
                  <div key={member.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--ink)' }}>{member.username}</span>
                        <span className="badge" style={{ fontSize: '10px' }}>{member.role || 'Member'}</span>
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                        {member.taskCount} tasks assigned ({member.points} pts)
                      </span>
                    </div>

                    {member.assignedTasks.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {member.assignedTasks.map((t) => (
                          <span key={t.id} style={{ fontSize: '11.5px', background: 'var(--surface-2)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: '6px', color: 'var(--ink-soft)' }}>
                            {t.title} <strong style={{ color: 'var(--accent)' }}>({t.status})</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--ink-faint)', fontStyle: 'italic', marginTop: '4px' }}>
                        No tasks currently assigned.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}