import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Activity, CalendarDays, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { fetchPatientRecords, type PatientGlucoseRecord } from '../../services/patientService'
import { downloadPatientReport, type ReportFormat } from '../../services/reportService'
import type { DoctorPatient } from '../../services/patientService'
import { formatPersonName } from '../../utils/formatPersonName'

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
  return { start: formatDateInput(start), end: formatDateInput(today) }
}

function formatRecordDateTime(value: string) {
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`))
}

function ReportExportPage({ patients, patientsLoading, patientsError, token }: ReportExportPageProps) {
  const [patientId, setPatientId] = useState('')
  const [period, setPeriod] = useState(currentWeekRange)
  const [records, setRecords] = useState<PatientGlucoseRecord[]>([])
  const [recordsPatientId, setRecordsPatientId] = useState('')
  const [recordsError, setRecordsError] = useState('')
  const [format, setFormat] = useState<ReportFormat>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedPatient = patients.find((patient) => patient.id === Number(patientId))
  const isPeriodValid = Boolean(period.start && period.end && period.start <= period.end)
  const isPreviewLoading = Boolean(patientId) && recordsPatientId !== patientId
  const previewRecords = useMemo(() => records
    .filter((record) => {
      const recordDate = record.data_hora.slice(0, 10)
      return isPeriodValid && recordDate >= period.start && recordDate <= period.end
    })
    .sort((first, second) => second.data_hora.localeCompare(first.data_hora)), [isPeriodValid, period.end, period.start, records])
  const glucoseStats = previewRecords.reduce((stats, record) => ({
    sum: stats.sum + record.nivel_glicose,
    inRange: stats.inRange + (record.nivel_glicose >= 70 && record.nivel_glicose <= 140 ? 1 : 0),
    lowest: Math.min(stats.lowest, record.nivel_glicose),
    highest: Math.max(stats.highest, record.nivel_glicose),
  }), { sum: 0, inRange: 0, lowest: Number.POSITIVE_INFINITY, highest: Number.NEGATIVE_INFINITY })
  const averageGlucose = previewRecords.length ? Math.round(glucoseStats.sum / previewRecords.length) : null

  useEffect(() => {
    if (!patientId) return

    let isCurrent = true
    const selectedId = Number(patientId)

    fetchPatientRecords(token, selectedId)
      .then((result) => {
        if (isCurrent) {
          setRecords(result)
          setRecordsPatientId(patientId)
        }
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setRecordsError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar os registros do período.')
          setRecordsPatientId(patientId)
        }
      })

    return () => { isCurrent = false }
  }, [patientId, token])

  function selectCurrentWeek() {
    setPeriod(currentWeekRange())
    setError('')
    setSuccess('')
  }

  function selectCurrentMonth() {
    const now = new Date()
    setPeriod({
      start: formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    })
    setError('')
    setSuccess('')
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

    if (isPreviewLoading) return
    if (recordsError) {
      setError(recordsError)
      return
    }
    if (previewRecords.length === 0) {
      setError('Não há registros nesse intervalo para exportar.')
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
      setSuccess(`Relatório de ${formatPersonName(selectedPatient.nome)} baixado com sucesso.`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível gerar o relatório.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <header className="dashboard-header page-toolbar report-page-toolbar">
        <div>
          <h1>Relatórios</h1>
          <p>Exporte os dados de glicose e insulina de um paciente vinculado.</p>
        </div>
      </header>

      <form className="report-export-form" onSubmit={handleExport}>
        <section className="dashboard-card report-export-card">
          <div className="card-heading">
            <span className="mobile-report-step">01</span>
            <div className="report-card-heading-copy">
              <h2>Paciente</h2>
              <p>Escolha para quem o relatório será gerado.</p>
            </div>
          </div>
          <label className="report-field">
            <span>Paciente vinculado</span>
            <select
              value={patientId}
              onChange={(event) => {
                setPatientId(event.target.value)
                setRecordsPatientId('')
                setRecords([])
                setRecordsError('')
                setError('')
                setSuccess('')
              }}
              disabled={patientsLoading || patients.length === 0}
              required
            >
              <option value="">
                {patientsLoading ? 'Carregando pacientes...' : 'Selecione um paciente'}
              </option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{formatPersonName(patient.nome)}</option>
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
            <span className="mobile-report-step">02</span>
            <div className="report-card-heading-copy">
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
                onChange={(event) => {
                  setPeriod((current) => ({ ...current, start: event.target.value }))
                  setError('')
                  setSuccess('')
                }}
                required
              />
            </label>
            <label className="report-field">
              <span>Data final</span>
              <input
                type="date"
                value={period.end}
                onChange={(event) => {
                  setPeriod((current) => ({ ...current, end: event.target.value }))
                  setError('')
                  setSuccess('')
                }}
                required
              />
            </label>
          </div>
        </section>

        <section className="dashboard-card report-preview-card" aria-live="polite">
          <div className="report-preview-heading">
            <div>
              <span className="mobile-report-step">03</span>
              <h2>Prévia dos dados</h2>
              <p>
                {isPeriodValid
                  ? `${formatDateLabel(period.start)} a ${formatDateLabel(period.end)}`
                  : 'A data inicial não pode ser posterior à data final.'}
              </p>
            </div>
            <span className="report-preview-count">
              {isPreviewLoading ? 'Carregando...' : `${previewRecords.length} ${previewRecords.length === 1 ? 'registro' : 'registros'}`}
            </span>
          </div>

          {!patientId && <p className="report-preview-message">Selecione um paciente para consultar os dados disponíveis nesse intervalo.</p>}
          {patientId && isPreviewLoading && <p className="report-preview-message" role="status">Buscando os registros do paciente...</p>}
          {patientId && !isPreviewLoading && recordsError && <p className="report-feedback error" role="alert">{recordsError}</p>}
          {patientId && !isPreviewLoading && !recordsError && !isPeriodValid && <p className="report-preview-message" role="alert">Revise as datas para visualizar os registros.</p>}
          {patientId && !isPreviewLoading && !recordsError && isPeriodValid && previewRecords.length === 0 && (
            <p className="report-preview-message">Nenhum registro encontrado para {selectedPatient ? formatPersonName(selectedPatient.nome) : 'este paciente'} nesse intervalo. Ajuste as datas antes de exportar.</p>
          )}
          {patientId && !isPreviewLoading && !recordsError && isPeriodValid && previewRecords.length > 0 && (
            <>
              <div className="report-preview-metrics">
                <article><span>Total no período</span><strong>{previewRecords.length}</strong></article>
                <article><span>Média glicêmica</span><strong>{averageGlucose}<small> mg/dL</small></strong></article>
                <article><span>Dentro da meta (70–140)</span><strong>{glucoseStats.inRange}<small> de {previewRecords.length}</small></strong></article>
                <article><span>Menor / maior leitura</span><strong>{glucoseStats.lowest} / {glucoseStats.highest}<small> mg/dL</small></strong></article>
              </div>
              <div className="report-preview-table-wrap">
                <table className="data-table report-preview-table">
                  <thead><tr><th>Data e horário</th><th>Momento</th><th>Glicose</th><th>Insulina</th></tr></thead>
                  <tbody>
                    {previewRecords.map((record) => (
                      <tr key={record.id_registro}>
                        <td>{formatRecordDateTime(record.data_hora)}</td>
                        <td>{record.periodo || '—'}</td>
                        <td className="glucose-value">{record.nivel_glicose} mg/dL</td>
                        <td>{record.insulina || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="report-preview-footnote"><Activity aria-hidden="true" />A prévia lista todos os registros incluídos no arquivo exportado.</p>
            </>
          )}
        </section>

        <section className="dashboard-card report-export-card">
          <div className="card-heading">
            <span className="mobile-report-step">04</span>
            <div className="report-card-heading-copy">
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
        {!isPeriodValid && <p className="report-feedback error" role="alert">A data inicial não pode ser posterior à data final.</p>}
        <div className="report-export-actions">
          <button
            className="primary-button"
            type="submit"
            disabled={isExporting || patientsLoading || !selectedPatient || isPreviewLoading || Boolean(recordsError) || !isPeriodValid || previewRecords.length === 0}
          >
            <Download aria-hidden="true" />
            {isExporting ? 'Gerando relatório...' : !selectedPatient ? 'Selecione um paciente' : isPreviewLoading ? 'Carregando prévia...' : previewRecords.length === 0 ? 'Sem dados para exportar' : 'Exportar relatório'}
          </button>
        </div>
      </form>
    </>
  )
}

export default ReportExportPage
