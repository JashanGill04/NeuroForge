import { useEffect, useState, useCallback } from 'react'
import { pipelineService } from '../services/pipelineService'

export function usePipelineDashboard() {
  const [kpis, setKpis] = useState(null)
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedBuildId, setSelectedBuildId] = useState(null)
  const [buildDetails, setBuildDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // NEW: separate loading flags for the trigger/rollback actions so the
  // buttons can show their own "in flight" state without blocking the rest
  // of the dashboard.
  const [triggering, setTriggering] = useState(false)
  const [rollingBack, setRollingBack] = useState(false)

  const loadDashboard = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    return Promise.all([pipelineService.getKpis(), pipelineService.getHistory()])
      .then(([k, b]) => {
        setKpis(k)
        setBuilds([...b].sort((a, c) => new Date(c.startedAt) - new Date(a.startedAt)))
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        if (!silent) setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

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

  // Lock background scroll while the modal is open so the page behind it
  // can't shift/scroll and cause the flicker when the scrollbar appears.
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

  // NEW: dispatches a fresh build for the given project. Returns true/false
  // so the page can show its own success message on top of this hook's
  // error handling.
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

  // NEW: rolls back a pipeline's deployment, closes the detail modal, and
  // silently refreshes the build list/KPIs so the new (rolled-back) status
  // shows up without a jarring full-page loading flash.
  const rollbackBuild = async (pipelineId) => {
    setError('')
    setRollingBack(true)
    try {
      await pipelineService.rollbackBuild(pipelineId)
      setSelectedBuildId(null)
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