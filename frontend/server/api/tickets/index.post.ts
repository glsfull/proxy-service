import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const db = getDb()
  const session = db.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(sessionId) as any

  if (!session) throw createError({ statusCode: 401, message: 'Session expired' })

  const body = await readBody(event)
  const { title, description } = body || {}

  if (!title?.trim()) throw createError({ statusCode: 400, message: 'Title is required' })
  if (!description?.trim()) throw createError({ statusCode: 400, message: 'Description is required' })

  const result = db.prepare(
    `INSERT INTO tickets (user_id, title, description) VALUES (?, ?, ?)`
  ).run(session.user_id, title.trim(), description.trim())

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid)
  return ticket
})
