import { useEffect, useState, useCallback } from 'react'
import { projectsApi } from '../api/projects'
import { sprintsApi } from '../api/sprints'
import { milestonesApi } from '../api/milestones'

// Restructure principle #1 (Milestone 2 revision handoff): a project isn't
// re-picked on every page, AND a sprint isn't re-picked on every page either.
// ProjectLayout calls this once per project id, keeps the selected sprint in
// state, and every child page (Board, Sprints & Milestones, Blockers,
// Reports) reads/writes it via useOutletContext() instead of running its own
// SprintSelector + fetch.
export function useProject(projectId) {
  const [project, setProject] = useState(null)
  const [sprints, setSprints] = useState([])
  const [milestones, setMilestones] = useState([])
  const [sprintId, setSprintId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reloadSprints = useCallback(() => {
    if (!projectId) return Promise.resolve()
    return sprintsApi.getByProject(projectId).then((data) => {
      setSprints(data)
      setSprintId((current) => {
        if (current && data.some((s) => String(s.id) === String(current))) return current
        return data.length > 0 ? String(data[0].id) : ''
      })
      return data
    })
  }, [projectId])

  const reloadMilestones = useCallback(() => {
    if (!projectId) return Promise.resolve()
    return milestonesApi.getByProject(projectId).then((data) => {
      setMilestones(data)
      return data
    })
  }, [projectId])

  const reloadProject = useCallback(() => {
    if (!projectId) return Promise.resolve()
    return projectsApi.getById(projectId).then((data) => {
      setProject(data)
      return data
    })
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    let mounted = true
    setLoading(true)
    Promise.all([reloadProject(), reloadSprints(), reloadMilestones()])
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const selectedSprint = sprints.find((s) => String(s.id) === String(sprintId)) || null

  return {
    project,
    sprints,
    milestones,
    sprintId,
    setSprintId,
    selectedSprint,
    loading,
    error,
    setError,
    reloadProject,
    reloadSprints,
    reloadMilestones
  }
}
