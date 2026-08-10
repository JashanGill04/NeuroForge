import { Activity, Clock } from 'lucide-react'
import { STATUS_BADGE } from './pipelineConstants'

export default function BuildStagesTimeline({ stages }) {
  return (
    <div className="bd-stages-col">
      <h3 className="bd-section-title">
        <Activity size={14} /> Execution Pipeline Stages
      </h3>
      <div className="panel bd-stage-panel">
        {stages?.map((stage, i) => {
          const badge = STATUS_BADGE[stage.status] || STATUS_BADGE.PENDING
          const isLast = i === stages.length - 1
          return (
            <div className="bd-stage-row" key={i}>
              <div className="bd-stage-marker-col">
                <span className="bd-stage-icon">
                  <badge.Icon size={14} />
                </span>
                {!isLast && <span className="bd-stage-connector" />}
              </div>
              <div className="bd-stage-body">
                <span className="bd-stage-name">{stage.name}</span>
                <span className="bd-stage-duration"><Clock size={12} /> {stage.durationSeconds}s</span>
              </div>
              <span className={`badge ${badge.cls}`}><badge.Icon size={12} /> {badge.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
