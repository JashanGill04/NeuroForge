import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FAQS } from '../../data/landingContent'

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <section className="landing-section landing-section-tight" id="faq">
      <span className="section-eyebrow">FAQ</span>
      <h2 className="section-title">Common questions</h2>
      <div className="faq-list">
        {FAQS.map((f, i) => (
          <div className="faq-item" key={f.q} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="faq-question">
              {f.q}
              <ChevronDown size={16} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            {openFaq === i && <div className="faq-answer">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
