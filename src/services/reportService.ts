import { API_BASE_URL } from './apiConfig'

export type ReportFormat = 'pdf' | 'xlsx'

type DownloadPatientReportOptions = {
  token: string
  patientId: number
  start: string
  end: string
  format: ReportFormat
}

const reportMimeTypes: Record<ReportFormat, string> = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

function hasExpectedSignature(bytes: Uint8Array, format: ReportFormat) {
  const signature = format === 'pdf' ? [37, 80, 68, 70, 45] : [80, 75, 3, 4]
  return signature.every((byte, index) => bytes[index] === byte)
}

function getErrorMessage(body: unknown) {
  if (body && typeof body === 'object') {
    const result = body as { message?: unknown; error?: unknown }
    if (typeof result.message === 'string') return result.message
    if (typeof result.error === 'string') return result.error
  }
  return 'Não foi possível gerar o relatório.'
}

export async function downloadPatientReport({
  token,
  patientId,
  start,
  end,
  format,
}: DownloadPatientReportOptions): Promise<void> {
  if (!Number.isSafeInteger(patientId) || patientId <= 0 || !start || !end || start > end) {
    throw new Error('Paciente ou período do relatório inválido.')
  }

  const query = new URLSearchParams({
    id_usuario: String(patientId),
    dataInicio: start,
    dataFim: end,
    formato: format,
  })

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/exportacoes/relatorio?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: reportMimeTypes[format],
      },
    })
  } catch {
    throw new Error('Não foi possível conectar à API para gerar o relatório.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as unknown
    throw new Error(getErrorMessage(body))
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0].trim()
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (mimeType !== reportMimeTypes[format] || !hasExpectedSignature(bytes, format)) {
    throw new Error('A API retornou um arquivo de relatório inválido.')
  }

  const extension = format
  const fallbackName = `relatorio-insulog-${patientId}-${start}-${end}.${extension}`
  const serverName = response.headers.get('content-disposition')
    ?.match(/filename="([a-zA-Z0-9._-]+)"/)?.[1]
  const filename = serverName?.endsWith(`.${extension}`) ? serverName : fallbackName
  const file = new Blob([bytes], { type: reportMimeTypes[format] })
  const downloadUrl = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}
