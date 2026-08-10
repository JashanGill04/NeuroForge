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

  useEffect(() => {
    setLoading(true)
    Promise.all([pipelineService.getKpis(), pipelineService.getHistory()])
      .then(([k, b]) => {
        setKpis(k)
        setBuilds([...b].sort((a, c) => new Date(c.startedAt) - new Date(a.startedAt)))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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

  return {
    kpis, builds, loading, error, setError,
    selectedBuildId, setSelectedBuildId, buildDetails, loadingDetails
  }
}
