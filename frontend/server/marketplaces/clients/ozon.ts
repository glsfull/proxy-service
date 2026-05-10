import type { MarketplaceAdapter, MarketplaceAuthContext, MarketplaceCredentials, MarketplaceValidationResult } from '../adapters/contract'
import spec from '../specs/ozon.json'

export const ozonAdapter: MarketplaceAdapter = {
  id: 'ozon',

  auth(credentials: MarketplaceCredentials): MarketplaceAuthContext {
    return { marketplace: 'ozon', credentials }
  },

  async validate(context: MarketplaceAuthContext): Promise<MarketplaceValidationResult> {
    const { clientId, apiKey } = context.credentials
    if (!clientId || !apiKey) {
      return { valid: false, reason: 'Необходимо указать Client-Id и Api-Key' }
    }

    try {
      const res = await fetch('https://api-seller.ozon.ru/v1/warehouse/list', {
        method: 'POST',
        headers: {
          'Client-Id': clientId,
          'Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(8000)
      })

      if (res.status === 401 || res.status === 403) {
        return { valid: false, reason: 'Неверный Client-Id или Api-Key. Проверьте учётные данные Ozon Seller.' }
      }

      if (!res.ok) {
        return { valid: false, reason: `Ozon API вернул статус ${res.status}` }
      }

      return {
        valid: true,
        reason: 'OK',
        capabilities: spec.capabilities as Record<string, boolean>
      }
    }
    catch (err: any) {
      if (err?.name === 'TimeoutError') {
        return { valid: false, reason: 'Ozon API не ответил за 8 секунд' }
      }
      return { valid: false, reason: 'Ошибка при проверке подключения Ozon' }
    }
  }
}
