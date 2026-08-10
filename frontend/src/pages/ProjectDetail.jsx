import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { sprintsApi } from '../api/sprints'
import { milestonesApi } from '../api/milestones'
import { useAuth } from '../context/AuthContext'
import { Alert, StatusBadge } from '../components/ui'
import { canManage } from '../utils/roles'
import SprintsPanel from '../components/projectDetail/SprintsPanel'
import MilestonesPanel from '../components/projectDetail/MilestonesPanel'

export default function ProjectDetail() {
  const { id } = useParams()
  const { roles } = useAuth()

  const [project, setProject] = useState(null)
  const [sprints, setSprints] = useState([])
  const [milestones, setMilestones] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [sprintForm, setSprintForm] = useState({ name: '', goal: '', startDate: '', endDate: '', milestoneId: '' })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', targetDate: '' })
  const [savingSprint, setSavingSprint] = useState(false)
  const [savingMilestone, setSavingMilestone] = useState(false)

  const canEdit = canManage(roles?.[0])

  const load = async () => {
    setLoading(true)
    try {
      const [proj, sp, ms] = await Promise.all([
        projectsApi.getById(id),
        sprintsApi.getByProject(id),
        milestonesApi.getByProject(id)
      ])
      setProject(proj)
      setSprints(sp)
      setMilestones(ms)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleAddSprint = async (e) => {
    e.preventDefault()
    setError('')
    setSavingSprint(true)
    try {
      const sprint = await sprintsApi.create({
        name: sprintForm.name.trim(),
        goal: sprintForm.goal.trim(),
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        projectId: Number(id),
        milestoneId: sprintForm.milestoneId ? Number(sprintForm.milestoneId) : null
      })
      setSprints((prev) => [sprint, ...prev])
      setSprintForm({ name: '', goal: '', startDate: '', endDate: '', milestoneId: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingSprint(false)
    }
  }

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    setError('')
    setSavingMilestone(true)
    try {
      const milestone = await milestonesApi.create({
        title: milestoneForm.title.trim(),
        targetDate: milestoneForm.targetDate,
        projectId: Number(id)
      })
      setMilestones((prev) => [milestone, ...prev])
      setMilestoneForm({ title: '', targetDate: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingMilestone(false)
    }
  }

  if (loading) return <div className="page">Loading…</div>

  if (!project) {
    return (
      <div className="page">
        <Alert>{error || 'Project not found'}</Alert>
        <Link className="link" to="/projects">
          ← Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <Link className="link back-link" to="/projects">
        ← Back to projects
      </Link>

      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p className="page-subtitle">
            <StatusBadge status={project.status} /> · Team: {project.teamName} · Manager:{' '}
            {project.managerUsername || '—'} · Created {project.createdAt}
          </p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <div className="two-col">
        <SprintsPanel
          sprints={sprints}
          milestones={milestones}
          canEdit={canEdit}
          sprintForm={sprintForm}
          setSprintForm={setSprintForm}
          savingSprint={savingSprint}
          onAddSprint={handleAddSprint}
        />

        <MilestonesPanel
          milestones={milestones}
          canEdit={canEdit}
          milestoneForm={milestoneForm}
          setMilestoneForm={setMilestoneForm}
          savingMilestone={savingMilestone}
          onAddMilestone={handleAddMilestone}
        />
      </div>
    </div>
  )
}
