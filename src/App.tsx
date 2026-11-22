import { useState } from 'react'
import type { AuthenticatedUser } from './services/authService'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import './App.css'

const AUTH_STORAGE_KEY = 'insulog.authenticatedUser'

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (!value || typeof value !== 'object') return false

  const user = value as Record<string, unknown>
  return typeof user.id === 'number'
    && typeof user.username === 'string'
    && typeof user.email === 'string'
    && typeof user.tipo_usuario === 'string'
    && typeof user.token === 'string'
    && isTokenActive(user.token)
}

function isTokenActive(token: string): boolean {
  const payload = token.split('.')[1]
  if (!payload) return false

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=')
    const claims: unknown = JSON.parse(atob(paddedBase64))
    return Boolean(
      claims
      && typeof claims === 'object'
      && 'exp' in claims
      && typeof claims.exp === 'number'
      && claims.exp * 1000 > Date.now(),
    )
  } catch {
    return false
  }
}

function getStoredUser(): AuthenticatedUser | null {
  const storedValue = localStorage.getItem(AUTH_STORAGE_KEY)
    ?? sessionStorage.getItem(AUTH_STORAGE_KEY)
  if (!storedValue) return null

  try {
    const user: unknown = JSON.parse(storedValue)
    if (isAuthenticatedUser(user)) return user
  } catch {
    // Discard malformed session data and return to the login screen.
  }

  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  return null
}

function App() {
  const [user, setUser] = useState<AuthenticatedUser | null>(getStoredUser)

  function handleLogin(authenticatedUser: AuthenticatedUser, rememberMe: boolean) {
    const storage = rememberMe ? localStorage : sessionStorage
    const otherStorage = rememberMe ? sessionStorage : localStorage
    otherStorage.removeItem(AUTH_STORAGE_KEY)
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  return user ? (
    <DashboardPage user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  )
}

export default App
