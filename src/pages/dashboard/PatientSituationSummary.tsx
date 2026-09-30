import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type PatientSituation = {
  title: string
  count: number
  percentage: number
  tone: 'adequate' | 'attention' | 'critical'
  icon: LucideIcon
}

const patientSituations: PatientSituation[] = [
  { title: 'Controle adequado', count: 62, percentage: 72, tone: 'adequate', icon: CircleCheck },
  { title: 'Atenção', count: 17, percentage: 20, tone: 'attention', icon: TriangleAlert },
  { title: 'Situação crítica', count: 7, percentage: 8, tone: 'critical', icon: CircleAlert },
]

function PatientSituationSummary() {
  return (
    <section className="dashboard-card patient-situation-card" aria-labelledby="patient-situation-title">
      <div className="card-heading">
        <div><h2 id="patient-situation-title">Situação dos pacientes</h2><p>Resumo dos 86 pacientes acompanhados</p></div>
      </div>
      <div className="patient-situation-grid">
        {patientSituations.map((situation) => {
          const SituationIcon = situation.icon
          return (
            <article className={`patient-situation-tile ${situation.tone}`} key={situation.title}>
              <div className="patient-situation-heading"><span className="patient-situation-icon"><SituationIcon /></span><h3>{situation.title}</h3></div>
              <div className="patient-situation-metrics">
                <p className="patient-situation-count"><strong>{situation.count}</strong><span>pacientes</span></p>
                <p className="patient-situation-percentage"><strong>{situation.percentage}%</strong><span>da base</span></p>
              </div>
              <div className="patient-situation-progress" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={situation.percentage} aria-label={`${situation.percentage}% da base`}>
                <span style={{ width: `${situation.percentage}%` }} />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default PatientSituationSummary
