import { useState } from 'react'
import type { FormEvent } from 'react'
import './LoginPage.css'

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

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    window.setTimeout(() => setIsSubmitting(false), 700)
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-logo" aria-hidden="true">I</div>
        <h1 id="login-title">Insulog</h1>
        <p className="login-subtitle">Gestão de pacientes</p>

        <form onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

          <div className="form-options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Manter conectado
            </label>
            <a href="#forgot-password" className="primary-link">Esqueci minha senha</a>
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="divider" role="separator"><span>CRM verificado por</span></div>

        <div className="secondary-actions">
          <button type="button" className="secondary-button">CFM SSO</button>
          <button type="button" className="secondary-button">Token</button>
        </div>

        <p className="login-footer">
          Ainda não tem acesso?{' '}
          <a href="#request-credentials" className="primary-link">Solicitar credencial médica</a>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
