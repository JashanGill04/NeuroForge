import React, { createContext, useContext, useEffect, useState } from "react";
import keycloak from "../lib/keyclock";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await keycloak.updateToken(30);
      } catch (err) {
        console.error("Token refresh failed:", err);
      }
    }, 15000);

    setReady(true);
    return () => clearInterval(interval);
  }, []);

  if (!ready) return null;

  const customRole = keycloak.tokenParsed?.app_role;
  let roles = [];
  if (customRole) {
    roles = Array.isArray(customRole) ? customRole : [customRole];
  } else {
    roles = keycloak.tokenParsed?.realm_access?.roles ?? [];
  }

  const value = {
    token: keycloak.token,
    username: keycloak.tokenParsed?.preferred_username,
    roles,
    hasRole: (...allowed) => allowed.some((r) => roles.includes(r)),
    logout: () => keycloak.logout({ redirectUri: window.location.origin }),
    
    // ADDED THESE TWO LINES FOR THE LANDING PAGE:
    isAuthenticated: !!keycloak.authenticated,
    login: () => keycloak.login(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}