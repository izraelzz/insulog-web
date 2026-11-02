import { useState } from 'react'
import { useEffect } from 'react'
import { ArrowLeft, CalendarClock, Clock3, Droplet, Syringe } from 'lucide-react'
import { fetchPatientRecords, type PatientGlucoseRecord } from '../../services/patientService'
import { formatPersonName } from '../../utils/formatPersonName'

type PatientRecordsPageProps = {
  patientId: number
  patientName: string
  token: string
  onBackToProfile: () => void
}

function formatRecordDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value.replace(' ', 'T')))
}

function formatRecordTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value.replace(' ', 'T')))
}

function getGlucoseStatus(glucose: number) {
  if (glucose < 70) return { text: 'Baixo', tone: 'urgent' }
  if (glucose > 140) return { text: 'Acima da meta', tone: 'warn' }
  return { text: 'No alvo', tone: 'good' }
}

function PatientRecordsPage({ patientId, patientName, token, onBackToProfile }: PatientRecordsPageProps) {
  const [records, setRecords] = useState<PatientGlucoseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [moment, setMoment] = useState('Todos')
  const moments = Array.from(new Set(records.map((record) => record.periodo).filter((period): period is string => Boolean(period))))
  const filteredRecords = records.filter((record) => moment === 'Todos' || record.periodo === moment)
  const averageGlucose = filteredRecords.length
    ? Math.round(filteredRecords.reduce((total, record) => total + record.nivel_glicose, 0) / filteredRecords.length)
    : null
  const inRangeCount = filteredRecords.filter((record) => record.nivel_glicose >= 70 && record.nivel_glicose <= 140).length
  const momentCounts = moments.map((period) => ({
    label: period,
    count: records.filter((record) => record.periodo === period).length,
  }))

  useEffect(() => {
    let isCurrent = true

    fetchPatientRecords(token, patientId)
      .then((result) => { if (isCurrent) setRecords(result) })
      .catch((requestError: unknown) => { if (isCurrent) setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar os registros.') })
      .finally(() => { if (isCurrent) setLoading(false) })

    return () => { isCurrent = false }
  }, [patientId, token])

  return (
    <>
      <header className="dashboard-header page-toolbar records-page-toolbar"><div><h1>Registros <span>· {formatPersonName(patientName)}</span></h1><p>Glicose e insulina registradas pelo aplicativo</p></div><button className="outline-button back-button" type="button" onClick={onBackToProfile}><ArrowLeft /><span>Voltar ao perfil</span><span className="mobile-back-label">Perfil</span></button></header>
      <div className="directory-filters records-filters"><span className="filter-caption"><CalendarClock />Todos os registros</span><label className="select-filter"><span>Momento</span><select value={moment} onChange={(event) => setMoment(event.target.value)}><option>Todos</option>{moments.map((period) => <option key={period}>{period}</option>)}</select></label></div>
      {!loading && !error && <>
        <div className="mobile-records-summary" aria-label="Resumo dos registros filtrados">
          <article><span>Registros</span><strong>{filteredRecords.length}</strong></article>
          <article><span>Média</span><strong>{averageGlucose === null ? '—' : `${averageGlucose}`}<small>{averageGlucose === null ? '' : ' mg/dL'}</small></strong></article>
          <article><span>No alvo</span><strong>{inRangeCount}<small> de {filteredRecords.length}</small></strong></article>
        </div>
        <nav className="mobile-record-filters" aria-label="Filtrar registros por momento">
          <button className={moment === 'Todos' ? 'active' : ''} type="button" aria-pressed={moment === 'Todos'} onClick={() => setMoment('Todos')}>
            Todos<span>{records.length}</span>
          </button>
          {momentCounts.map((filter) => (
            <button className={moment === filter.label ? 'active' : ''} type="button" key={filter.label} aria-pressed={moment === filter.label} onClick={() => setMoment(filter.label)}>
              {filter.label}<span>{filter.count}</span>
            </button>
          ))}
        </nav>
      </>}
      <section className="dashboard-card table-card records-card" aria-label="Registros de glicose e insulina">
        {error && <p className="empty-results" role="alert">{error}</p>}
        {loading ? <p className="empty-results" role="status">Carregando registros...</p> : <>
          <div className="mobile-record-list">
            {filteredRecords.map((record) => {
              const status = getGlucoseStatus(record.nivel_glicose)
              return (
                <article className={`mobile-record-card ${status.tone}`} key={record.id_registro}>
                  <div className="mobile-record-heading">
                    <span className={`mobile-record-icon ${status.tone}`}><Droplet aria-hidden="true" /></span>
                    <div className="mobile-record-date">
                      <strong>{formatRecordDate(record.data_hora)}</strong>
                      <span><Clock3 aria-hidden="true" />{formatRecordTime(record.data_hora)}</span>
                    </div>
                    <span className={`status-badge ${status.tone}`}>{status.text}</span>
                  </div>
                  <div className="mobile-record-reading">
                    <span>Glicemia</span>
                    <strong>{record.nivel_glicose}<small>mg/dL</small></strong>
                  </div>
                  <div className="mobile-record-details">
                    <span className="moment-badge">{record.periodo || 'Sem momento'}</span>
                    <span className="mobile-record-insulin">
                      <Syringe aria-hidden="true" />
                      {record.insulina || 'Sem insulina'}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="responsive-table"><table className="data-table"><thead><tr><th>Data</th><th>Horário</th><th>Momento</th><th>Glicose</th><th>Insulina</th><th>Status</th></tr></thead><tbody>
          {filteredRecords.map((record) => { const status = getGlucoseStatus(record.nivel_glicose); return <tr key={record.id_registro}><td>{formatRecordDate(record.data_hora)}</td><td>{formatRecordTime(record.data_hora)}</td><td><span className="moment-badge">{record.periodo || '—'}</span></td><td className="glucose-value">{record.nivel_glicose} mg/dL</td><td>{record.insulina || '—'}</td><td><span className={`status-badge ${status.tone}`}>{status.text}</span></td></tr> })}
        </tbody></table></div>
        </>}
        {!loading && !error && filteredRecords.length === 0 && <p className="empty-results">Nenhum registro encontrado para esse momento.</p>}
        <div className="table-footer"><span>{filteredRecords.length} registros neste período</span></div>
      </section>
    </>
  )
}

export default PatientRecordsPage
