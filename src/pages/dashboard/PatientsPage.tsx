import { useState } from 'react'
import { ClipboardList, Search, UserPlus } from 'lucide-react'

type DirectoryPatient = {
  initials: string
  name: string
  email: string
  diagnosis: string
  age: number
  average: number
  adherence: number
  status: string
  tone: 'urgent' | 'warn' | 'good'
  color: string
}

const patients: DirectoryPatient[] = [
  { initials: 'ML', name: 'Marcos Lima', email: 'marcos.lima@email.com', diagnosis: 'Tipo 1', age: 32, average: 96, adherence: 70, status: 'Hipoglicemia', tone: 'urgent', color: '#d97756' },
  { initials: 'BN', name: 'Beatriz Nogueira', email: 'beatriz.n@email.com', diagnosis: 'Tipo 2', age: 45, average: 210, adherence: 54, status: 'Hiperglicemia', tone: 'urgent', color: '#5b8fe0' },
  { initials: 'JP', name: 'João Paz', email: 'joao.paz@email.com', diagnosis: 'Tipo 2', age: 58, average: 138, adherence: 61, status: 'Adesão baixa', tone: 'warn', color: '#8b6fe0' },
  { initials: 'AS', name: 'Alex Santos', email: 'alex.santos@email.com', diagnosis: 'Tipo 1', age: 27, average: 112, adherence: 92, status: 'Controlado', tone: 'good', color: '#2f7a52' },
  { initials: 'CF', name: 'Carla Ferreira', email: 'carla.f@email.com', diagnosis: 'Gestacional', age: 31, average: 104, adherence: 88, status: 'Controlado', tone: 'good', color: '#d46fa6' },
  { initials: 'RT', name: 'Rafael Teixeira', email: 'rafael.t@email.com', diagnosis: 'Tipo 1', age: 19, average: 118, adherence: 95, status: 'Controlado', tone: 'good', color: '#2f7a52' },
]

type PatientsPageProps = {
  onAddPatient: () => void
  onOpenProfile: () => void
  onOpenRecords: () => void
}

function PatientsPage({ onAddPatient, onOpenProfile, onOpenRecords }: PatientsPageProps) {
  const [query, setQuery] = useState('')
  const [diagnosis, setDiagnosis] = useState('Todos')
  const [status, setStatus] = useState('Todos')
  const shownPatients = patients.filter((patient) => {
    const matchesQuery = `${patient.name} ${patient.email}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (diagnosis === 'Todos' || patient.diagnosis === diagnosis) && (status === 'Todos' || patient.status === status)
  })

  return (
    <>
      <header className="dashboard-header page-toolbar patients-toolbar">
        <div><h1>Todos os pacientes</h1><p>86 pacientes ativos sob seu acompanhamento</p></div>
        <button className="primary-button" type="button" onClick={onAddPatient}><UserPlus />Cadastrar paciente</button>
      </header>
      <div className="directory-filters">
        <label className="patient-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou e-mail..." aria-label="Buscar pacientes" /></label>
        <label className="select-filter"><span>Tipo</span><select value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)}><option>Todos</option><option>Tipo 1</option><option>Tipo 2</option><option>Gestacional</option></select></label>
        <label className="select-filter"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Hipoglicemia</option><option>Hiperglicemia</option><option>Adesão baixa</option><option>Controlado</option></select></label>
      </div>
      <section className="dashboard-card table-card" aria-label="Lista de pacientes">
        <div className="responsive-table"><table className="data-table patients-table"><thead><tr><th>Paciente</th><th>Tipo</th><th>Idade</th><th>Média glicêmica</th><th>Adesão</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{shownPatients.map((patient) => <tr key={patient.email}>
            <td><span className="table-person"><span className="table-avatar" style={{ background: patient.color }}>{patient.initials}</span><span><strong>{patient.name}</strong><small>{patient.email}</small></span></span></td>
            <td>{patient.diagnosis}</td><td>{patient.age} anos</td><td>{patient.average} mg/dL</td>
            <td><span className="adherence-track"><span className={patient.tone} style={{ width: `${patient.adherence}%` }} /></span><small className="adherence-value">{patient.adherence}%</small></td>
            <td><span className={`status-badge ${patient.tone}`}>{patient.status}</span></td>
            <td><div className="table-actions"><button className="outline-button" type="button" onClick={onOpenProfile}>Perfil</button><button className="icon-button" type="button" aria-label={`Ver registros de ${patient.name}`} onClick={onOpenRecords}><ClipboardList /></button></div></td>
          </tr>)}</tbody>
        </table></div>
        {shownPatients.length === 0 && <p className="empty-results">Nenhum paciente encontrado com esses filtros.</p>}
        <div className="table-footer"><span>Mostrando {shownPatients.length} de 86 pacientes</span><div><button className="outline-button" type="button" disabled>Anterior</button><button className="outline-button" type="button" disabled>Próxima</button></div></div>
      </section>
    </>
  )
}

export default PatientsPage
