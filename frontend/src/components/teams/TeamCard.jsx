import { UserPlus } from 'lucide-react'

export default function TeamCard({ team, canEdit, canRemove, onDelete, onAddMember }) {
  return (
    <div className="team-card">
      <div className="team-card-header">
        <h3>{team.name}</h3>
        {canRemove && (
          <button className="btn-danger-ghost" onClick={() => onDelete(team)}>
            Delete
          </button>
        )}
      </div>
      <div className="team-member-count">
        {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
      </div>
      {team.memberUsernames?.length > 0 ? (
        <ul className="chip-list">
          {team.memberUsernames.map((name) => (
            <li key={name} className="chip">{name}</li>
          ))}
        </ul>
      ) : (
        <div className="empty-sub">No members assigned yet</div>
      )}
      {canEdit && (
        <button className="btn-ghost-sm team-add-member-btn" onClick={() => onAddMember(team)}>
          <UserPlus size={14} /> Add member
        </button>
      )}
    </div>
  )
}
