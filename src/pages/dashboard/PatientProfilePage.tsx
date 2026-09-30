import { Activity, CalendarClock, ChartNoAxesCombined, Check, ClipboardList, Droplet } from 'lucide-react'
import GlycemiaTrendChart from './GlycemiaTrendChart'

type PatientProfilePageProps = {
  onOpenRecords: () => void
  onBackToPatients: () => void
}

function PatientProfilePage({ onOpenRecords, onBackToPatients }: PatientProfilePageProps) {
  return (
    <>
      <header className="profile-banner">
        <div className="profile-identity"><span className="profile-avatar">AS</span><div><h1>Alex Santos</h1><p>Paciente desde janeiro de 2025</p><div className="profile-meta"><span><Droplet />Tipo 1</span><span><CalendarClock />27 anos</span><span><Activity />Meta 70–140 mg/dL</span></div></div></div>
        <div className="profile-actions"><button className="profile-light-button" type="button" onClick={onOpenRecords}><ClipboardList />Ver registros</button><button className="profile-outline-button" type="button" onClick={onBackToPatients}>Pacientes</button></div>
      </header>
      <div className="profile-tabs"><span className="selected">Visão geral</span><button type="button" onClick={onOpenRecords}>Registros</button><button type="button" onClick={onOpenRecords}>Histórico completo</button></div>
      <section className="profile-stats" aria-label="Indicadores do paciente">
        <article className="profile-stat"><span className="metric-icon good"><Droplet /></span><div><strong>112 <small>mg/dL</small></strong><p>Média dos últimos 7 dias</p></div></article>
        <article className="profile-stat"><span className="metric-icon info"><ChartNoAxesCombined /></span><div><strong>6,1%</strong><p>HbA1c estimada</p></div></article>
        <article className="profile-stat"><span className="metric-icon warn"><Check /></span><div><strong>92%</strong><p>Adesão ao registro</p></div></article>
        <article className="profile-stat"><span className="metric-icon info"><Activity /></span><div><strong>34,2 U</strong><p>Insulina média por dia</p></div></article>
      </section>
      <div className="profile-lower-grid">
        <section className="dashboard-card"><div className="card-heading"><div><h2>Glicemia</h2><p>Últimos 14 dias</p></div><span className="period-chip">14 dias</span></div><GlycemiaTrendChart /></section>
        <section className="dashboard-card clinical-notes"><div className="card-heading"><div><h2>Notas clínicas</h2><p>Acompanhamento recente</p></div></div>
          <div className="note-row"><span className="note-marker info" /><div><strong>Ajuste de dose basal</strong><p>Reduzida insulina lenta para 18U · 14 ago</p></div></div>
          <div className="note-row"><span className="note-marker good" /><div><strong>Consulta de retorno</strong><p>Boa adaptação à bomba de insulina · 02 ago</p></div></div>
          <div className="note-row"><span className="note-marker warn" /><div><strong>Episódio leve de hipoglicemia</strong><p>Associado a exercício não compensado · 26 jul</p></div></div>
        </section>
      </div>
    </>
  )
}

export default PatientProfilePage
