import { API_BASE_URL } from './apiConfig'

export type PatientSituation = 'adequado' | 'atencao' | 'critico'

export type DoctorPatient = {
  id: number
  nome: string
  email: string
  media_glicose_7_dias: number | null
  registros_7_dias: number
  ultimo_registro: string | null
  ultima_glicose: number | null
  situacao: PatientSituation
  motivo_situacao: string
}

export type PatientGlucoseRecord = {
  id_registro: number
  id_usuario: number
  nivel_glicose: number
  data_hora: string
  periodo: string | null
  insulina: string | null
}

export type PatientInvite = {
  codigo: string
  expira_em: string
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/medicos${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está rodando.')
  }

  const result = await response.json().catch(() => null) as { message?: string; error?: string } | T | null
  if (!response.ok) {
    const error = result && typeof result === 'object' && ('message' in result || 'error' in result)
      ? result as { message?: string; error?: string }
      : null
    throw new Error(error?.message || error?.error || 'Não foi possível carregar os dados do paciente.')
  }

  return result as T
}

export function createPatientInvite(token: string): Promise<PatientInvite> {
  return request('/vinculos', token, { method: 'POST' })
}

export function fetchDoctorPatients(token: string): Promise<DoctorPatient[]> {
  return request('/pacientes', token)
}

export function fetchDoctorPatient(token: string, patientId: number): Promise<DoctorPatient> {
  return request(`/pacientes/${patientId}`, token)
}

export function fetchPatientRecords(token: string, patientId: number): Promise<PatientGlucoseRecord[]> {
  return request(`/pacientes/${patientId}/registros`, token)
}
