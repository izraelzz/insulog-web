import { useState } from 'react'
import type { FormEvent } from 'react'
import { login, registerDoctor } from '../services/authService'
import './LoginPage.css'

type LoginPageProps = {
  onLogin: (user: Awaited<ReturnType<typeof login>>) => void
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="field-icon">
      <path d="M3 6h18v12H3z" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="field-icon">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [crm, setCrm] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      if (isRegistering) {
        await registerDoctor(name, email, password, crm)
        setIsRegistering(false)
        setPassword('')
        setErrorMessage('Conta criada. Entre com seu e-mail e senha.')
        setIsSubmitting(false)
        return
      }

      const user = await login(email, password)
      setIsSubmitting(false)
      onLogin(user)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro ao entrar.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-logo" aria-hidden="true">I</div>
        <h1 id="login-title">Insulog</h1>
        <p className="login-subtitle">{isRegistering ? 'Crie seu acesso profissional' : 'Gestão de pacientes'}</p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div className="form-field">
                <label htmlFor="name">Nome completo</label>
                <div className="input-wrapper">
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="crm">CRM</label>
                <div className="input-wrapper">
                  <input
                    id="crm"
                    type="text"
                    placeholder="Número e UF, se aplicável"
                    value={crm}
                    onChange={(event) => setCrm(event.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <div className="input-wrapper">
              <MailIcon />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Insira seu e-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <LockIcon />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isRegistering ? 8 : undefined}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {!isRegistering && <div className="form-options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Manter conectado
            </label>
            <a href="#forgot-password" className="primary-link">Esqueci minha senha</a>
          </div>}

          {errorMessage && <p className={errorMessage.startsWith('Conta criada') ? 'login-success' : 'login-error'} role="status">{errorMessage}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isRegistering ? 'Criando conta...' : 'Entrando...') : (isRegistering ? 'Criar conta médica' : 'Entrar')}
          </button>
        </form>

        {!isRegistering && <>
        <div className="divider" role="separator"><span>CRM verificado por</span></div>

        <div className="secondary-actions">
          <button type="button" className="secondary-button">CFM SSO</button>
          <button type="button" className="secondary-button">Token</button>
        </div>
        </>}

        <p className="login-footer">
          {isRegistering ? 'Já tem uma conta? ' : 'Ainda não tem conta? '}
          <button
            type="button"
            className="text-button primary-link"
            onClick={() => {
              setErrorMessage('')
              setIsRegistering((registering) => !registering)
            }}
          >
            {isRegistering ? 'Entrar' : 'Criar conta médica'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
