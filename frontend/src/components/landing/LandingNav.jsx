import ThemeToggle from '../ThemeToggle'

export default function LandingNav({ onLogin }) {
  return (
    <nav className="landing-nav">
      <div className="landing-nav-brand">
        <span className="brand-mark">NF</span>
        NeuroForge Nexus
      </div>
      <div className="landing-nav-links">
        <a href="#features">Features</a>
        <a href="#stack">Stack</a>
        <a href="#roadmap">Roadmap</a>
        <a href="#faq">FAQ</a>
      </div>
      <button className="btn-primary" onClick={onLogin}>Sign in</button>
      <ThemeToggle className="landing-theme-toggle" />
    </nav>
  )
}
