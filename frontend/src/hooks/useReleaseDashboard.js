import { useEffect, useState } from 'react'
import { releaseService } from '../services/releaseService'

const ENVIRONMENTS = ['DEVELOPMENT', 'TESTING', 'STAGING', 'PRODUCTION']

export function useReleaseDashboard() {
  const [kpis, setKpis] = useState(null)
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [envHealth, setEnvHealth] = useState({})
  const [loadingEnv, setLoadingEnv] = useState(true)

  const [selectedReleaseId, setSelectedReleaseId] = useState(null)
  const [releaseDetails, setReleaseDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const [rollingBack, setRollingBack] = useState(false)

  const loadDashboard = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [k, r] = await Promise.all([releaseService.getKpis(), releaseService.getHistory()])
      setKpis(k)
      setReleases(r)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Environments with no active release yet (e.g. DEV/TESTING/STAGING before
  // any release has been cut there) 400 with "No active release..." — that's
  // an expected state, not a page-level error, so we swallow it per-env.
  const loadEnvHealth = async (silent = false) => {
    if (!silent) setLoadingEnv(true)
    const results = {}
    await Promise.all(
      ENVIRONMENTS.map(async (env) => {
        try {
          results[env] = await releaseService.getActiveRelease(env)
        } catch {
          results[env] = null
        }
      })
    )
    setEnvHealth(results)
    if (!silent) setLoadingEnv(false)
  }

  useEffect(() => {
    loadDashboard()
    loadEnvHealth()
  }, [])

  useEffect(() => {
    if (!selectedReleaseId) {
      setReleaseDetails(null)
      return
    }
    let mounted = true
    setLoadingDetails(true)
    releaseService
      .getDetail(selectedReleaseId)
      .then((data) => mounted && setReleaseDetails(data))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoadingDetails(false))
    return () => {
      mounted = false
    }
  }, [selectedReleaseId])

  // Lock background scroll while the detail modal is open
  useEffect(() => {
    if (!selectedReleaseId) return
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
  }, [selectedReleaseId])

  const rollbackRelease = async (releaseId) => {
    setError('')
    setRollingBack(true)
    try {
      await releaseService.rollbackRelease(releaseId)
      setSelectedReleaseId(null)
      await Promise.all([loadDashboard(true), loadEnvHealth(true)])
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setRollingBack(false)
    }
  }

  const refresh = () => Promise.all([loadDashboard(true), loadEnvHealth(true)])

  return {
    kpis, releases, loading, error, setError,
    envHealth, loadingEnv,
    selectedReleaseId, setSelectedReleaseId, releaseDetails, loadingDetails,
    rollingBack, rollbackRelease,
    refresh
  }
}