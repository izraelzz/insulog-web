import type { PatientGlucoseRecord } from '../../services/patientService'

type GlycemiaTrendChartProps = { records: PatientGlucoseRecord[] }

function GlycemiaTrendChart({ records }: GlycemiaTrendChartProps) {
  const readings = [...records].slice(0, 14).reverse()
  const points = readings.map((record, index) => {
    const x = readings.length === 1 ? 523 : 58 + index * (930 / (readings.length - 1))
    const y = 214 - Math.max(0, Math.min(180, record.nivel_glicose)) / 180 * 176
    return { x, y, value: record.nivel_glicose, date: record.data_hora }
  })
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
  const areaPath = points.length ? `${linePath} L${points.at(-1)?.x} 226 L${points[0].x} 226 Z` : ''

  if (readings.length === 0) return <p className="empty-results">Ainda não há medições de glicose para montar o gráfico.</p>

  return (
    <div className="chart" role="img" aria-label="Medições reais de glicose do paciente, em mg/dL">
      <svg viewBox="0 0 1000 250" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2f7a52" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2f7a52" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="chart-grid">
          <path d="M58 38H988M58 82H988M58 126H988M58 170H988M58 214H988" />
        </g>
        <g className="chart-y-labels">
          <text x="0" y="42">180</text><text x="0" y="86">150</text><text x="0" y="130">120</text><text x="0" y="174">90</text><text x="0" y="218">60</text>
        </g>
        <path className="chart-area" d={areaPath} />
        <path className="chart-line" d={linePath} />
        <g className="chart-points">{points.map((point, index) => <circle key={`${point.date}-${index}`} cx={point.x} cy={point.y} r="5"><title>{point.value} mg/dL</title></circle>)}</g>
      </svg>
      <div className="chart-labels"><span>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(readings[0].data_hora.replace(' ', 'T')))}</span><span>Últimas {readings.length} medições</span><span>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(readings.at(-1)!.data_hora.replace(' ', 'T')))}</span></div>
    </div>
  )
}

export default GlycemiaTrendChart
