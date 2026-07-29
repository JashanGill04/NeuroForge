export default function SprintSelector({ projects,sprintName ,projectId, setProjectId, sprints, sprintId, setSprintId, loadingSprints }) {
  return (
    <div className="sprint-selector">
      <label className="field field-inline">
        <span>Project</span>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.length === 0 && <option value="">No projects yet</option>}
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field field-inline">
        <span>Sprint</span>
        <select value={sprintId} onChange={(e) => setSprintId(e.target.value)} disabled={loadingSprints || sprints.length === 0}>
          {sprints.length === 0 && <option value="">No sprints yet</option>}
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
  {s.name} ({s.startDate} to {s.endDate})
</option>
          ))}
        </select>
      </label>
    </div>
  )
}
