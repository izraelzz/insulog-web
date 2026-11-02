import { useState, type FormEvent } from 'react'
import { CalendarDays, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { downloadPatientReport, type ReportFormat } from '../../services/reportService'
import type { DoctorPatient } from '../../services/patientService'

type ReportExportPageProps = {
  patients: DoctorPatient[]
  patientsLoading: boolean
  patientsError: string
  token: string
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function currentWeekRange() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: formatDateInput(start), end: formatDateInput(end) }
}

function ReportExportPage({ patients, patientsLoading, patientsError, token }: ReportExportPageProps) {
  const [patientId, setPatientId] = useState('')
  const [period, setPeriod] = useState(currentWeekRange)
  const [format, setFormat] = useState<ReportFormat>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedPatient = patients.find((patient) => patient.id === Number(patientId))

  function selectCurrentWeek() {
    setPeriod(currentWeekRange())
  }

  function selectCurrentMonth() {
    const now = new Date()
    setPeriod({
      start: formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    })
  }

  async function handleExport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedPatient) {
      setError('Selecione um paciente vinculado para exportar o relatório.')
      return
    }

    if (period.start > period.end) {
      setError('A data inicial não pode ser posterior à data final.')
      return
    }

    setIsExporting(true)
    try {
      await downloadPatientReport({
        token,
        patientId: selectedPatient.id,
        start: period.start,
        end: period.end,
        format,
      })
      setSuccess(`Relatório de ${selectedPatient.nome} baixado com sucesso.`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível gerar o relatório.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <header className="dashboard-header page-toolbar">
        <div>
          <h1>Relatórios</h1>
          <p>Exporte os dados de glicose e insulina de um paciente vinculado.</p>
        </div>
      </header>

      <form className="report-export-form" onSubmit={handleExport}>
        <section className="dashboard-card report-export-card">
          <div className="card-heading">
            <div>
              <h2>Paciente</h2>
              <p>Escolha para quem o relatório será gerado.</p>
            </div>
          </div>
          <label className="report-field">
            <span>Paciente vinculado</span>
            <select
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              disabled={patientsLoading || patients.length === 0}
              required
            >
              <option value="">
                {patientsLoading ? 'Carregando pacientes...' : 'Selecione um paciente'}
              </option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.nome}</option>
              ))}
            </select>
          </label>
          {patientsError && <p className="report-feedback error" role="alert">{patientsError}</p>}
          {!patientsLoading && !patientsError && patients.length === 0 && (
            <p className="report-hint">Nenhum paciente vinculado disponível para exportação.</p>
          )}
        </section>

        <section className="dashboard-card report-export-card">
          <div className="card-heading">
            <div>
              <h2>Período do relatório</h2>
              <p>Defina as datas ou use um período rápido.</p>
            </div>
            <CalendarDays aria-hidden="true" />
          </div>
          <div className="report-period-presets" aria-label="Períodos rápidos">
            <button type="button" className="outline-button" onClick={selectCurrentWeek}>Semana atual</button>
            <button type="button" className="outline-button" onClick={selectCurrentMonth}>Mês atual</button>
          </div>
          <div className="report-date-fields">
            <label className="report-field">
              <span>Data inicial</span>
              <input
                type="date"
                value={period.start}
                onChange={(event) => setPeriod((current) => ({ ...current, start: event.target.value }))}
                required
              />
            </label>
            <label className="report-field">
              <span>Data final</span>
              <input
                type="date"
                value={period.end}
                onChange={(event) => setPeriod((current) => ({ ...current, end: event.target.value }))}
                required
              />
            </label>
          </div>
        </section>

        <section className="dashboard-card report-export-card">
          <div className="card-heading">
            <div>
              <h2>Formato do arquivo</h2>
              <p>Selecione como deseja receber o relatório.</p>
            </div>
          </div>
          <div className="report-format-options">
            <label className={`report-format-option ${format === 'pdf' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="report-format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
              />
              <FileText aria-hidden="true" />
              <span><strong>PDF</strong><small>Formato para leitura e compartilhamento.</small></span>
            </label>
            <label className={`report-format-option ${format === 'xlsx' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="report-format"
                value="xlsx"
                checked={format === 'xlsx'}
                onChange={() => setFormat('xlsx')}
              />
              <FileSpreadsheet aria-hidden="true" />
              <span><strong>Planilha Excel</strong><small>Compatível com Excel e Google Sheets.</small></span>
            </label>
          </div>
        </section>

        {error && <p className="report-feedback error" role="alert">{error}</p>}
        {success && <p className="report-feedback success" role="status">{success}</p>}
        <div className="report-export-actions">
          <button
            className="primary-button"
            type="submit"
            disabled={isExporting || patientsLoading || !selectedPatient}
          >
            <Download aria-hidden="true" />
            {isExporting ? 'Gerando relatório...' : 'Exportar relatório'}
          </button>
        </div>
      </form>
    </>
  )
}

export default ReportExportPage
