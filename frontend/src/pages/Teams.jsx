import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { teamsApi } from '../api/teams'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { Alert, EmptyState } from '../components/ui'
import { canManage, canDelete } from '../utils/roles'
import TeamCard from '../components/teams/TeamCard'
import CreateTeamModal from '../components/teams/CreateTeamModal'
import AddMemberModal from '../components/teams/AddMemberModal'

export default function Teams() {
  const { roles } = useAuth()

  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [addingToTeam, setAddingToTeam] = useState(null)
  const [search, setSearch] = useState('')

  const canEdit = canManage(roles?.[0])
  const canRemove = canDelete(roles?.[0])

  const load = async () => {
    setLoading(true)
    try {
      const [t, u] = await Promise.all([teamsApi.getAll(), usersApi.getAll()])
      setTeams(t)
      setUsers(u)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (team) => {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return
    setError('')
    try {
      await teamsApi.remove(team.id)
      setTeams((prev) => prev.filter((t) => t.id !== team.id))
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return teams
    return teams.filter((t) => {
      const nameMatch = t.name?.toLowerCase().includes(q)
      const memberMatch = t.memberUsernames?.some((name) => name.toLowerCase().includes(q))
      return nameMatch || memberMatch
    })
  }, [teams, search])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Teams</h1>
          <p className="page-subtitle">Organize people into teams and staff them on projects.</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New Team
          </button>
        )}
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search teams or members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!loading && (
          <span className="toolbar-result-count">{filteredTeams.length} of {teams.length}</span>
        )}
      </div>

      <div className="card-grid">
        {!loading && teams.length === 0 && (
          <EmptyState title="No teams yet" subtitle={canEdit ? 'Create your first team.' : ''} />
        )}
        {!loading && teams.length > 0 && filteredTeams.length === 0 && (
          <EmptyState title="No matching teams" subtitle="Try a different search term." />
        )}
        {filteredTeams.map((t) => (
          <TeamCard
            key={t.id}
            team={t}
            canEdit={canEdit}
            canRemove={canRemove}
            onDelete={handleDelete}
            onAddMember={setAddingToTeam}
          />
        ))}
      </div>

      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={(team) => {
            setTeams((prev) => [team, ...prev])
            setShowCreate(false)
          }}
        />
      )}

      {addingToTeam && (
        <AddMemberModal
          team={addingToTeam}
          users={users}
          onClose={() => setAddingToTeam(null)}
          onAdded={() => {
            setAddingToTeam(null)
            load()
          }}
        />
      )}
    </div>
  )
}
