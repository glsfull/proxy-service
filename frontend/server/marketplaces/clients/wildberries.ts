import type { MarketplaceAdapter, MarketplaceAuthContext, MarketplaceCredentials, MarketplaceValidationResult } from '../adapters/contract'
import spec from '../specs/wildberries.json'

const PING_URLS: Record<string, string> = {
  content: 'https://content-api.wildberries.ru/ping',
  analytics: 'https://seller-analytics-api.wildberries.ru/ping',
  marketplace: 'https://marketplace-api.wildberries.ru/ping',
  statistics: 'https://statistics-api.wildberries.ru/ping',
  finance: 'https://finance-api.wildberries.ru/ping'
}

async function pingCategory(token: string, url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000)
    })
    return res.status === 200
  }
  catch {
    return false
  }
}

export const wildberriesAdapter: MarketplaceAdapter = {
  id: 'wildberries',

  auth(credentials: MarketplaceCredentials): MarketplaceAuthContext {
    return { marketplace: 'wildberries', credentials }
  },

  async validate(context: MarketplaceAuthContext): Promise<MarketplaceValidationResult> {
    const token = context.credentials.token
    if (!token) {
      return { valid: false, reason: 'Токен не указан' }
    }

    const results = await Promise.all(
      Object.entries(PING_URLS).map(([, url]) => pingCategory(token, url))
    )

    if (results.some(ok => !ok)) {
      return { valid: false, reason: 'Токен создан некорректно. Предоставьте доступ ко всем требуемым категориям' }
    }

    let sellerName: string | null = null
    let externalAccountId: string | null = null
    try {
      const infoRes = await fetch('https://common-api.wildberries.ru/api/v1/seller-info', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      })
      if (infoRes.ok) {
        const info = await infoRes.json() as any
        sellerName = info.tradeMark || info.name || null
        externalAccountId = info.inn || null
      }
    }
    catch { /* seller-info is best-effort */ }

    return {
      valid: true,
      reason: 'OK',
      sellerName,
      externalAccountId,
      capabilities: spec.capabilities as Record<string, boolean>
    }
  }
}
