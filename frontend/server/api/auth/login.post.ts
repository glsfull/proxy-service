import { getDb } from '../../utils/db'
import { verifyPassword, generateSessionId, getSessionExpiry } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { login, password, type } = body as { login: string; password: string; type: 'phone' | 'email' }

  if (!login || !password || !type) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const db = getDb()

  const user = type === 'phone'
    ? db.prepare('SELECT * FROM users WHERE phone = ?').get(login) as any
    : db.prepare('SELECT * FROM users WHERE email = ?').get(login) as any

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw createError({ statusCode: 401, message: 'Invalid login or password' })
  }

  db.prepare("DELETE FROM sessions WHERE user_id = ? AND expires_at < datetime('now')").run(user.id)

  const sessionId = generateSessionId()
  db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(sessionId, user.id, getSessionExpiry())

  setCookie(event, 'session_id', sessionId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })

  return { ok: true, userId: user.id }
})
