import { getDb } from '../../utils/db'

const ALLOWED_MARKETPLACES = ['wildberries', 'ozon', 'yandex-market'] as const
type MarketplaceId = typeof ALLOWED_MARKETPLACES[number]

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const db = getDb()
  const session = db.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(sessionId) as any
  if (!session) throw createError({ statusCode: 401, message: 'Session expired' })

  const body = await readBody(event) as {
    marketplace?: string
    credentials_ref?: string
    seller_name?: string
    external_account_id?: string
    status?: string
  }

  if (!body.marketplace || !ALLOWED_MARKETPLACES.includes(body.marketplace as MarketplaceId)) {
    throw createError({ statusCode: 400, message: 'Invalid marketplace' })
  }

  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO marketplace_connections (user_id, marketplace, credentials_ref, seller_name, external_account_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, marketplace) DO UPDATE SET
      credentials_ref = excluded.credentials_ref,
      seller_name = excluded.seller_name,
      external_account_id = excluded.external_account_id,
      status = excluded.status,
      updated_at = excluded.updated_at
  `).run(
    session.user_id,
    body.marketplace,
    body.credentials_ref ?? null,
    body.seller_name ?? null,
    body.external_account_id ?? null,
    body.status ?? 'draft',
    now,
    now
  )

  const connection = db.prepare(
    'SELECT * FROM marketplace_connections WHERE user_id = ? AND marketplace = ?'
  ).get(session.user_id, body.marketplace)

  return { connection }
})
