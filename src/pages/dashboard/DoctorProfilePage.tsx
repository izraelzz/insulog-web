import { useState } from 'react'
import type { FormEvent } from 'react'
import { Mail, Save, ShieldCheck, UserRound, X } from 'lucide-react'
import type { AuthenticatedUser } from '../../services/authService'

type DoctorProfilePageProps = {
  user: AuthenticatedUser
  onSave: (updatedUser: AuthenticatedUser) => void
  onCancel: () => void
}

function DoctorProfilePage({ user, onSave, onCancel }: DoctorProfilePageProps) {
  const [name, setName] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [feedback, setFeedback] = useState('')
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const updatedUser = { ...user, username: name.trim(), email: email.trim() }
    onSave(updatedUser)
    setName(updatedUser.username)
    setEmail(updatedUser.email)
    setFeedback('Perfil atualizado nesta sessão.')
  }

  function handleCancel() {
    setName(user.username)
    setEmail(user.email)
    setFeedback('')
    onCancel()
  }

  return (
    <>
      <header className="dashboard-header page-toolbar doctor-profile-toolbar">
        <div><h1>Perfil do médico</h1><p>Gerencie as informações da sua conta profissional.</p></div>
      </header>
      <div className="doctor-profile-layout">
        <section className="dashboard-card doctor-edit-card">
          <div className="doctor-edit-heading"><span className="doctor-profile-icon"><UserRound /></span><div><h2>Informações da conta</h2><p>Atualize seu nome e e-mail de acesso.</p></div></div>
          <form className="doctor-profile-form" onSubmit={handleSubmit}>
            <label className="profile-field"><span>Nome completo</span><span className="profile-input-wrap"><UserRound /><input autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></span></label>
            <label className="profile-field"><span>E-mail</span><span className="profile-input-wrap"><Mail /><input type="email" autoComplete="email" required maxLength={180} value={email} onChange={(event) => setEmail(event.target.value)} /></span></label>
            <div className="profile-field"><span>Tipo de conta</span><span className="account-type"><ShieldCheck />Profissional médico</span></div>
            <div className="profile-form-footer">
              <span className="profile-feedback" role="status" aria-live="polite">{feedback}</span>
              <div><button className="outline-button" type="button" onClick={handleCancel}><X />Cancelar</button><button className="primary-button" type="submit"><Save />Salvar alterações</button></div>
            </div>
          </form>
        </section>
        <aside className="dashboard-card doctor-account-summary">
          <span className="doctor-summary-avatar">{initials || 'M'}</span>
          <h2>{name.trim() || 'Médico'}</h2>
          <p>{email}</p>
          <span className="doctor-summary-status"><span />Conta médica</span>
        </aside>
      </div>
    </>
  )
}

export default DoctorProfilePage
