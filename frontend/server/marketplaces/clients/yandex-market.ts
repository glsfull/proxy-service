import type { MarketplaceAdapter, MarketplaceAuthContext, MarketplaceCredentials, MarketplaceValidationResult } from '../adapters/contract'
import spec from '../specs/yandex-market.json'

export const yandexMarketAdapter: MarketplaceAdapter = {
  id: 'yandex-market',

  auth(credentials: MarketplaceCredentials): MarketplaceAuthContext {
    return { marketplace: 'yandex-market', credentials }
  },

  async validate(context: MarketplaceAuthContext): Promise<MarketplaceValidationResult> {
    const { oauthToken, businessId } = context.credentials
    if (!oauthToken || !businessId) {
      return { valid: false, reason: 'Необходимо указать OAuth-токен и Business ID' }
    }

    const url = `https://api.partner.market.yandex.ru/businesses/${businessId}/offer-mappings?limit=1`

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `OAuth ${oauthToken}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      })

      if (res.status === 401 || res.status === 403) {
        return { valid: false, reason: 'Неверный OAuth-токен или нет прав доступа к бизнесу Yandex Market.' }
      }

      if (!res.ok) {
        return { valid: false, reason: `Yandex Market API вернул статус ${res.status}` }
      }

      return {
        valid: true,
        reason: 'OK',
        externalAccountId: businessId,
        capabilities: spec.capabilities as Record<string, boolean>
      }
    }
    catch (err: any) {
      if (err?.name === 'TimeoutError') {
        return { valid: false, reason: 'Yandex Market API не ответил за 8 секунд' }
      }
      return { valid: false, reason: 'Ошибка при проверке подключения Yandex Market' }
    }
  }
}
