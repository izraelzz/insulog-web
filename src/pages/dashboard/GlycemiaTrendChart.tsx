function GlycemiaTrendChart() {
  return (
    <div className="chart" role="img" aria-label="Tendência demonstrativa da média glicêmica ao longo de quatro semanas">
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
        <path className="chart-area" d="M58 58 C98 64 118 91 142 87 S197 65 222 78 S276 116 302 112 S357 93 382 105 S436 142 462 137 S517 117 542 128 S596 165 622 158 S677 137 702 149 S758 184 782 177 S838 159 862 169 S934 197 988 190 V226 H58 Z" />
        <path className="chart-line" d="M58 58 C98 64 118 91 142 87 S197 65 222 78 S276 116 302 112 S357 93 382 105 S436 142 462 137 S517 117 542 128 S596 165 622 158 S677 137 702 149 S758 184 782 177 S838 159 862 169 S934 197 988 190" />
        <g className="chart-points">
          <circle cx="58" cy="58" r="5" /><circle cx="302" cy="112" r="5" /><circle cx="542" cy="128" r="5" /><circle cx="782" cy="177" r="5" /><circle cx="988" cy="190" r="5" />
        </g>
      </svg>
      <div className="chart-labels"><span>Semana 1</span><span>Semana 2</span><span>Semana 3</span><span>Semana 4</span></div>
    </div>
  )
}

export default GlycemiaTrendChart
