import { useState } from 'react'
import type { AuthenticatedUser } from './services/authService'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import './App.css'

function App() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)

  return user ? (
    <DashboardPage user={user} onUpdateUser={setUser} />
  ) : (
    <LoginPage onLogin={setUser} />
  )
}

export default App
