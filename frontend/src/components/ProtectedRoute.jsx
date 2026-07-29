import { Navigate, Outlet } from 'react-router-dom'
import keycloak from '../lib/keyclock'

export default function ProtectedRoute() {
  if (!keycloak.authenticated) {
    // If not authenticated, send them to Keycloak's login immediately 
    // OR send them to your PublicLanding page if you still have it.
    keycloak.login();
    return null; 
  }

  return <Outlet />
}