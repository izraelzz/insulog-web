import { Activity, AlertTriangle, Bell, CalendarClock, Search, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PatientSituationSummary from './PatientSituationSummary'

type Tone = 'info' | 'urgent' | 'warn' | 'good'

type PriorityPatient = {
  initials: string
  name: string
  meta: string
  value: string
  unit?: string
  reason: string
  tone: 'urgent' | 'warn'
  color: string
}

type Metric = {
  icon: LucideIcon
  value: string
  unit?: string
  label: string
  tone: Tone
}

const priorityPatients: PriorityPatient[] = [
  { initials: 'ML', name: 'Marcos Lima', meta: 'Tipo 1 · 32 anos', value: '58', unit: 'mg/dL', reason: 'Hipoglicemia em jejum · 06:40', tone: 'urgent', color: '#d97756' },
  { initials: 'BN', name: 'Beatriz Nogueira', meta: 'Tipo 2 · 45 anos', value: '312', unit: 'mg/dL', reason: 'Hiperglicemia pós-almoço · 13:10', tone: 'urgent', color: '#5b8fe0' },
  { initials: 'JP', name: 'João Paz', meta: 'Tipo 2 · 58 anos', value: '2 dias', reason: 'Sem registrar insulina', tone: 'warn', color: '#8b6fe0' },
  { initials: 'CF', name: 'Carla Ferreira', meta: 'Gestacional · 31 anos', value: '-30%', reason: 'Queda na adesão ao registro', tone: 'warn', color: '#d46fa6' },
]

const metrics: Metric[] = [
  { icon: Users, value: '86', label: 'Pacientes ativos', tone: 'info' },
  { icon: AlertTriangle, value: '7', label: 'Alertas críticos', tone: 'urgent' },
  { icon: CalendarClock, value: '5', label: 'Consultas hoje', tone: 'warn' },
  { icon: Activity, value: '128', unit: 'mg/dL', label: 'Média geral da base', tone: 'good' },
]

type DashboardHomeProps = {
  username: string
  onOpenAlerts: () => void
  onOpenProfile: () => void
}

function DashboardHome({ username, onOpenAlerts, onOpenProfile }: DashboardHomeProps) {
  const firstName = username.trim().split(/\s+/)[0]

  return (
    <>
      <header className="dashboard-header">
        <div><h1>Olá, {firstName}</h1><p>Quinta-feira, 21 de agosto · panorama da sua base de pacientes</p></div>
        <div className="header-actions"><label className="patient-search"><Search /><input placeholder="Buscar paciente..." aria-label="Buscar paciente" /></label><button className="notification-button" type="button" aria-label="Notificações"><Bell /><i /></button></div>
      </header>

      <section className="priority-hero" aria-labelledby="priority-title">
        <div className="priority-heading"><h2 id="priority-title"><span className="pulse" /> Precisa da sua atenção agora</h2><button className="ghost-button" type="button" onClick={onOpenAlerts}>Ver todos os alertas <span aria-hidden="true">→</span></button></div>
        <div className="priority-row">
          {priorityPatients.map((patient) => <article className={`priority-card ${patient.tone}`} key={patient.name}>
            <div className="priority-person"><span className="priority-avatar" style={{ background: patient.color }}>{patient.initials}</span><span><strong>{patient.name}</strong><small>{patient.meta}</small></span></div>
            <div className="priority-value">{patient.value}{patient.unit && <small>{patient.unit}</small>}</div>
            <p>{patient.reason}</p>
            <div className="priority-action"><button className="outline-button" type="button" onClick={onOpenProfile}>Ver perfil</button></div>
          </article>)}
        </div>
      </section>

      <section className="metrics-grid" aria-label="Resumo dos pacientes">
        {metrics.map((metric) => { const MetricIcon = metric.icon; return <article className="metric-card" key={metric.label}><span className={`metric-icon ${metric.tone}`}><MetricIcon /></span><span><strong>{metric.value}{metric.unit && <small>{metric.unit}</small>}</strong><p>{metric.label}</p></span></article> })}
      </section>

      <PatientSituationSummary />
    </>
  )
}

export default DashboardHome
