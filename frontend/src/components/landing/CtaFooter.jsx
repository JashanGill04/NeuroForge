export default function CtaFooter({ onLogin }) {
  return (
    <>
      <div className="cta-panel">
        <h2>Ready to see your projects in one place?</h2>
        <p>Sign in with your NeuroForge Nexus account to get started.</p>
        <button className="cta-btn" onClick={onLogin}>Login / Register</button>
      </div>

      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} NeuroForge Nexus. All rights reserved.</div>
        <div className="landing-footer-links">
          <a href="#features">Features</a>
          <a href="#stack">Stack</a>
          <a href="#faq">FAQ</a>
        </div>
      </footer>
    </>
  )
}
