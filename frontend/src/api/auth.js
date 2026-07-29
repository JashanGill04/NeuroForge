import client from './client'

export const authApi = {
  login: (username, password) =>
    client.post('/auth/login', { username, password }).then((r) => r.data),

  register: ({ username, email, password, role }) =>
    client.post('/auth/register', { username, email, password, role }).then((r) => r.data)
}
