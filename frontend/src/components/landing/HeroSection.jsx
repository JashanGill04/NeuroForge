import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { fadeUp, stagger } from '../../data/landingContent'

export default function HeroSection({ onLogin }) {
  return (
    <section className="hero">
      <div className="hero-grid" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
      <div className="hero-glow" />
      <motion.div className="hero-content" initial="hidden" animate="show" variants={stagger}>
        <motion.span className="section-eyebrow" variants={fadeUp}>
          <Sparkles size={13} /> Cloud-native SDLC platform
        </motion.span>
        <motion.h1 className="hero-title" variants={fadeUp}>
          Ship software with <span className="hero-gradient-text">one connected platform</span>
        </motion.h1>
        <motion.p className="hero-subtitle" variants={fadeUp}>
          NeuroForge Nexus brings project tracking, agile sprints and DevOps visibility into a single
          enterprise-grade workspace — built on Spring Boot, Kafka and Keycloak.
        </motion.p>
        <motion.div className="hero-actions" variants={fadeUp}>
          <button className="btn-primary btn-lg" onClick={onLogin}>Login / Register</button>
        </motion.div>
        <motion.div className="hero-chip-row" variants={fadeUp}>
          <span className="hero-chip">Project Tracking</span>
          <span className="hero-chip">Agile Sprints</span>
          <span className="hero-chip">Kanban &amp; Burndown</span>
          <span className="hero-chip">DevOps Monitoring</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
