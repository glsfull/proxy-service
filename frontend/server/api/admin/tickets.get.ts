import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const db = getDb()
  const session = db.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(sessionId) as any

  if (!session) throw createError({ statusCode: 401, message: 'Session expired' })

  const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(session.user_id) as any
  if (!user?.is_admin) throw createError({ statusCode: 403, message: 'Admin access required' })

  const tickets = db.prepare(
    `SELECT t.*, u.email, u.phone, u.name as user_name
     FROM tickets t
     JOIN users u ON t.user_id = u.id
     ORDER BY t.created_at DESC`
  ).all()

  return tickets
})
