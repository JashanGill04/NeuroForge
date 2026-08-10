import { TESTIMONIALS } from '../../data/landingContent'

export default function TestimonialsSection() {
  return (
    <section className="landing-section">
      <span className="section-eyebrow">What the team says</span>
      <h2 className="section-title">Built by the team, for the team</h2>
      <div className="testimonial-grid">
        {TESTIMONIALS.map((t) => (
          <div className="testimonial-card" key={t.name}>
            <p className="testimonial-quote">"{t.quote}"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{t.name[0]}</div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
