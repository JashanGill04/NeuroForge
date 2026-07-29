import { useEffect, useState } from 'react'
import { usersApi } from '../api/users'
import { teamsApi } from '../api/teams'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/ui'
import { ROLES, roleLabel } from '../utils/roles'

export default function Users() {
  // 1. Destructure username and the hasRole helper from Keycloak
  const { username: currentUsername, hasRole } = useAuth()
  
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // 2. Cleanly check if the user is an admin using Keycloak's roles
  const isAdmin = hasRole('ADMIN')

  const load = async () => {
    setLoading(true)
    try {
      const [u, t] = await Promise.all([usersApi.getAll(), teamsApi.getAll()])
      setUsers(u)
      setTeams(t)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleRoleChange = async (u, role) => {
    setError('')
    try {
      const updated = await usersApi.assignRole(u.id, role)
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    } catch (err) {
      setError(err.message)
    }
  }

 const handleTeamChange = async (u, teamId) => {
    setError('');
    // 1. Optimistic Update: Update the UI immediately so it doesn't feel sluggish
    const originalUsers = [...users];
    
    // Create a new team object based on the selection
    const selectedTeam = teams.find(t => t.id === Number(teamId)) || null;
    
    setUsers((prev) => prev.map((x) => 
      x.id === u.id ? { ...x, team: selectedTeam } : x
    ));

    try {
      // 2. Server Sync: Actually call the backend
      const updated = await usersApi.assignTeam(u.id, teamId ? Number(teamId) : null);
      
      // 3. Reconciliation: Ensure our local state matches the DB exactly
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      // If it fails, revert to the original data
      setError("Failed to sync team. Reverting...");
      setUsers(originalUsers);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Manage roles and team assignments across the platform.' : 'Everyone registered on NeuroForge Nexus.'}
          </p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <div className="panel">
        {!loading && (
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {/* 3. Match by Keycloak username instead of DB ID */}
                    {u.username} {u.username === currentUsername && <span className="tag-you">you</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    {isAdmin ? (
                      <select
                        className="inline-select"
                        value={u.role || ''}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel(r)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      roleLabel(u.role)
                    )}
                  </td>
                  <td>
                    {isAdmin ? (
                      <select
                        className="inline-select"
                        value={u.teamId || ''}
                        onChange={(e) => handleTeamChange(u, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      u.teamName || '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}