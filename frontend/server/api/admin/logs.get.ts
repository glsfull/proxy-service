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

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 100, 500)
  const offset = Number(query.offset) || 0

  const logs = db.prepare(
    `SELECT l.*, u.email, u.phone, u.name as user_name
     FROM request_logs l
     LEFT JOIN users u ON l.user_id = u.id
     ORDER BY l.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(limit, offset)

  const total = (db.prepare('SELECT COUNT(*) as count FROM request_logs').get() as any).count

  return { logs, total, limit, offset }
})
