import { Activity, CalendarClock, ChartNoAxesCombined, ClipboardList, Droplet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchPatientRecords, type DoctorPatient, type PatientGlucoseRecord, type PatientSituation } from '../../services/patientService'
import GlycemiaTrendChart from './GlycemiaTrendChart'

type PatientProfilePageProps = {
  patient: DoctorPatient
  token: string
  onOpenRecords: () => void
  onBackToPatients: () => void
}

const situationLabels: Record<PatientSituation, string> = {
  adequado: 'Controle adequado',
  atencao: 'Atenção',
  critico: 'Situação crítica',
}

function formatRecordDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value.replace(' ', 'T')))
}

function PatientProfilePage({ patient, token, onOpenRecords, onBackToPatients }: PatientProfilePageProps) {
  const [records, setRecords] = useState<PatientGlucoseRecord[]>([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [recordsError, setRecordsError] = useState('')
  const tone = patient.situacao === 'critico' ? 'urgent' : patient.situacao === 'atencao' ? 'warn' : 'good'

  useEffect(() => {
    let isCurrent = true

    fetchPatientRecords(token, patient.id)
      .then((result) => { if (isCurrent) setRecords(result) })
      .catch((error: unknown) => { if (isCurrent) setRecordsError(error instanceof Error ? error.message : 'Não foi possível carregar os registros.') })
      .finally(() => { if (isCurrent) setRecordsLoading(false) })

    return () => { isCurrent = false }
  }, [patient.id, token])

  return (
    <>
      <header className="profile-banner">
        <div className="profile-identity"><span className="profile-avatar">{patient.nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div><h1>{patient.nome}</h1><p>{patient.email}</p><div className="profile-meta"><span><Droplet />Meta 70–140 mg/dL</span><span><CalendarClock />{patient.ultimo_registro ? `Último registro ${formatRecordDate(patient.ultimo_registro)}` : 'Sem registros'}</span></div></div></div>
        <div className="profile-actions"><button className="profile-light-button" type="button" onClick={onOpenRecords}><ClipboardList />Ver registros</button><button className="profile-outline-button" type="button" onClick={onBackToPatients}>Pacientes</button></div>
      </header>
      <div className="profile-tabs"><span className="selected">Visão geral</span><button type="button" onClick={onOpenRecords}>Registros</button></div>
      <section className="profile-stats" aria-label="Indicadores do paciente">
        <article className="profile-stat"><span className="metric-icon good"><Droplet /></span><div><strong>{patient.ultima_glicose ?? '—'}{patient.ultima_glicose !== null && <small> mg/dL</small>}</strong><p>Última glicemia</p></div></article>
        <article className="profile-stat"><span className="metric-icon info"><ChartNoAxesCombined /></span><div><strong>{patient.media_glicose_7_dias === null ? '—' : Math.round(patient.media_glicose_7_dias)}{patient.media_glicose_7_dias !== null && <small> mg/dL</small>}</strong><p>Média dos últimos 7 dias</p></div></article>
        <article className="profile-stat"><span className="metric-icon warn"><Activity /></span><div><strong>{patient.registros_7_dias}</strong><p>Registros nos últimos 7 dias</p></div></article>
        <article className="profile-stat"><span className={`metric-icon ${tone}`}><CalendarClock /></span><div><span className={`status-badge ${tone}`}>{situationLabels[patient.situacao]}</span><p>Situação atual</p></div></article>
      </section>
      <div className="profile-lower-grid">
        <section className="dashboard-card"><div className="card-heading"><div><h2>Glicemia</h2><p>Últimas medições registradas</p></div><span className="period-chip">14 registros</span></div>{recordsLoading ? <p role="status">Carregando registros...</p> : recordsError ? <p className="empty-results" role="alert">{recordsError}</p> : <GlycemiaTrendChart records={records} />}</section>
        <section className="dashboard-card clinical-notes"><div className="card-heading"><div><h2>Registros recentes</h2><p>Glicose e insulina pelo aplicativo</p></div></div>
          {records.slice(0, 3).map((record) => <div className="note-row" key={record.id_registro}><span className={`note-marker ${record.nivel_glicose < 70 || record.nivel_glicose > 180 ? 'warn' : 'good'}`} /><div><strong>{record.nivel_glicose} mg/dL · {record.periodo || 'Sem período'}</strong><p>{formatRecordDate(record.data_hora)} · {record.insulina || 'Sem insulina informada'}</p></div></div>)}
          {!recordsLoading && !recordsError && records.length === 0 && <p className="empty-results">Este paciente ainda não tem registros.</p>}
        </section>
      </div>
    </>
  )
}

export default PatientProfilePage
