import { Activity, AlertTriangle, Bell, CalendarClock, Search, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DoctorPatient } from '../../services/patientService'
import PatientSituationSummary from './PatientSituationSummary'

type Tone = 'info' | 'urgent' | 'warn' | 'good'

type Metric = {
  icon: LucideIcon
  value: string
  unit?: string
  label: string
  tone: Tone
}

type DashboardHomeProps = {
  username: string
  patients: DoctorPatient[]
  patientsLoading: boolean
  patientsError: string
  onOpenAlerts: () => void
  onOpenProfile: (patientId: number) => void
}

function DashboardHome({ username, patients, patientsLoading, patientsError, onOpenAlerts, onOpenProfile }: DashboardHomeProps) {
  const firstName = username.trim().split(/\s+/)[0]
  const priorityPatients = patients.filter((patient) => patient.situacao !== 'adequado').slice(0, 4)
  const patientsWithAverage = patients.filter((patient) => patient.media_glicose_7_dias !== null)
  const averageGlucose = patientsWithAverage.length
    ? Math.round(patientsWithAverage.reduce((sum, patient) => sum + (patient.media_glicose_7_dias ?? 0), 0) / patientsWithAverage.length)
    : null
  const metrics: Metric[] = [
    { icon: Users, value: String(patients.length), label: 'Pacientes vinculados', tone: 'info' },
    { icon: AlertTriangle, value: String(patients.filter((patient) => patient.situacao === 'critico').length), label: 'Situações críticas', tone: 'urgent' },
    { icon: CalendarClock, value: String(patients.filter((patient) => patient.situacao === 'atencao').length), label: 'Precisam de atenção', tone: 'warn' },
    { icon: Activity, value: averageGlucose === null ? '—' : String(averageGlucose), unit: averageGlucose === null ? undefined : 'mg/dL', label: 'Média glicêmica em 7 dias', tone: 'good' },
  ]

  return (
    <>
      <header className="dashboard-header">
        <div><h1>Olá, {firstName}</h1><p>Panorama dos seus pacientes vinculados.</p></div>
        <div className="header-actions"><label className="patient-search"><Search /><input placeholder="Buscar paciente..." aria-label="Buscar paciente" /></label><button className="notification-button" type="button" aria-label="Notificações"><Bell /><i /></button></div>
      </header>

      {patientsLoading ? <p role="status">Carregando pacientes vinculados...</p> : patientsError ? <p className="empty-results" role="alert">{patientsError}</p> : <>
      <section className="priority-hero" aria-labelledby="priority-title">
        <div className="priority-heading"><h2 id="priority-title"><span className="pulse" /> Precisa da sua atenção agora</h2><button className="ghost-button" type="button" onClick={onOpenAlerts}>Ver todos os alertas <span aria-hidden="true">→</span></button></div>
        <div className="priority-row">
          {priorityPatients.map((patient) => <article className={`priority-card ${patient.situacao === 'critico' ? 'urgent' : 'warn'}`} key={patient.id}>
            <div className="priority-person"><span className="priority-avatar" aria-hidden="true">{patient.nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><span><strong>{patient.nome}</strong><small>{patient.email}</small></span></div>
            <div className="priority-value">{patient.ultima_glicose === null ? '—' : patient.ultima_glicose}{patient.ultima_glicose !== null && <small>mg/dL</small>}</div>
            <p>{patient.motivo_situacao}</p>
            <div className="priority-action"><button className="outline-button" type="button" onClick={() => onOpenProfile(patient.id)}>Ver perfil</button></div>
          </article>)}
          {priorityPatients.length === 0 && <p className="empty-results">Nenhuma situação precisa de atenção agora.</p>}
        </div>
      </section>

      <section className="metrics-grid" aria-label="Resumo dos pacientes">
        {metrics.map((metric) => { const MetricIcon = metric.icon; return <article className="metric-card" key={metric.label}><span className={`metric-icon ${metric.tone}`}><MetricIcon /></span><span><strong>{metric.value}{metric.unit && <small>{metric.unit}</small>}</strong><p>{metric.label}</p></span></article> })}
      </section>

      <PatientSituationSummary patients={patients} />
      </>}
    </>
  )
}

export default DashboardHome
