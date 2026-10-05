import { useState } from 'react'
import { AlertTriangle, CalendarClock } from 'lucide-react'
import type { DoctorPatient } from '../../services/patientService'

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

  return (
    <>
      <header className="dashboard-header page-toolbar"><div><h1>Alertas</h1><p>{alerts.length} pacientes precisam de atenção</p></div><label className="select-filter"><span>Severidade</span><select value={severity} onChange={(event) => setSeverity(event.target.value)}><option>Todas</option><option value="urgent">Crítico</option><option value="warn">Atenção</option></select></label></header>
      {error && <p className="empty-results" role="alert">{error}</p>}
      {loading ? <p className="empty-results" role="status">Carregando alertas...</p> : <section className="alerts-list" aria-label="Alertas dos pacientes">{visibleAlerts.map((patient) => {
        const tone = patient.situacao === 'critico' ? 'urgent' : 'warn'
        const title = patient.situacao === 'critico' ? 'Situação crítica de glicose' : 'Acompanhamento necessário'
        const readingTime = patient.ultimo_registro
          ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(patient.ultimo_registro))
          : 'Sem registros'

        return <article className={`alert-row ${tone}`} key={patient.id}>
          <span className={`alert-icon ${tone}`}>{tone === 'urgent' ? <AlertTriangle /> : <CalendarClock />}</span>
          <div className="alert-copy"><div className="alert-title-line"><h2>{title}</h2><span className={`status-badge ${tone}`}>{severityLabels[tone]}</span></div><p><strong>{patient.nome}</strong> {patient.motivo_situacao}</p></div>
          <time>{readingTime}</time><button className="outline-button" type="button" onClick={() => onOpenProfile(patient.id)}>Ver paciente</button>
        </article>
      })}</section>}
      {!loading && !error && visibleAlerts.length === 0 && <p className="empty-results">Nenhum alerta nesta categoria.</p>}
    </>
  )
}

export default PatientAlertsPage
