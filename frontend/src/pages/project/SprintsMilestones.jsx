import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { sprintsApi } from '../../api/sprints'
import { milestonesApi } from '../../api/milestones'
import { useAuth } from '../../context/AuthContext'
import { Alert } from '../../components/ui'
import { canManage } from '../../utils/roles'
import SprintsPanel from '../../components/sprintsMilestones/SprintsPanel'
import MilestonesPanel from '../../components/sprintsMilestones/MilestonesPanel'

// ---------------------------------------------------------------------------
// Redesign notes:
// - Removed the separate "Viewing sprint" dropdown panel — the sprint list
//   below already lets you click a sprint to view it, so the dropdown was a
//   second control doing the same job. The active sprint is now just
//   highlighted in the list itself, with a small "Viewing" tag.
// - Both add-forms are collapsed behind a "+ New sprint" / "+ New milestone"
//   button instead of always being open. On a page whose main job is
//   *browsing* sprints and milestones, two multi-field forms sitting open by
//   default was the biggest source of clutter.
// - Replaced ad-hoc inline styles with a couple of small reusable classes
//   (sm-card, sm-card-header, sm-empty) so the two columns read the same way.
// - Sprints and Milestones panels each live in their own component under
//   components/sprintsMilestones/ so this page is just wiring + layout.
// ---------------------------------------------------------------------------
export default function SprintsMilestones() {
  const { project, sprints, milestones, sprintId, setSprintId, reloadSprints, reloadMilestones } = useOutletContext()
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const [error, setError] = useState('')
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '', startDate: '', endDate: '', milestoneId: '' })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', targetDate: '' })
  const [savingSprint, setSavingSprint] = useState(false)
  const [savingMilestone, setSavingMilestone] = useState(false)
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)

  const handleAddSprint = async (e) => {
    e.preventDefault()
    setError('')
    setSavingSprint(true)
    try {
      await sprintsApi.create({
        name: sprintForm.name.trim(),
        goal: sprintForm.goal.trim(),
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        projectId: Number(project.id),
        milestoneId: sprintForm.milestoneId ? Number(sprintForm.milestoneId) : null
      })
      await reloadSprints()
      setSprintForm({ name: '', goal: '', startDate: '', endDate: '', milestoneId: '' })
      setShowSprintForm(false)
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
      await milestonesApi.create({
        title: milestoneForm.title.trim(),
        targetDate: milestoneForm.targetDate,
        projectId: Number(project.id)
      })
      await reloadMilestones()
      setMilestoneForm({ title: '', targetDate: '' })
      setShowMilestoneForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingMilestone(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Sprints &amp; Milestones</h1>
          <p className="page-subtitle">Plan sprints and group them under milestones for {project?.name}.</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <div className="two-col">
        <SprintsPanel
          sprints={sprints}
          milestones={milestones}
          sprintId={sprintId}
          setSprintId={setSprintId}
          canEdit={canEdit}
          showSprintForm={showSprintForm}
          setShowSprintForm={setShowSprintForm}
          sprintForm={sprintForm}
          setSprintForm={setSprintForm}
          savingSprint={savingSprint}
          onAddSprint={handleAddSprint}
        />

        <MilestonesPanel
          milestones={milestones}
          canEdit={canEdit}
          showMilestoneForm={showMilestoneForm}
          setShowMilestoneForm={setShowMilestoneForm}
          milestoneForm={milestoneForm}
          setMilestoneForm={setMilestoneForm}
          savingMilestone={savingMilestone}
          onAddMilestone={handleAddMilestone}
        />
      </div>
    </div>
  )
}
