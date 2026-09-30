import { useState } from 'react'
import { Activity, Check, Copy, UserPlus } from 'lucide-react'

function PatientRegistrationPage() {
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function addPatient() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const randomValues = crypto.getRandomValues(new Uint8Array(6))
    const code = Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join('')
    setLinkCode(`INSU-${code}`)
    setCopied(false)
  }

  async function copyLinkCode() {
    if (!linkCode) return

    try {
      await navigator.clipboard.writeText(linkCode)
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
          {linkCode ? (
            <div className="generated-code-panel" role="status" aria-live="polite">
              <span className="generated-code-label">Código de vínculo</span>
              <strong className="generated-code">{linkCode}</strong>
              <p>Compartilhe este código com o paciente para ele conectar a conta no aplicativo.</p>
              <div className="code-actions">
                <button className="primary-button" type="button" onClick={copyLinkCode}>{copied ? <Check /> : <Copy />}{copied ? 'Código copiado' : 'Copiar código'}</button>
                <button className="outline-button" type="button" onClick={addPatient}>Adicionar outro paciente</button>
              </div>
            </div>
          ) : (
            <div className="registration-empty">
              <span className="registration-icon"><UserPlus /></span>
              <h3>Pronto para criar um vínculo?</h3>
              <p>Ao adicionar o paciente, um código exclusivo será gerado para conectar o aplicativo.</p>
              <button className="primary-button" type="button" onClick={addPatient}><UserPlus />Adicionar paciente</button>
            </div>
          )}
        </section>
        <aside className="dashboard-card registration-info">
          <span className="registration-info-icon"><Activity /></span>
          <h2>Vínculo com o app</h2>
          <p>O paciente informa o código no Insulog mobile para conectar a conta ao seu acompanhamento.</p>
          <div className="link-status"><span className={linkCode ? 'status-dot ready' : 'status-dot'} />{linkCode ? 'Código pronto para compartilhar' : 'Aguardando geração do código'}</div>
        </aside>
      </div>
    </>
  )
}

export default PatientRegistrationPage
