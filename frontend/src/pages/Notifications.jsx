import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import { EmptyState } from '../components/ui'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => notificationService.getAll().then(setNotifications).finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const markRead = async (id) => {
    await notificationService.markRead(id)
    load()
  }

  const markAllRead = async () => {
    await notificationService.markAllRead()
    load()
  }

  // NEW: Delete notification handler
  const deleteNotif = async (id) => {
    try {
      await notificationService.delete(id)
      load()
    } catch (error) {
      console.error('Failed to delete notification', error)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">
            Activity across your projects
          </p>
        </div>
        <button className="btn-ghost" onClick={markAllRead}>
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="empty-sub">Loading…</div>
        ) : notifications.length === 0 ? (
          <EmptyState title="You're all caught up" />
        ) : (
          <ul className="list">
            {notifications.map((n) => (
              <li key={n.name} className={`list-item notification-item ${n.read ? 'list-item-muted' : ''}`}>
                <div className="notification-icon"><Bell size={14} /></div>
                <div className="notification-body">
                  <div className="list-item-title">{n.message}</div>
                  <div className="list-item-sub">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                
                {/* Wrapped actions in a flex container for alignment */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {!n.read && (
                    <button className="link-btn" onClick={() => markRead(n.id)}>
                      Mark read
                    </button>
                  )}
                  <button 
                    className="link-btn" 
                    onClick={() => deleteNotif(n.id)} 
                    style={{ color: 'var(--danger, #ef4444)' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}