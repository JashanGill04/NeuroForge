import { TIMELINE } from '../../data/landingContent'

export default function RoadmapSection() {
  return (
    <section className="landing-section" id="roadmap">
      <span className="section-eyebrow">Delivery timeline</span>
      <h2 className="section-title">Milestones, shipped in order</h2>
      <div className="timeline">
        {TIMELINE.map((t, i) => (
          <div className="timeline-item" key={t.phase}>
            <div className="timeline-phase">{t.phase}</div>
            <div className="timeline-marker-col">
              <div className="timeline-dot" />
              {i < TIMELINE.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-body">
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
