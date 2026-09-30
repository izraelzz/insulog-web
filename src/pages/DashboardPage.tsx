import { useState } from 'react'
import {
  AlertTriangle,
  ChartNoAxesCombined,
  ClipboardList,
  History,
  LayoutDashboard,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react'
import type { AuthenticatedUser } from '../services/authService'
import PatientAlertsPage from './dashboard/PatientAlertsPage'
import DashboardHome from './dashboard/DashboardHome'
import DoctorProfilePage from './dashboard/DoctorProfilePage'
import PatientProfilePage from './dashboard/PatientProfilePage'
import PatientRecordsPage from './dashboard/PatientRecordsPage'
import PatientRegistrationPage from './dashboard/PatientRegistrationPage'
import PatientsPage from './dashboard/PatientsPage'
import './DashboardPage.css'

type Screen = 'dashboard' | 'cadastrar' | 'pacientes' | 'perfil' | 'registros' | 'alertas' | 'perfil-medico'

type DashboardPageProps = {
  user: AuthenticatedUser
  onUpdateUser: (updatedUser: AuthenticatedUser) => void
}

function DashboardPage({ user, onUpdateUser }: DashboardPageProps) {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard')
  const initials = user.username
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  function renderActiveScreen() {
    switch (activeScreen) {
      case 'cadastrar':
        return <PatientRegistrationPage />
      case 'pacientes':
        return <PatientsPage
          onAddPatient={() => setActiveScreen('cadastrar')}
          onOpenProfile={() => setActiveScreen('perfil')}
          onOpenRecords={() => setActiveScreen('registros')}
        />
      case 'perfil':
        return <PatientProfilePage
          onOpenRecords={() => setActiveScreen('registros')}
          onBackToPatients={() => setActiveScreen('pacientes')}
        />
      case 'registros':
        return <PatientRecordsPage onBackToProfile={() => setActiveScreen('perfil')} />
      case 'alertas':
        return <PatientAlertsPage onOpenProfile={() => setActiveScreen('perfil')} />
      case 'perfil-medico':
        return <DoctorProfilePage user={user} onSave={onUpdateUser} onCancel={() => setActiveScreen('dashboard')} />
      default:
        return <DashboardHome
          username={user.username}
          onOpenAlerts={() => setActiveScreen('alertas')}
          onOpenProfile={() => setActiveScreen('perfil')}
        />
    }
  }

  return (
    <main className="dashboard-page">
      <header className="portal-header">Insulog · Portal Médico</header>
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="brand"><span className="brand-mark">I</span><strong>Insulog</strong><small>Portal médico</small></div>
          <p className="nav-label">Visão geral</p>
          <nav aria-label="Navegação principal">
            <button className={`nav-item ${activeScreen === 'dashboard' ? 'active' : ''}`} type="button" onClick={() => setActiveScreen('dashboard')}><LayoutDashboard /> Dashboard</button>
            <button className={`nav-item ${activeScreen === 'alertas' ? 'active' : ''}`} type="button" onClick={() => setActiveScreen('alertas')}><AlertTriangle /> Alertas <b>4</b></button>
          </nav>
          <p className="nav-label">Pacientes</p>
          <nav aria-label="Navegação de pacientes">
            <button className={`nav-item ${activeScreen === 'pacientes' ? 'active' : ''}`} type="button" onClick={() => setActiveScreen('pacientes')}><Users /> Todos os pacientes</button>
            <button className={`nav-item ${activeScreen === 'cadastrar' ? 'active' : ''}`} type="button" onClick={() => setActiveScreen('cadastrar')}><UserPlus /> Cadastrar paciente</button>
            <button className={`nav-item ${activeScreen === 'perfil' ? 'active' : ''}`} type="button" onClick={() => setActiveScreen('perfil')}><UserRound /> Perfil do paciente</button>
            <button className={`nav-item ${activeScreen === 'registros' ? 'active' : ''}`} type="button" onClick={() => setActiveScreen('registros')}><ClipboardList /> Registros</button>
            <button className="nav-item" type="button"><History /> Histórico completo</button>
          </nav>
          <p className="nav-label">Análise</p>
          <nav aria-label="Navegação de análise"><button className="nav-item" type="button"><ChartNoAxesCombined /> Relatórios</button></nav>
          <button className="doctor-profile" type="button" onClick={() => setActiveScreen('perfil-medico')} aria-label="Abrir perfil do médico">
            <span className="doctor-avatar">{initials}</span><span><strong>{user.username}</strong><small>{user.email}</small></span>
          </button>
        </aside>
        <section className="dashboard-content">{renderActiveScreen()}</section>
      </div>
    </main>
  )
}

export default DashboardPage
