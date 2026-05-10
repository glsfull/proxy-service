import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (sessionId) {
    const db = getDb()
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
    deleteCookie(event, 'session_id', { path: '/' })
  }
  return { ok: true }
})
