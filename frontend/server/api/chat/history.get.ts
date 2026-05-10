import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const db = getDb()
  const session = db.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(sessionId) as any

  if (!session) throw createError({ statusCode: 401, message: 'Session expired' })

  const messages = db.prepare(
    'SELECT id, role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 100'
  ).all(session.user_id)

  return messages
})
