import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Only log API routes, skip static assets
  if (!path.startsWith('/api/')) return

  const start = Date.now()
  const method = event.method
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? null

  // Get user_id from session if available
  let userId: number | null = null
  try {
    const sessionId = getCookie(event, 'session_id')
    if (sessionId) {
      const db = getDb()
      const session = db.prepare(
        "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
      ).get(sessionId) as any
      if (session) userId = session.user_id
    }
  } catch {
    // Ignore errors during user lookup
  }

  event.context._requestLogMeta = { start, method, path, ip, userId }
})
