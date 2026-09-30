import { useState } from 'react'
import { ArrowLeft, CalendarClock } from 'lucide-react'

type GlucoseRecord = {
  date: string
  time: string
  moment: string
  glucose: number
  insulin: string
  status: string
  tone: 'urgent' | 'warn' | 'good'
}

const records: GlucoseRecord[] = [
  { date: '21/08', time: '07:15', moment: 'Jejum', glucose: 96, insulin: 'Lenta · 18U', status: 'No alvo', tone: 'good' },
  { date: '21/08', time: '08:02', moment: 'Café', glucose: 118, insulin: 'Ultrarrápida · 4U', status: 'No alvo', tone: 'good' },
  { date: '20/08', time: '12:40', moment: 'Almoço', glucose: 146, insulin: 'Ultrarrápida · 6U', status: 'Levemente alto', tone: 'warn' },
  { date: '20/08', time: '16:10', moment: 'Lanche', glucose: 102, insulin: '—', status: 'No alvo', tone: 'good' },
  { date: '19/08', time: '20:30', moment: 'Janta', glucose: 134, insulin: 'Ultrarrápida · 5U', status: 'No alvo', tone: 'good' },
  { date: '19/08', time: '06:50', moment: 'Jejum', glucose: 68, insulin: '—', status: 'Baixo', tone: 'urgent' },
  { date: '18/08', time: '15:20', moment: 'Intervalo', glucose: 124, insulin: '—', status: 'No alvo', tone: 'good' },
]

type PatientRecordsPageProps = { onBackToProfile: () => void }

function PatientRecordsPage({ onBackToProfile }: PatientRecordsPageProps) {
  const [moment, setMoment] = useState('Todos')
  const filteredRecords = records.filter((record) => moment === 'Todos' || record.moment === moment)

  return (
    <>
      <header className="dashboard-header page-toolbar"><div><h1>Registros · Alex Santos</h1><p>Glicose e insulina registradas pelo aplicativo</p></div><button className="outline-button back-button" type="button" onClick={onBackToProfile}><ArrowLeft />Voltar ao perfil</button></header>
      <div className="directory-filters records-filters"><span className="filter-caption"><CalendarClock />Últimos 7 dias</span><label className="select-filter"><span>Momento</span><select value={moment} onChange={(event) => setMoment(event.target.value)}><option>Todos</option><option>Jejum</option><option>Café</option><option>Almoço</option><option>Lanche</option><option>Janta</option><option>Intervalo</option></select></label></div>
      <section className="dashboard-card table-card records-card" aria-label="Registros de glicose e insulina">
        <div className="responsive-table"><table className="data-table"><thead><tr><th>Data</th><th>Horário</th><th>Momento</th><th>Glicose</th><th>Insulina</th><th>Status</th></tr></thead><tbody>
          {filteredRecords.map((record) => <tr key={`${record.date}-${record.time}`}><td>{record.date}</td><td>{record.time}</td><td><span className="moment-badge">{record.moment}</span></td><td className="glucose-value">{record.glucose} mg/dL</td><td>{record.insulin}</td><td><span className={`status-badge ${record.tone}`}>{record.status}</span></td></tr>)}
        </tbody></table></div>
        {filteredRecords.length === 0 && <p className="empty-results">Nenhum registro encontrado para esse momento.</p>}
        <div className="table-footer"><span>{filteredRecords.length} registros neste período</span></div>
      </section>
    </>
  )
}

export default PatientRecordsPage
