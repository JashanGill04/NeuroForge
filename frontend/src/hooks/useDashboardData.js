import { useEffect, useMemo, useState } from 'react'
import { projectsApi } from '../api/projects'
import { teamsApi } from '../api/teams'
import { usersApi } from '../api/users'
import { milestonesApi } from '../api/milestones'
import { sprintsApi } from '../api/sprints'
import { taskService } from '../services/taskService'
import { blockerService } from '../services/blockerService'

export function useDashboardData() {
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('ALL')
  const [milestones, setMilestones] = useState([])
  const [sprints, setSprints] = useState([])
  const [scopeStats, setScopeStats] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([projectsApi.getAll(), teamsApi.getAll(), usersApi.getAll()])
      .then(([p, t, u]) => {
        if (!mounted) return
        setProjects(p)
        setTeams(t)
        setUsers(u)
        if (p.length > 0) setSelectedProjectId(String(p[0].id))
      })
      .catch((err) => setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  // Load milestones + sprints for whichever project is selected in the picker
  useEffect(() => {
    if (!selectedProjectId) return
    let mounted = true
    setSelectedMilestoneId('ALL')
    Promise.all([
      milestonesApi.getByProject(selectedProjectId),
      sprintsApi.getByProject(selectedProjectId),
    ])
      .then(([m, s]) => {
        if (!mounted) return
        setMilestones(m)
        setSprints(s)
      })
      .catch((err) => setError(err.message))
    return () => { mounted = false }
  }, [selectedProjectId])

  // Aggregate tasks + blockers across whichever sprints fall in the current
  // project/milestone scope.
  useEffect(() => {
    const scopedSprints =
      selectedMilestoneId === 'ALL'
        ? sprints
        : sprints.filter((s) => String(s.milestoneId) === String(selectedMilestoneId))

    if (scopedSprints.length === 0) {
      setScopeStats({ sprintsTracked: 0, totalTasks: 0, totalPoints: 0, completedPoints: 0, resolvedBlockers: 0, totalBlockers: 0 })
      setAnalyticsLoading(false)
      return
    }

    let mounted = true
    setAnalyticsLoading(true)
    Promise.all(
      scopedSprints.map((s) =>
        Promise.all([
          taskService.getTasksForSprint(s.id).catch(() => []),
          blockerService.getBlockersForSprint(s.id).catch(() => []),
        ])
      )
    )
      .then((results) => {
        if (!mounted) return
        let totalTasks = 0, totalPoints = 0, completedPoints = 0, resolvedBlockers = 0, totalBlockers = 0
        results.forEach(([tasks, blockers]) => {
          totalTasks += tasks.length
          totalPoints += tasks.reduce((s, t) => s + (t.points || 0), 0)
          completedPoints += tasks.filter((t) => t.status === 'DONE').reduce((s, t) => s + (t.points || 0), 0)
          totalBlockers += blockers.length
          resolvedBlockers += blockers.filter((b) => b.resolved).length
        })
        setScopeStats({ sprintsTracked: scopedSprints.length, totalTasks, totalPoints, completedPoints, resolvedBlockers, totalBlockers })
      })
      .finally(() => mounted && setAnalyticsLoading(false))
    return () => { mounted = false }
  }, [sprints, selectedMilestoneId])

  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length
  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [projects]
  )

  const completionPct = useMemo(() => {
    if (!scopeStats || scopeStats.totalPoints === 0) return 0
    return Math.round((scopeStats.completedPoints / scopeStats.totalPoints) * 100)
  }, [scopeStats])

  return {
    projects, teams, users, error, setError, loading,
    activeCount, recentProjects,
    selectedProjectId, setSelectedProjectId,
    selectedMilestoneId, setSelectedMilestoneId,
    milestones, scopeStats, analyticsLoading, completionPct
  }
}
