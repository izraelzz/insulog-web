import { Mail, ShieldCheck, UserRound } from 'lucide-react'
import type { AuthenticatedUser } from '../../services/authService'
import { formatPersonName } from '../../utils/formatPersonName'

type DoctorProfilePageProps = {
  user: AuthenticatedUser
}

function DoctorProfilePage({ user }: DoctorProfilePageProps) {
  const initials = user.username.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <>
      <header className="dashboard-header page-toolbar doctor-profile-toolbar account-page-toolbar">
        <div><h1><span className="desktop-account-title">Perfil do médico</span><span className="mobile-account-title">Conta</span></h1><p>Informações da sua conta profissional.</p></div>
      </header>
      <div className="doctor-profile-layout">
        <section className="dashboard-card doctor-edit-card">
          <div className="doctor-edit-heading"><span className="doctor-profile-icon"><UserRound /></span><div><h2>Informações da conta</h2><p>Dados vinculados ao seu acesso profissional.</p></div></div>
          <div className="doctor-profile-form">
            <div className="profile-field"><span>Nome completo</span><span className="profile-input-wrap profile-readonly-value"><UserRound /><span>{user.username}</span></span></div>
            <div className="profile-field"><span>E-mail</span><span className="profile-input-wrap profile-readonly-value"><Mail /><span>{user.email}</span></span></div>
            <div className="profile-field account-type-field"><span>Tipo de conta</span><span className="account-type"><ShieldCheck />Profissional médico</span></div>
          </div>
        </section>
        <aside className="dashboard-card doctor-account-summary">
          <span className="doctor-summary-avatar">{initials || 'M'}</span>
          <h2>{formatPersonName(user.username) || 'Médico'}</h2>
          <p>{user.email}</p>
          <span className="doctor-summary-status"><span />Conta médica</span>
        </aside>
      </div>
    </>
  )
}

export default DoctorProfilePage
