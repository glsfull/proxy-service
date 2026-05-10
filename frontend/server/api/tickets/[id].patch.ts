import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const db = getDb()
  const session = db.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(sessionId) as any

  if (!session) throw createError({ statusCode: 401, message: 'Session expired' })

  const ticketId = getRouterParam(event, 'id')
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId) as any
  if (!ticket) throw createError({ statusCode: 404, message: 'Ticket not found' })

  // Only ticket owner or admin can update
  const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(session.user_id) as any
  if (ticket.user_id !== session.user_id && !user?.is_admin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const body = await readBody(event)
  const allowedStatuses = ['open', 'in_progress', 'resolved', 'closed']
  const status = body?.status

  if (status && !allowedStatuses.includes(status)) {
    throw createError({ statusCode: 400, message: 'Invalid status' })
  }

  const fields: string[] = []
  const values: any[] = []

  if (body?.title?.trim()) { fields.push('title = ?'); values.push(body.title.trim()) }
  if (body?.description?.trim()) { fields.push('description = ?'); values.push(body.description.trim()) }
  if (status) { fields.push('status = ?'); values.push(status) }

  if (fields.length === 0) throw createError({ statusCode: 400, message: 'No fields to update' })

  fields.push("updated_at = datetime('now')")
  values.push(ticketId)

  db.prepare(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`).run(...values)

  return db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId)
})
