import { STACK } from '../../data/landingContent'

export default function StackSection() {
  return (
    <section className="landing-section landing-section-tight" id="stack">
      <span className="section-eyebrow">Technology stack</span>
      <h2 className="section-title">Built on a proven, production-grade stack</h2>
      <div className="stack-grid">
        {STACK.map((s) => (
          <div className="stack-item" key={s}>{s}</div>
        ))}
      </div>
    </section>
  )
}
