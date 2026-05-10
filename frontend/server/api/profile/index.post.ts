import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const db = getDb()
  const session = db.prepare(
    `SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')`
  ).get(sessionId) as any
  if (!session) throw createError({ statusCode: 401, message: 'Session expired' })

  const body = await readBody(event)
  const {
    marketplace = 'wildberries',
    wb_token,
    company_name,
    inn,
    contact_name,
    seller_name,
    seller_id,
    seller_rating,
    token_expires_at
  } = body

  // When seller_name/inn come from API, prefer API data over user input for legal fields
  const effectiveInn = inn || null
  const effectiveCompanyName = company_name || seller_name || null
  if (marketplace !== 'wildberries') {
    throw createError({ statusCode: 400, message: 'Marketplace connection is not supported yet' })
  }
  const effectiveMarketplace = 'wildberries'

  const existing = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(session.user_id)
  if (existing) {
    db.prepare(`
      UPDATE profiles
      SET marketplace=?, wb_token=?, company_name=?, inn=?, contact_name=?,
          seller_name=?, seller_id=?, seller_rating=?, token_expires_at=?,
          updated_at=datetime('now')
      WHERE user_id=?
    `).run(
      effectiveMarketplace,
      wb_token,
      effectiveCompanyName,
      effectiveInn,
      contact_name,
      seller_name ?? null,
      seller_id ?? null,
      seller_rating ?? null,
      token_expires_at ?? null,
      session.user_id
    )
  } else {
    db.prepare(`
      INSERT INTO profiles
        (user_id, marketplace, wb_token, company_name, inn, contact_name,
         seller_name, seller_id, seller_rating, token_expires_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(
      session.user_id,
      effectiveMarketplace,
      wb_token,
      effectiveCompanyName,
      effectiveInn,
      contact_name,
      seller_name ?? null,
      seller_id ?? null,
      seller_rating ?? null,
      token_expires_at ?? null
    )
  }

  db.prepare(`
    INSERT INTO marketplace_connections
      (user_id, marketplace, credentials_ref, seller_name, external_account_id, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, marketplace) DO UPDATE SET
      credentials_ref=excluded.credentials_ref,
      seller_name=excluded.seller_name,
      external_account_id=excluded.external_account_id,
      status=excluded.status,
      updated_at=datetime('now')
  `).run(
    session.user_id,
    effectiveMarketplace,
    wb_token,
    seller_name ?? effectiveCompanyName,
    seller_id ?? null,
    wb_token && String(wb_token).length > 10 ? 'active' : 'draft'
  )

  return { ok: true }
})
