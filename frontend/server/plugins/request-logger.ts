import { getDb } from '../utils/db'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('afterResponse', (event, _response) => {
    const meta = event.context._requestLogMeta
    if (!meta) return

    const duration = Date.now() - meta.start
    const statusCode = event.node.res.statusCode ?? null

    try {
      const db = getDb()
      db.prepare(
        `INSERT INTO request_logs (user_id, method, path, status_code, duration_ms, ip)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(meta.userId ?? null, meta.method, meta.path, statusCode, duration, meta.ip ?? null)
    } catch {
      // Don't crash the server on logging errors
    }
  })
})
