import { getAdapter } from '../../marketplaces/clients/index'
import type { MarketplaceId } from '../../marketplaces/adapters/contract'

const ALLOWED: MarketplaceId[] = ['wildberries', 'ozon', 'yandex-market']

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    marketplace?: string
    token?: string
    clientId?: string
    apiKey?: string
    oauthToken?: string
    businessId?: string
    campaignId?: string
  }

  const marketplace = (body.marketplace || 'wildberries') as MarketplaceId
  if (!ALLOWED.includes(marketplace)) {
    throw createError({ statusCode: 400, message: 'Invalid marketplace' })
  }

  const adapter = getAdapter(marketplace)
  const context = adapter.auth({
    token: body.token,
    clientId: body.clientId,
    apiKey: body.apiKey,
    oauthToken: body.oauthToken,
    businessId: body.businessId,
    campaignId: body.campaignId
  })

  const result = await adapter.validate(context)
  return result
})
