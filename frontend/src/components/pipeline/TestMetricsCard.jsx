import { Pencil } from 'lucide-react'

export default function TestMetricsCard({ tests }) {
  if (!tests) return null
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(tests.coveragePercent, 100) / 100)

  return (
    <div>
      <h3 className="bd-section-title">
        <Pencil size={14} /> Quality &amp; Test Metrics
      </h3>
      <div className="panel bd-test-panel">
        <div className="bd-gauge-wrap">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--line)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke="var(--accent-3)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="bd-gauge-center">
            <div className="bd-gauge-value">{tests.coveragePercent.toFixed(1)}%</div>
            <div className="bd-gauge-label">Overall Coverage</div>
          </div>
        </div>
        <div className="bd-test-summary-row">
          <div className="bd-test-summary-cell bd-test-summary-pass">
            <div className="bd-test-summary-value">{tests.passed}</div>
            <div className="bd-test-summary-label">Passed</div>
          </div>
          <div className="bd-test-summary-cell bd-test-summary-fail">
            <div className="bd-test-summary-value">{tests.failed}</div>
            <div className="bd-test-summary-label">Failed</div>
          </div>
          <div className="bd-test-summary-cell bd-test-summary-skip">
            <div className="bd-test-summary-value">{tests.skipped}</div>
            <div className="bd-test-summary-label">Skipped</div>
          </div>
        </div>
      </div>
    </div>
  )
}
