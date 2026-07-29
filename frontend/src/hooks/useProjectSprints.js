import { useEffect, useState } from 'react'
import { projectsApi } from '../api/projects'
import { sprintsApi } from '../api/sprints'

// Shared across the Milestone 2 screens (Kanban, Sprint Progress, Blockers).
// Projects and Sprints come from the REAL Milestone 1 API — only the Tasks
// living "inside" a sprint are mocked. This keeps the new modules anchored to
// real data wherever real data already exists.
export function useProjectSprints() {
  const [projects, setProjects] = useState([])
  const [sprints, setSprints] = useState([])
  const [sprintName, setSprintName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [sprintId, setSprintId] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingSprints, setLoadingSprints] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    projectsApi
      .getAll()
      .then((data) => {
        setProjects(data)
        if (data.length > 0) setProjectId(String(data[0].id))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingProjects(false))
  }, [])

  useEffect(() => {
    if (!projectId) {
      setSprints([])
      setSprintId('')
      return
    }
    let mounted = true
    setLoadingSprints(true)
    sprintsApi
      .getByProject(projectId)
      .then((data) => {
        if (!mounted) return
        setSprints(data)
        setSprintId(data.length > 0 ? String(data[0].id) : '')
        setSprintName(data.length > 0 ? String(data[0].name) : '')
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoadingSprints(false))
    return () => {
      mounted = false
    }
  }, [projectId])

  const selectedProject = projects.find((p) => String(p.id) === String(projectId)) || null
  const selectedSprint = sprints.find((s) => String(s.id) === String(sprintId)) || null

  return {
    projects,
    sprints,
    projectId,
    setProjectId,
    sprintId,
    setSprintId,
    selectedProject,
    selectedSprint,
    loadingProjects,
    loadingSprints,
    error
  }
}
