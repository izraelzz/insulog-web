import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ChartNoAxesCombined,
  LayoutDashboard,
  UserRound,
  Users,
} from 'lucide-react'
import type { AuthenticatedUser } from '../services/authService'
import { fetchDoctorPatients, type DoctorPatient } from '../services/patientService'
import { formatPersonName } from '../utils/formatPersonName'
import PatientAlertsPage from './dashboard/PatientAlertsPage'
import DashboardHome from './dashboard/DashboardHome'
import DoctorProfilePage from './dashboard/DoctorProfilePage'
import PatientProfilePage from './dashboard/PatientProfilePage'
import PatientRecordsPage from './dashboard/PatientRecordsPage'
import PatientRegistrationPage from './dashboard/PatientRegistrationPage'
import PatientsPage from './dashboard/PatientsPage'
import ReportExportPage from './dashboard/ReportExportPage'
import './DashboardPage.css'

type Screen = 'dashboard' | 'cadastrar' | 'pacientes' | 'perfil' | 'registros' | 'alertas' | 'perfil-medico' | 'relatorios'

type DashboardPageProps = {
  user: AuthenticatedUser
  onUpdateUser: (updatedUser: AuthenticatedUser) => void
}

function DashboardPage({ user, onUpdateUser }: DashboardPageProps) {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard')
  const [patients, setPatients] = useState<DoctorPatient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientsError, setPatientsError] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const patientsRequestInProgress = useRef(false)
  const alertCount = patients.filter((patient) => patient.situacao !== 'adequado').length
  const initials = user.username
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const refreshPatients = useCallback(async (silent = false) => {
    if (patientsRequestInProgress.current) return
    patientsRequestInProgress.current = true

    if (!silent) {
      setPatientsLoading(true)
      setPatientsError('')
    }

    try {
      setPatients(await fetchDoctorPatients(user.token))
      setPatientsError('')
    } catch (error) {
      if (!silent) {
        setPatientsError(error instanceof Error ? error.message : 'Não foi possível carregar os pacientes.')
      }
    } finally {
      patientsRequestInProgress.current = false
      if (!silent) setPatientsLoading(false)
    }
  }, [user.token])

  useEffect(() => {
    let isCurrent = true

    fetchDoctorPatients(user.token)
      .then((result) => {
        if (isCurrent) {
          setPatients(result)
          setPatientsError('')
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setPatientsError(error instanceof Error ? error.message : 'Não foi possível carregar os pacientes.')
        }
      })
      .finally(() => {
        if (isCurrent) setPatientsLoading(false)
      })

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshPatients(true)
    }
    const intervalId = window.setInterval(refreshWhenVisible, 15000)

    window.addEventListener('focus', refreshWhenVisible)
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      isCurrent = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshWhenVisible)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [refreshPatients, user.token])

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null

  function renderActiveScreen() {
    switch (activeScreen) {
      case 'cadastrar':
        return <PatientRegistrationPage token={user.token} />
      case 'pacientes':
        return <PatientsPage
          patients={patients}
          loading={patientsLoading}
          error={patientsError}
          onAddPatient={() => setActiveScreen('cadastrar')}
          onRefresh={() => { void refreshPatients() }}
          onOpenProfile={(patientId) => { setSelectedPatientId(patientId); setActiveScreen('perfil') }}
          onOpenRecords={(patientId) => { setSelectedPatientId(patientId); setActiveScreen('registros') }}
        />
      case 'perfil':
        return selectedPatient ? <PatientProfilePage
          key={`${selectedPatient.id}-${user.token}`}
          patient={selectedPatient}
          token={user.token}
          onOpenRecords={() => setActiveScreen('registros')}
          onBackToPatients={() => setActiveScreen('pacientes')}
        /> : <p className="empty-results">Selecione um paciente vinculado para ver o perfil.</p>
      case 'registros':
        return selectedPatient ? <PatientRecordsPage
          key={`${selectedPatient.id}-${user.token}`}
          patientId={selectedPatient.id}
          patientName={selectedPatient.nome}
          token={user.token}
          onBackToProfile={() => setActiveScreen('perfil')}
        /> : <p className="empty-results">Selecione um paciente vinculado para ver os registros.</p>
      case 'relatorios':
        return <ReportExportPage
          patients={patients}
          patientsLoading={patientsLoading}
          patientsError={patientsError}
          token={user.token}
        />
      case 'alertas':
        return <PatientAlertsPage patients={patients} loading={patientsLoading} error={patientsError} onOpenProfile={(patientId) => { setSelectedPatientId(patientId); setActiveScreen('perfil') }} />
      case 'perfil-medico':
        return <DoctorProfilePage user={user} onSave={onUpdateUser} onCancel={() => setActiveScreen('dashboard')} />
      default:
        return <DashboardHome
          username={user.username}
          patients={patients}
          patientsLoading={patientsLoading}
          patientsError={patientsError}
          onOpenAlerts={() => setActiveScreen('alertas')}
          onOpenPatients={() => setActiveScreen('pacientes')}
          onOpenProfile={(patientId) => { setSelectedPatientId(patientId); setActiveScreen('perfil') }}
        />
    }
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="brand"><span className="brand-mark">I</span><strong>Insulog</strong><small>Portal médico</small></div>
          <p className="nav-label">Acompanhamento</p>
          <nav aria-label="Navegação principal">
            <button className={`nav-item ${activeScreen === 'dashboard' ? 'active' : ''}`} type="button" aria-current={activeScreen === 'dashboard' ? 'page' : undefined} onClick={() => setActiveScreen('dashboard')}><LayoutDashboard /> Visão geral</button>
            <button className={`nav-item ${['pacientes', 'cadastrar', 'perfil', 'registros'].includes(activeScreen) ? 'active' : ''}`} type="button" aria-current={['pacientes', 'cadastrar', 'perfil', 'registros'].includes(activeScreen) ? 'page' : undefined} onClick={() => setActiveScreen('pacientes')}><Users /> Pacientes</button>
            <button className={`nav-item ${activeScreen === 'alertas' ? 'active' : ''}`} type="button" aria-current={activeScreen === 'alertas' ? 'page' : undefined} onClick={() => setActiveScreen('alertas')}><AlertTriangle /> Alertas {alertCount > 0 && <b>{alertCount}</b>}</button>
            <button className={`nav-item ${activeScreen === 'relatorios' ? 'active' : ''}`} type="button" aria-current={activeScreen === 'relatorios' ? 'page' : undefined} onClick={() => setActiveScreen('relatorios')}><ChartNoAxesCombined /> Relatórios</button>
            <button className={`nav-item mobile-nav-account ${activeScreen === 'perfil-medico' ? 'active' : ''}`} type="button" aria-current={activeScreen === 'perfil-medico' ? 'page' : undefined} onClick={() => setActiveScreen('perfil-medico')}><UserRound /> Conta</button>
          </nav>
          <button className="doctor-profile" type="button" onClick={() => setActiveScreen('perfil-medico')} aria-label="Abrir perfil do médico">
            <span className="doctor-avatar">{initials}</span><span><strong>{formatPersonName(user.username)}</strong><small>{user.email}</small></span>
          </button>
        </aside>
        <section className="dashboard-content">{renderActiveScreen()}</section>
      </div>
    </main>
  )
}

export default DashboardPage
