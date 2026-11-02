import { useState } from 'react'
import { ClipboardList, RefreshCw, Search, UserPlus } from 'lucide-react'
import type { DoctorPatient, PatientSituation } from '../../services/patientService'
import { formatPersonName } from '../../utils/formatPersonName'

type PatientsPageProps = {
  patients: DoctorPatient[]
  loading: boolean
  error: string
  onAddPatient: () => void
  onRefresh: () => void
  onOpenProfile: (patientId: number) => void
  onOpenRecords: (patientId: number) => void
}

const situationLabels: Record<PatientSituation, string> = {
  adequado: 'Controle adequado',
  atencao: 'Atenção',
  critico: 'Situação crítica',
}

function formatLastReading(date: string | null) {
  if (!date) return 'Sem registros'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date))
}

function PatientsPage({ patients, loading, error, onAddPatient, onRefresh, onOpenProfile, onOpenRecords }: PatientsPageProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todos')
  const shownPatients = patients.filter((patient) => {
    const matchesQuery = `${patient.nome} ${patient.email}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === 'Todos' || patient.situacao === status)
  })
  const statusFilters = [
    { value: 'Todos', label: 'Todos', count: patients.length },
    { value: 'atencao', label: 'Atenção', count: patients.filter((patient) => patient.situacao === 'atencao').length },
    { value: 'critico', label: 'Críticos', count: patients.filter((patient) => patient.situacao === 'critico').length },
    { value: 'adequado', label: 'Adequados', count: patients.filter((patient) => patient.situacao === 'adequado').length },
  ]

  return (
    <>
      <header className="dashboard-header page-toolbar patients-toolbar">
        <div><h1>Pacientes</h1><p>{patients.length} pacientes vinculados ao seu acompanhamento</p></div>
        <div className="patients-toolbar-actions"><button className="outline-button" type="button" onClick={onRefresh} disabled={loading} aria-label="Atualizar pacientes"><RefreshCw /><span>Atualizar</span></button><button className="primary-button" type="button" onClick={onAddPatient}><UserPlus /><span>Cadastrar</span></button></div>
      </header>
      <div className="directory-filters">
        <label className="patient-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar paciente..." aria-label="Buscar pacientes" /></label>
        <label className="select-filter"><span>Situação</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option value="adequado">Controle adequado</option><option value="atencao">Atenção</option><option value="critico">Situação crítica</option></select></label>
      </div>
      <nav className="mobile-patient-filters" aria-label="Filtrar pacientes por situação">
        {statusFilters.map((filter) => (
          <button
            className={status === filter.value ? 'active' : ''}
            type="button"
            key={filter.value}
            aria-pressed={status === filter.value}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}<span>{filter.count}</span>
          </button>
        ))}
      </nav>
      <section className="dashboard-card table-card patients-directory-card" aria-label="Lista de pacientes">
        {error && <p className="empty-results" role="alert">{error}</p>}
        {loading ? <p className="empty-results" role="status">Carregando pacientes...</p> : <>
          <div className="mobile-patient-list">
            {shownPatients.map((patient) => (
              <article className={`mobile-patient-card ${patient.situacao}`} key={patient.id}>
                <div className="mobile-patient-card-heading">
                  <span className="table-avatar">{patient.nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
                  <div className="mobile-patient-identity">
                    <strong>{formatPersonName(patient.nome)}</strong>
                    <small>{patient.registros_7_dias} {patient.registros_7_dias === 1 ? 'medição' : 'medições'} nesta semana</small>
                  </div>
                  <span className={`status-badge ${patient.situacao === 'critico' ? 'urgent' : patient.situacao === 'atencao' ? 'warn' : 'good'}`}>
                    {patient.situacao === 'critico' ? 'Crítico' : patient.situacao === 'atencao' ? 'Atenção' : 'Adequado'}
                  </span>
                </div>
                <div className="mobile-patient-reading">
                  <span>Última leitura</span>
                  <strong>{patient.ultima_glicose === null ? '—' : `${patient.ultima_glicose} mg/dL`}</strong>
                  <small>{formatLastReading(patient.ultimo_registro)}</small>
                </div>
                <div className="mobile-patient-actions">
                  <button className="primary-button" type="button" onClick={() => onOpenProfile(patient.id)}>Abrir perfil</button>
                  <button className="icon-button" type="button" aria-label={`Ver registros de ${formatPersonName(patient.nome)}`} onClick={() => onOpenRecords(patient.id)}><ClipboardList /></button>
                </div>
              </article>
            ))}
          </div>
          <div className="responsive-table"><table className="data-table patients-table"><thead><tr><th>Paciente</th><th>Média em 7 dias</th><th>Registros em 7 dias</th><th>Última leitura</th><th>Situação</th><th>Ações</th></tr></thead>
          <tbody>{shownPatients.map((patient) => <tr key={patient.id}>
            <td data-label="Paciente"><span className="table-person"><span className="table-avatar">{patient.nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><span><strong>{formatPersonName(patient.nome)}</strong><small className="patient-email">{patient.email}</small></span></span></td>
            <td data-label="Média em 7 dias">{patient.media_glicose_7_dias === null ? '—' : `${Math.round(patient.media_glicose_7_dias)} mg/dL`}</td>
            <td data-label="7 dias">{patient.registros_7_dias}</td>
            <td data-label="Última leitura">{patient.ultima_glicose === null ? '—' : `${patient.ultima_glicose} mg/dL`}<small className="last-reading-time">{formatLastReading(patient.ultimo_registro)}</small></td>
            <td data-label="Situação"><span className={`status-badge ${patient.situacao === 'critico' ? 'urgent' : patient.situacao === 'atencao' ? 'warn' : 'good'}`}>{situationLabels[patient.situacao]}</span></td>
            <td data-label="Ações"><div className="table-actions"><button className="outline-button" type="button" onClick={() => onOpenProfile(patient.id)}>Perfil</button><button className="icon-button" type="button" aria-label={`Ver registros de ${formatPersonName(patient.nome)}`} onClick={() => onOpenRecords(patient.id)}><ClipboardList /></button></div></td>
          </tr>)}</tbody>
        </table></div>
        </>}
        {shownPatients.length === 0 && <p className="empty-results">Nenhum paciente encontrado com esses filtros.</p>}
        <div className="table-footer"><span>Mostrando {shownPatients.length} de {patients.length} pacientes</span></div>
      </section>
    </>
  )
}

export default PatientsPage
