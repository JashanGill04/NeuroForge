import { STATS } from '../../data/landingContent'

export default function StatsBand() {
  return (
    <section className="landing-section landing-section-tight">
      <div className="stats-band">
        {STATS.map((s) => (
          <div className="stat-band-item" key={s.label}>
            <div className="stat-band-value">{s.value}</div>
            <div className="stat-band-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
