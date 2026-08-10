import { useEffect, useState } from 'react'
import { taskService } from '../services/taskService'

export function useBoardTasks(sprintId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragTaskId, setDragTaskId] = useState(null)

  useEffect(() => {
    if (!sprintId) {
      setTasks([])
      return
    }
    let mounted = true
    setLoading(true)
    taskService
      .getTasksForSprint(sprintId)
      .then((data) => mounted && setTasks(data))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [sprintId])

  const applyUpdate = (updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))

  const moveTask = async (taskId, status) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task?.isBlocked) return
    try {
      applyUpdate(await taskService.updateStatus(sprintId, taskId, status))
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskService.deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDrop = (status) => (e) => {
    e.preventDefault()
    if (dragTaskId != null) {
      const task = tasks.find((t) => t.id === dragTaskId)
      if (task && !task.isBlocked) moveTask(dragTaskId, status)
    }
    setDragTaskId(null)
  }

  return {
    tasks, setTasks, loading, error, setError,
    applyUpdate, moveTask, deleteTask, handleDrop,
    dragTaskId, setDragTaskId
  }
}
