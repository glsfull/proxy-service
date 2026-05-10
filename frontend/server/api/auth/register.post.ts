import { getDb } from '../../utils/db'
import { hashPassword, generateSessionId, getSessionExpiry } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { login, password, type } = body as { login: string; password: string; type: 'phone' | 'email' }

  if (!login || !password || !type) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'Password must be at least 6 characters' })
  }

  const db = getDb()
  const passwordHash = hashPassword(password)

  let userId: number
  try {
    if (type === 'phone') {
      const result = db.prepare(
        'INSERT INTO users (phone, password_hash) VALUES (?, ?)'
      ).run(login, passwordHash)
      userId = result.lastInsertRowid as number
    } else {
      const result = db.prepare(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)'
      ).run(login, passwordHash)
      userId = result.lastInsertRowid as number
    }
  } catch {
    throw createError({ statusCode: 409, message: 'User with this login already exists' })
  }

  const sessionId = generateSessionId()
  db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(sessionId, userId, getSessionExpiry())

  setCookie(event, 'session_id', sessionId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })

  return { ok: true, userId }
})
