import { Activity, ArrowRight, CalendarClock, CircleCheck, Droplet, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DoctorPatient, PatientSituation } from '../../services/patientService'
import { formatPersonName } from '../../utils/formatPersonName'

type Tone = 'info' | 'urgent' | 'warn' | 'good'

type Metric = {
  icon: LucideIcon
  value: string
  label: string
  detail: string
  tone: Tone
}

type DashboardHomeProps = {
  username: string
  patients: DoctorPatient[]
  patientsLoading: boolean
  patientsError: string
  onOpenAlerts: () => void
  onOpenPatients: () => void
  onOpenProfile: (patientId: number) => void
}

const situationLabels: Record<PatientSituation, string> = {
  adequado: 'Adequado',
  atencao: 'Atenção',
  critico: 'Crítico',
}

function getTimestamp(value: string | null) {
  if (!value) return 0
  const timestamp = new Date(value.replace(' ', 'T')).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function formatLastReading(value: string | null) {
  if (!value) return 'Sem medições registradas'
  const timestamp = getTimestamp(value)
  if (!timestamp) return 'Data da medição indisponível'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(timestamp)
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function DashboardHome({
  username,
  patients,
  patientsLoading,
  patientsError,
  onOpenAlerts,
  onOpenPatients,
  onOpenProfile,
}: DashboardHomeProps) {
  const firstName = formatPersonName(username).split(/\s+/)[0]
  const patientsRequiringAttention = patients
    .filter((patient) => patient.situacao !== 'adequado')
    .sort((first, second) => {
      const severityOrder = { critico: 0, atencao: 1, adequado: 2 }
      return severityOrder[first.situacao] - severityOrder[second.situacao]
        || getTimestamp(second.ultimo_registro) - getTimestamp(first.ultimo_registro)
    })
  const priorityPatients = patientsRequiringAttention.slice(0, 4)
  const recentPatients = patients
    .filter((patient) => patient.situacao === 'adequado' && patient.ultimo_registro && patient.ultima_glicose !== null)
    .sort((first, second) => getTimestamp(second.ultimo_registro) - getTimestamp(first.ultimo_registro))
    .slice(0, 5)
  const weeklyReadings = patients.reduce((total, patient) => total + patient.registros_7_dias, 0)
  const patientsWithoutWeeklyReadings = patients.filter((patient) => patient.registros_7_dias === 0).length
  const metrics: Metric[] = [
    { icon: Users, value: String(patients.length), label: 'Pacientes', detail: 'vinculados à sua conta', tone: 'info' },
    { icon: Activity, value: String(weeklyReadings), label: 'Medições · 7 dias', detail: 'nos últimos 7 dias', tone: 'good' },
    { icon: CalendarClock, value: String(patientsWithoutWeeklyReadings), label: 'Sem medições · 7 dias', detail: 'vale conferir o acompanhamento', tone: patientsWithoutWeeklyReadings ? 'warn' : 'good' },
  ]

  return (
    <>
      <header className="dashboard-header dashboard-home-header">
        <div><h1>Olá, {firstName}</h1><p>Resumo do acompanhamento dos seus pacientes.</p></div>
      </header>

      {patientsLoading ? <p className="dashboard-state" role="status">Carregando pacientes vinculados...</p> : patientsError ? <p className="empty-results" role="alert">{patientsError}</p> : <>
        <section className="mobile-overview" aria-label="Resumo do acompanhamento">
          <div className="mobile-overview-summary">
            <div className="mobile-overview-summary-heading">
              <span>Acompanhamento</span>
              <span>Últimos 7 dias</span>
            </div>
            <div className="mobile-overview-stats">
              <div><strong>{patients.length}</strong><span>Pacientes</span></div>
              <div><strong>{weeklyReadings}</strong><span>Medições</span></div>
              <div><strong>{patientsWithoutWeeklyReadings}</strong><span>Sem registro</span></div>
            </div>
          </div>

          <section className="mobile-overview-section" aria-labelledby="mobile-priority-title">
            <div className="mobile-overview-section-heading">
              <div>
                <span className="mobile-overview-eyebrow">Prioridade</span>
                <h2 id="mobile-priority-title">Precisa de atenção</h2>
              </div>
              <button type="button" onClick={onOpenAlerts}>Ver todos <ArrowRight aria-hidden="true" /></button>
            </div>
            {priorityPatients.length > 0 ? (
              <div className="mobile-overview-patient-list">
                {priorityPatients.slice(0, 3).map((patient) => (
                  <article className={`mobile-overview-patient ${patient.situacao}`} key={patient.id}>
                    <span className={`mobile-overview-avatar ${patient.situacao}`}>{getInitials(patient.nome)}</span>
                    <div className="mobile-overview-patient-copy">
                      <strong>{formatPersonName(patient.nome)}</strong>
                      <span className={`mobile-overview-patient-state ${patient.situacao}`}>{situationLabels[patient.situacao]}</span>
                      <span>{patient.motivo_situacao}</span>
                    </div>
                    <div className="mobile-overview-patient-reading">
                      <strong>{patient.ultima_glicose === null ? '—' : patient.ultima_glicose}</strong>
                      <span>mg/dL</span>
                    </div>
                    <button className="mobile-overview-open" type="button" aria-label={`Abrir perfil de ${formatPersonName(patient.nome)}`} onClick={() => onOpenProfile(patient.id)}>
                      <ArrowRight aria-hidden="true" />
                    </button>
                  </article>
                ))}
                {patientsRequiringAttention.length > 3 && (
                  <button className="mobile-overview-more" type="button" onClick={onOpenAlerts}>
                    + {patientsRequiringAttention.length - 3} outros pacientes
                  </button>
                )}
              </div>
            ) : (
              <div className="mobile-overview-clear">
                <CircleCheck aria-hidden="true" />
                <span>{patients.length > 0 ? 'Nenhum paciente precisa de atenção agora.' : 'Cadastre ou vincule um paciente para começar.'}</span>
                {patients.length === 0 && <button type="button" onClick={onOpenPatients}>Ver pacientes</button>}
              </div>
            )}
          </section>

          {recentPatients.length > 0 && (
            <section className="mobile-overview-section mobile-overview-recent" aria-labelledby="mobile-recent-title">
              <div className="mobile-overview-section-heading">
                <div>
                  <span className="mobile-overview-eyebrow">Em acompanhamento</span>
                  <h2 id="mobile-recent-title">Leituras recentes</h2>
                </div>
                <button type="button" onClick={onOpenPatients}>Pacientes <ArrowRight aria-hidden="true" /></button>
              </div>
              <div className="mobile-overview-recent-list">
                {recentPatients.slice(0, 3).map((patient) => (
                  <button className="mobile-overview-recent-row" type="button" key={patient.id} onClick={() => onOpenProfile(patient.id)}>
                    <span className="mobile-overview-recent-icon"><Droplet aria-hidden="true" /></span>
                    <span className="mobile-overview-recent-copy">
                      <strong>{formatPersonName(patient.nome)}</strong>
                      <small>{formatLastReading(patient.ultimo_registro)}</small>
                    </span>
                    <strong className="mobile-overview-recent-reading">{patient.ultima_glicose} <small>mg/dL</small></strong>
                  </button>
                ))}
              </div>
            </section>
          )}
        </section>

        <section className="metrics-grid dashboard-overview-metrics" aria-label="Indicadores do acompanhamento">
          {metrics.map((metric) => {
            const MetricIcon = metric.icon
            return (
              <article className="metric-card dashboard-overview-metric" key={metric.label}>
                <span className={`metric-icon ${metric.tone}`}><MetricIcon /></span>
                <span className="dashboard-overview-copy">
                  <strong>{metric.value}</strong>
                  <p>{metric.label}</p>
                  <small>{metric.detail}</small>
                </span>
              </article>
            )
          })}
        </section>

        <section className="priority-hero dashboard-priority" aria-labelledby="priority-title">
          <div className="priority-heading">
            <div>
              <h2 id="priority-title">
                {priorityPatients.length > 0 && <span className="pulse" />}
                {priorityPatients.length > 0 ? 'Pacientes para acompanhar' : 'Acompanhamento em dia'}
              </h2>
              <p>{patientsRequiringAttention.length > 0 ? `${patientsRequiringAttention.length} paciente${patientsRequiringAttention.length === 1 ? '' : 's'} precisa${patientsRequiringAttention.length === 1 ? '' : 'm'} de atenção.` : 'Nenhum paciente com alerta no momento.'}</p>
            </div>
            <button className="ghost-button" type="button" onClick={onOpenAlerts}>Alertas <ArrowRight aria-hidden="true" /></button>
          </div>

          {priorityPatients.length > 0 ? (
            <div className="dashboard-priority-list">
              {priorityPatients.map((patient) => (
                <article className="dashboard-priority-row" key={patient.id}>
                  <span className={`dashboard-priority-indicator ${patient.situacao}`} aria-hidden="true" />
                  <div className="dashboard-priority-patient">
                    <strong>{formatPersonName(patient.nome)}</strong>
                    <span>{patient.motivo_situacao}</span>
                  </div>
                  <div className="dashboard-priority-reading">
                    <strong>{patient.ultima_glicose === null ? '—' : `${patient.ultima_glicose} mg/dL`}</strong>
                    <span>{formatLastReading(patient.ultimo_registro)}</span>
                  </div>
                  <span className={`status-badge ${patient.situacao === 'critico' ? 'urgent' : 'warn'}`}>{situationLabels[patient.situacao]}</span>
                  <button className="outline-button" type="button" onClick={() => onOpenProfile(patient.id)}>Perfil</button>
                </article>
              ))}
              {patientsRequiringAttention.length > priorityPatients.length && (
                <p className="dashboard-priority-more">Exibindo os {priorityPatients.length} casos prioritários. Acesse os alertas para ver os demais.</p>
              )}
            </div>
          ) : patients.length === 0 ? (
            <div className="dashboard-empty-state">
              <Users aria-hidden="true" />
              <p>Quando pacientes estiverem vinculados, você verá aqui os acompanhamentos que precisam de atenção.</p>
              <button className="outline-button" type="button" onClick={onOpenPatients}>Ir para pacientes</button>
            </div>
          ) : (
            <div className="dashboard-all-clear">
              <CircleCheck aria-hidden="true" />
              <span>Todos os pacientes estão classificados como adequados.</span>
            </div>
          )}
        </section>

        <section className="dashboard-card dashboard-recent-card" aria-labelledby="recent-readings-title">
          <div className="card-heading">
            <div><h2 id="recent-readings-title">Últimas leituras</h2><p>Pacientes sem alerta</p></div>
            <button className="ghost-button" type="button" onClick={onOpenPatients}>Ver todos <ArrowRight aria-hidden="true" /></button>
          </div>
          {recentPatients.length > 0 ? (
            <div className="dashboard-recent-list">
              {recentPatients.map((patient) => (
                <button className="dashboard-recent-row" type="button" key={patient.id} onClick={() => onOpenProfile(patient.id)}>
                  <span className={`dashboard-recent-icon ${patient.situacao}`}><Droplet aria-hidden="true" /></span>
                  <span className="dashboard-recent-patient"><strong>{formatPersonName(patient.nome)}</strong><small>{formatLastReading(patient.ultimo_registro)}</small></span>
                  <strong className="dashboard-recent-value">{patient.ultima_glicose} <small>mg/dL</small></strong>
                  <span className={`status-badge ${patient.situacao === 'critico' ? 'urgent' : patient.situacao === 'atencao' ? 'warn' : 'good'}`}>{situationLabels[patient.situacao]}</span>
                  <ArrowRight className="dashboard-recent-arrow" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : (
            <p className="dashboard-recent-empty">Não há medições recentes de pacientes sem alerta para exibir.</p>
          )}
        </section>
      </>}
    </>
  )
}

export default DashboardHome
