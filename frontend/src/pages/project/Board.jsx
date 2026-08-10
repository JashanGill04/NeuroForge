import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { usersApi } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import { canManage } from '../../utils/roles'
import { Alert, EmptyState } from '../../components/ui'
import TaskDetailModal from '../../components/TaskDetailModal'
import BoardHeader from '../../components/board/BoardHeader'
import KanbanBoard from '../../components/board/KanbanBoard'
import CreateTaskModal from '../../components/board/CreateTaskModal'
import FlagBlockerModal from '../../components/board/FlagBlockerModal'
import { useBoardTasks } from '../../hooks/useBoardTasks'

export default function Board() {
  const { project, sprints, sprintId, setSprintId, selectedSprint } = useOutletContext()
  const { roles } = useAuth()
  const canEdit = canManage(roles?.[0])

  const [users, setUsers] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [blockingTask, setBlockingTask] = useState(null)
  const [openTask, setOpenTask] = useState(null)

  const {
    tasks, setTasks, loading, error, setError,
    applyUpdate, moveTask, deleteTask, handleDrop,
    setDragTaskId
  } = useBoardTasks(sprintId)

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(() => {})
  }, [])

  const teamUsers = project?.teamName
    ? users.filter((u) => u.team?.name === project.teamName || u.teamName === project.teamName)
    : users

  return (
    <div className="page">
      <BoardHeader
        selectedSprint={selectedSprint}
        sprints={sprints}
        sprintId={sprintId}
        setSprintId={setSprintId}
        canEdit={canEdit}
        onNewTask={() => setShowCreate(true)}
      />

      <Alert onClose={() => setError('')}>{error}</Alert>

      {!sprintId ? (
        <EmptyState title="No sprint selected" subtitle="Create a sprint under Sprints & Milestones first." />
      ) : (
        <KanbanBoard
          tasks={tasks}
          loading={loading}
          teamUsers={teamUsers}
          onDragStart={setDragTaskId}
          onDrop={handleDrop}
          onOpenTask={setOpenTask}
          onMoveTask={moveTask}
          onFlagBlocked={setBlockingTask}
          onDelete={deleteTask}
        />
      )}

      {showCreate && (
        <CreateTaskModal
          users={teamUsers}
          sprintId={sprintId}
          onClose={() => setShowCreate(false)}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev])
            setShowCreate(false)
          }}
        />
      )}

      {blockingTask && (
        <FlagBlockerModal
          task={blockingTask}
          sprintId={sprintId}
          onClose={() => setBlockingTask(null)}
          onFlagged={() => {
            setTasks((prev) => prev.map((t) => (t.id === blockingTask.id ? { ...t, isBlocked: true } : t)))
            setBlockingTask(null)
          }}
        />
      )}

      {openTask && (
        <TaskDetailModal
          task={tasks.find((t) => t.id === openTask.id) || openTask}
          sprintId={sprintId}
          sprintName={selectedSprint?.name}
          users={teamUsers}
          canEdit={canEdit}
          onClose={() => setOpenTask(null)}
          onTaskChanged={(updated) => {
            applyUpdate(updated)
            setOpenTask(updated)
          }}
        />
      )}
    </div>
  )
}
