import { motion } from 'framer-motion'
import { FEATURES, fadeUp, stagger } from '../../data/landingContent'

export default function FeaturesSection() {
  return (
    <section className="landing-section" id="features">
      <span className="section-eyebrow">Product overview</span>
      <h2 className="section-title">Everything a delivery team needs</h2>
      <p className="section-lede">From backlog to burndown, NeuroForge Nexus keeps every role — Admin, PM, Developer, Tester and DevOps — working from the same source of truth.</p>
      <motion.div
        className="feature-grid"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        {FEATURES.map((f) => (
          <motion.div className="feature-card" key={f.title} variants={fadeUp}>
            <div className="feature-icon"><f.Icon size={20} /></div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
