import { useEffect, useState } from 'react'
import { pipelineService } from '../services/pipelineService'

export function usePipelineDashboard() {
  const [kpis, setKpis] = useState(null)
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedBuildId, setSelectedBuildId] = useState(null)
  const [buildDetails, setBuildDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  
  const [triggering, setTriggering] = useState(false)
  const [rollingBack, setRollingBack] = useState(false)

  // Standard function defined in the hook scope
  const loadDashboard = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [k, b] = await Promise.all([
        pipelineService.getKpis(),
        pipelineService.getHistory()
      ])
      setKpis(k)
      setBuilds([...b].sort((a, c) => new Date(c.startedAt) - new Date(a.startedAt)))
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Runs loadDashboard once when the component mounts
  useEffect(() => {
    loadDashboard()
  }, [])

  // Fetch build details when selectedBuildId changes
  useEffect(() => {
    if (!selectedBuildId) {
      setBuildDetails(null)
      return
    }
    setLoadingDetails(true)
    pipelineService.getDetail(selectedBuildId)
      .then(setBuildDetails)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingDetails(false))
  }, [selectedBuildId])

  // Lock background scroll while the modal is open
  useEffect(() => {
    if (!selectedBuildId) return
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [selectedBuildId])

  const triggerBuild = async (projectId) => {
    setError('')
    setTriggering(true)
    try {
      await pipelineService.triggerBuild(projectId)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setTriggering(false)
    }
  }

  const rollbackBuild = async (pipelineId) => {
    setError('')
    setRollingBack(true)
    try {
      await pipelineService.rollbackBuild(pipelineId)
      setSelectedBuildId(null)
      // Calls loadDashboard silently to refresh the table/KPIs after rollback
      await loadDashboard(true)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setRollingBack(false)
    }
  }

  return {
    kpis, builds, loading, error, setError,
    selectedBuildId, setSelectedBuildId, buildDetails, loadingDetails,
    triggering, rollingBack, triggerBuild, rollbackBuild
  }
}