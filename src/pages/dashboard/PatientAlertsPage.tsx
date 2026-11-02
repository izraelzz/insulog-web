import { useState } from 'react'
import { AlertTriangle, CalendarClock } from 'lucide-react'
import type { DoctorPatient } from '../../services/patientService'
import { formatPersonName } from '../../utils/formatPersonName'

type PatientAlertsPageProps = {
  patients: DoctorPatient[]
  loading: boolean
  error: string
  onOpenProfile: (patientId: number) => void
}

function PatientAlertsPage({ patients, loading, error, onOpenProfile }: PatientAlertsPageProps) {
  const [severity, setSeverity] = useState('Todas')
  const alerts = patients.filter((patient) => patient.situacao !== 'adequado')
  const visibleAlerts = alerts.filter((patient) => severity === 'Todas' || (severity === 'urgent' ? patient.situacao === 'critico' : patient.situacao === 'atencao'))
  const severityLabels = { urgent: 'Crítico', warn: 'Atenção' }
  const alertFilters = [
    { value: 'Todas', label: 'Todos', count: alerts.length },
    { value: 'urgent', label: 'Críticos', count: alerts.filter((patient) => patient.situacao === 'critico').length },
    { value: 'warn', label: 'Atenção', count: alerts.filter((patient) => patient.situacao === 'atencao').length },
  ]

  return (
    <>
      <header className="dashboard-header page-toolbar alerts-page-toolbar"><div><h1>Alertas</h1><p>{alerts.length} pacientes precisam de atenção</p></div><label className="select-filter"><span>Severidade</span><select value={severity} onChange={(event) => setSeverity(event.target.value)}><option>Todas</option><option value="urgent">Crítico</option><option value="warn">Atenção</option></select></label></header>
      <nav className="mobile-alert-filters" aria-label="Filtrar alertas por severidade">
        {alertFilters.map((filter) => (
          <button
            className={severity === filter.value ? 'active' : ''}
            type="button"
            key={filter.value}
            aria-pressed={severity === filter.value}
            onClick={() => setSeverity(filter.value)}
          >
            {filter.label}<span>{filter.count}</span>
          </button>
        ))}
      </nav>
      {error && <p className="empty-results" role="alert">{error}</p>}
      {loading ? <p className="empty-results" role="status">Carregando alertas...</p> : <section className="alerts-list" aria-label="Alertas dos pacientes">{visibleAlerts.map((patient) => {
        const tone = patient.situacao === 'critico' ? 'urgent' : 'warn'
        const title = patient.situacao === 'critico' ? 'Glicemia crítica' : 'Acompanhamento necessário'
        const readingTime = patient.ultimo_registro
          ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(patient.ultimo_registro))
          : 'Sem registros'

        return <article className={`alert-row ${tone}`} key={patient.id}>
          <span className={`alert-icon ${tone}`}>{tone === 'urgent' ? <AlertTriangle /> : <CalendarClock />}</span>
          <span className={`mobile-alert-avatar ${tone}`}>{patient.nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
          <div className="alert-copy"><div className="alert-title-line"><h2>{title}</h2></div><p><strong>{formatPersonName(patient.nome)}</strong> <span>{patient.motivo_situacao}</span></p></div>
          <span className={`status-badge ${tone} alert-severity`}>{severityLabels[tone]}</span>
          <strong className="alert-reading">{patient.ultima_glicose === null ? '—' : `${patient.ultima_glicose} mg/dL`}</strong>
          <time>{readingTime}</time><button className="outline-button" type="button" onClick={() => onOpenProfile(patient.id)}>Perfil</button>
        </article>
      })}</section>}
      {!loading && !error && visibleAlerts.length === 0 && <p className="empty-results">Nenhum alerta nesta categoria.</p>}
    </>
  )
}

export default PatientAlertsPage
