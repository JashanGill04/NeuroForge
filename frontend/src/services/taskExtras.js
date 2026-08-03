// ---------------------------------------------------------------------------
// Task "extras" — description + comments — UI-only for now
// ---------------------------------------------------------------------------
// The Task entity on the backend currently only has: title, points, status,
// assigneeId, isBlocked, completedAt. There is no description or comment
// field yet. Per the handoff note: "Make the frontend using the available
// backend data, I will add the option to store comments and description
// later on — just make the UI." So this module keeps description/comments
// in memory only, keyed by task id, for the current browser session. Nothing
// here is sent to the backend and nothing survives a page reload — that's
// expected until the backend adds real fields/endpoints for it.
// ---------------------------------------------------------------------------

const extras = new Map() // taskId -> { description, comments: [{id, author, text, createdAt}] }
let commentSeq = 1

function ensure(taskId) {
  if (!extras.has(taskId)) {
    extras.set(taskId, { description: '', comments: [] })
  }
  return extras.get(taskId)
}

export function getTaskExtras(taskId) {
  return ensure(taskId)
}

export function setTaskDescription(taskId, description) {
  const entry = ensure(taskId)
  entry.description = description
  return entry
}

export function addTaskComment(taskId, author, text) {
  const entry = ensure(taskId)
  const comment = { id: commentSeq++, author, text, createdAt: new Date().toISOString() }
  entry.comments = [...entry.comments, comment]
  return comment
}
