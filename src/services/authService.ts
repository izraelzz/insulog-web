export type AuthenticatedUser = {
  id: number
  username: string
  email: string
  tipo_usuario: string
}

type LoginResponse = {
  user: AuthenticatedUser
  message?: string
  error?: string
}

type RegistrationResponse = {
  message?: string
  error?: string
}

export async function login(email: string, password: string): Promise<AuthenticatedUser> {
  let response: Response

  try {
    response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está rodando.')
  }

  const result = await response.json() as LoginResponse

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Não foi possível entrar.')
  }

  if (!result.user || result.user.tipo_usuario.toLowerCase() !== 'medico') {
    throw new Error('Esta plataforma é exclusiva para profissionais médicos.')
  }

  return result.user
}

export async function registerDoctor(
  name: string,
  email: string,
  password: string,
  crm: string,
): Promise<void> {
  let response: Response

  try {
    response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: name,
        email,
        senha: password,
        tipo_login: 'email',
        tipo_usuario: 'medico',
        crm,
      }),
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está rodando.')
  }

  const result = await response.json() as RegistrationResponse

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Não foi possível criar a conta.')
  }
}