import client from './client'

export const usersApi = {
  getAll: () => client.get('/users').then((r) => r.data),

  // Send the role as a URL query parameter to match @RequestParam
  assignRole: (id, role) => 
    client.post(`/users/${id}/assignRole?role=${role}`).then((r) => r.data),

  // Send the teamId as a URL query parameter, or leave it off if "Unassigned"
  assignTeam: (id, teamId) => {
    const url = teamId 
      ? `/users/${id}/assignTeam?teamId=${teamId}` 
      : `/users/${id}/assignTeam`;
      
    return client.post(url).then((r) => r.data);
  }
}