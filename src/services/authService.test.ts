import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from './apiConfig'
import { login, registerDoctor, wakeApi } from './authService'
import type { AuthenticatedUser } from './authService'

const doctor: AuthenticatedUser = {
  id: 17,
  username: 'Dra. Maria Silva',
  email: 'maria@example.com',
  tipo_usuario: 'medico',
  token: 'test-token',
}

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('authService', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('faz login com email e senha e retorna a conta médica', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user: doctor }))

    await expect(login(doctor.email, 'senha-segura')).resolves.toEqual(doctor)
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: doctor.email, password: 'senha-segura' }),
    })
  })

  it('mostra a mensagem da API para credenciais rejeitadas', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Usuário ou senha inválidos.' }, 401))

    await expect(login(doctor.email, 'senha-errada')).rejects.toThrow('Usuário ou senha inválidos.')
  })

  it('não permite que contas de paciente entrem no portal médico', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      user: { ...doctor, tipo_usuario: 'paciente' },
    }))

    await expect(login(doctor.email, 'senha-segura'))
      .rejects.toThrow('Esta plataforma é exclusiva para profissionais médicos.')
  })

  it('traduz falhas de conexão da API no login', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(login(doctor.email, 'senha-segura'))
      .rejects.toThrow('Não foi possível conectar à API. Verifique se o backend está rodando.')
  })

  it('envia os dados corretos ao cadastrar um médico', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Conta criada.' }, 201))

    await expect(registerDoctor('Maria Silva', doctor.email, 'senha-segura', '12345-SP'))
      .resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Maria Silva',
        email: doctor.email,
        senha: 'senha-segura',
        tipo_login: 'email',
        tipo_usuario: 'medico',
        crm: '12345-SP',
      }),
    })
  })

  it('acorda a API sem usar uma resposta armazenada em cache', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ mensagem: 'API rodando' }))

    await expect(wakeApi()).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/`, { cache: 'no-store' })
  })
})
