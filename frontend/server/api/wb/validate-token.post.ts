const PING_ENDPOINTS = [
  { category: 'Контент', url: 'https://content-api.wildberries.ru/ping' },
  { category: 'Аналитика', url: 'https://seller-analytics-api.wildberries.ru/ping' },
  { category: 'Маркетплейс', url: 'https://marketplace-api.wildberries.ru/ping' },
  { category: 'Статистика', url: 'https://statistics-api.wildberries.ru/ping' },
  { category: 'Финансы', url: 'https://finance-api.wildberries.ru/ping' }
]

async function pingEndpoint(url: string, token: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await $fetch.raw(url, {
      headers: { Authorization: token },
      timeout: 8000,
      ignoreResponseError: true
    })
    return { ok: res.status === 200, status: res.status }
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode || 0
    return { ok: false, status }
  }
}

async function fetchSellerInfo(token: string): Promise<{ tradeMark?: string; inn?: string; name?: string } | null> {
  try {
    const data = await $fetch<any>('https://common-api.wildberries.ru/api/v1/seller-info', {
      headers: { Authorization: token },
      timeout: 8000,
      ignoreResponseError: true
    })
    return data || null
  } catch {
    return null
  }
}

async function fetchSellerRating(token: string): Promise<number | null> {
  try {
    const data = await $fetch<any>('https://feedbacks-api.wildberries.ru/api/common/v1/rating', {
      headers: { Authorization: token },
      timeout: 8000,
      ignoreResponseError: true
    })
    return data?.data?.valuation ?? data?.valuation ?? null
  } catch {
    return null
  }
}

async function fetchTokenExpiry(token: string): Promise<string | null> {
  try {
    const data = await $fetch<any>('https://common-api.wildberries.ru/api/v1/token/info', {
      headers: { Authorization: token },
      timeout: 8000,
      ignoreResponseError: true
    })
    return data?.exp ?? data?.expiredAt ?? null
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token } = body as { token: string }

  if (!token || token.trim().length < 10) {
    return { valid: false, reason: 'Токен слишком короткий', steps: [] }
  }

  const t = token.trim()

  // Demo bypass
  if (t.startsWith('demo_valid_')) {
    return {
      valid: true,
      reason: 'Токен действителен (демо-режим)',
      steps: PING_ENDPOINTS.map(e => ({ category: e.category, ok: true, status: 200 })),
      sellerInfo: { tradeMark: 'Demo Company', inn: '1234567890', name: 'Demo' },
      rating: 4.8,
      tokenExpiresAt: null
    }
  }

  // Step 1: ping all required endpoints
  const pingResults = await Promise.all(
    PING_ENDPOINTS.map(async (e) => {
      const r = await pingEndpoint(e.url, t)
      return { category: e.category, url: e.url, ok: r.ok, status: r.status }
    })
  )

  const failedPings = pingResults.filter(r => !r.ok)
  if (failedPings.length > 0) {
    return {
      valid: false,
      reason: 'Токен создан некорректно. Предоставьте доступ ко всем требуемым категориям',
      steps: pingResults,
      sellerInfo: null,
      rating: null,
      tokenExpiresAt: null
    }
  }

  // Step 2: fetch seller info
  const sellerInfo = await fetchSellerInfo(t)

  // Step 3: fetch rating and token expiry in parallel
  const [rating, tokenExpiresAt] = await Promise.all([
    fetchSellerRating(t),
    fetchTokenExpiry(t)
  ])

  return {
    valid: true,
    reason: 'Токен действителен, все категории подтверждены',
    steps: pingResults,
    sellerInfo,
    rating,
    tokenExpiresAt
  }
})
