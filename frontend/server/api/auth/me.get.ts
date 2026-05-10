import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const db = getDb()
  const session = db.prepare(
    "SELECT s.user_id, u.email, u.phone, u.name, u.is_admin FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime('now')"
  ).get(sessionId) as any

  if (!session) {
    deleteCookie(event, 'session_id', { path: '/' })
    throw createError({ statusCode: 401, message: 'Session expired' })
  }

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(session.user_id) as any

  return {
    id: session.user_id,
    email: session.email,
    phone: session.phone,
    name: session.name,
    isAdmin: !!session.is_admin,
    hasProfile: !!profile
  }
})
