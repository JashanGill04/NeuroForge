import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

// 1. Import your Keycloak setup and AuthProvider
import keycloak from './lib/keyclock' 
import { AuthProvider } from './context/AuthContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
let initialized = false

// 2. Wrap the app render inside a function
function renderApp() {
  root.render(
    <React.StrictMode>
      {/* 3. Pass the keycloak instance into the AuthProvider here */}
      <AuthProvider keycloak={keycloak}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  )
}

// 4. Force Keycloak to initialize before React even loads
if (!initialized) {
  initialized = true

  keycloak
    .init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })
    .then(() => {
      // Once Keycloak is ready, render the React app
      renderApp()
    })
    .catch((err) => {
      console.error('Keycloak init failed', err)
      document.getElementById('root').innerHTML =
        '<h2>Could not connect to Keycloak.</h2>'
    })
}