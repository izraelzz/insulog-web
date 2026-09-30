import { useState } from 'react'
import { AlertTriangle, CalendarClock, ChartNoAxesCombined } from 'lucide-react'

type PatientAlert = {
  severity: 'urgent' | 'warn' | 'info'
  title: string
  patient: string
  description: string
  time: string
}

const alerts: PatientAlert[] = [
  { severity: 'urgent', title: 'Hipoglicemia grave', patient: 'Marcos Lima', description: 'Registrou 58 mg/dL em jejum, abaixo da meta mínima de 70 mg/dL.', time: 'Hoje, 06:40' },
  { severity: 'urgent', title: 'Hiperglicemia acentuada', patient: 'Beatriz Nogueira', description: 'Registrou 312 mg/dL após o almoço, acima da meta máxima.', time: 'Hoje, 13:10' },
  { severity: 'warn', title: 'Registro de insulina ausente', patient: 'João Paz', description: 'Está há 2 dias sem registrar aplicações de insulina no app.', time: 'Ontem' },
  { severity: 'info', title: 'Adesão ao registro caindo', patient: 'Carla Ferreira', description: 'Reduziu a frequência de registros em 30% nesta semana.', time: '2 dias atrás' },
]

type PatientAlertsPageProps = { onOpenProfile: () => void }

function PatientAlertsPage({ onOpenProfile }: PatientAlertsPageProps) {
  const [severity, setSeverity] = useState('Todas')
  const visibleAlerts = alerts.filter((alert) => severity === 'Todas' || alert.severity === severity)
  const severityLabels = { urgent: 'Crítico', warn: 'Atenção', info: 'Informativo' }

  return (
    <>
      <header className="dashboard-header page-toolbar"><div><h1>Alertas</h1><p>4 alertas ativos precisam da sua avaliação</p></div><label className="select-filter"><span>Severidade</span><select value={severity} onChange={(event) => setSeverity(event.target.value)}><option>Todas</option><option value="urgent">Crítico</option><option value="warn">Atenção</option><option value="info">Informativo</option></select></label></header>
      <section className="alerts-list" aria-label="Alertas dos pacientes">{visibleAlerts.map((alert) => <article className={`alert-row ${alert.severity}`} key={alert.title}>
        <span className={`alert-icon ${alert.severity}`}>{alert.severity === 'urgent' ? <AlertTriangle /> : alert.severity === 'warn' ? <CalendarClock /> : <ChartNoAxesCombined />}</span>
        <div className="alert-copy"><div className="alert-title-line"><h2>{alert.title}</h2><span className={`status-badge ${alert.severity}`}>{severityLabels[alert.severity]}</span></div><p><strong>{alert.patient}</strong> {alert.description}</p></div>
        <time>{alert.time}</time><button className="outline-button" type="button" onClick={onOpenProfile}>Ver paciente</button>
      </article>)}</section>
      {visibleAlerts.length === 0 && <p className="empty-results">Nenhum alerta nesta categoria.</p>}
    </>
  )
}

export default PatientAlertsPage
