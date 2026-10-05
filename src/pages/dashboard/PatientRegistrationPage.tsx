import { useState } from 'react'
import { Activity, Check, Copy, UserPlus } from 'lucide-react'
import { createPatientInvite } from '../../services/patientService'

type PatientRegistrationPageProps = { token: string }

function PatientRegistrationPage({ token }: PatientRegistrationPageProps) {
  const [invite, setInvite] = useState<{ codigo: string; expira_em: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function addPatient() {
    setIsCreating(true)
    setErrorMessage('')
    setCopied(false)

    try {
      setInvite(await createPatientInvite(token))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível gerar o código de vínculo.')
    } finally {
      setIsCreating(false)
    }
  }

  async function copyLinkCode() {
    if (!invite) return

    try {
      await navigator.clipboard.writeText(invite.codigo)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <header className="dashboard-header patient-registration-header">
        <div><h1>Cadastrar paciente</h1><p>Crie um código para o paciente vincular o Insulog mobile.</p></div>
      </header>
      <div className="registration-layout">
        <section className="dashboard-card registration-card" aria-labelledby="registration-title">
          <div className="registration-step"><span>1</span><div><h2 id="registration-title">Vínculo do paciente</h2><p>Não é necessário preencher dados pessoais nesta etapa.</p></div></div>
          {invite ? (
            <div className="generated-code-panel" role="status" aria-live="polite">
              <span className="generated-code-label">Código de vínculo</span>
              <strong className="generated-code">{invite.codigo}</strong>
              <p>Compartilhe com o paciente. O código expira em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(invite.expira_em))} e só pode ser usado uma vez.</p>
              <div className="code-actions">
                <button className="primary-button" type="button" onClick={copyLinkCode}>{copied ? <Check /> : <Copy />}{copied ? 'Código copiado' : 'Copiar código'}</button>
                <button className="outline-button" type="button" onClick={addPatient} disabled={isCreating}>{isCreating ? 'Gerando...' : 'Gerar outro código'}</button>
              </div>
            </div>
          ) : (
            <div className="registration-empty">
              <span className="registration-icon"><UserPlus /></span>
              <h3>Pronto para criar um vínculo?</h3>
              <p>Gere um código exclusivo para o paciente conectar a conta no aplicativo.</p>
              {errorMessage && <p className="registration-error" role="alert">{errorMessage}</p>}
              <button className="primary-button" type="button" onClick={addPatient} disabled={isCreating}>{isCreating ? 'Gerando código...' : <><UserPlus />Adicionar paciente</>}</button>
            </div>
          )}
        </section>
        <aside className="dashboard-card registration-info">
          <span className="registration-info-icon"><Activity /></span>
          <h2>Vínculo com o app</h2>
          <p>O paciente informa o código no Insulog mobile para conectar a conta ao seu acompanhamento.</p>
          <div className="link-status"><span className={invite ? 'status-dot ready' : 'status-dot'} />{invite ? 'Código pronto para compartilhar' : 'Aguardando geração do código'}</div>
        </aside>
      </div>
    </>
  )
}

export default PatientRegistrationPage
