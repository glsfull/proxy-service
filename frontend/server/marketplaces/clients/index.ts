import { wildberriesAdapter } from './wildberries'
import { ozonAdapter } from './ozon'
import { yandexMarketAdapter } from './yandex-market'
import type { MarketplaceId } from '../adapters/contract'
import type { MarketplaceAdapter } from '../adapters/contract'

export const adapters: Record<MarketplaceId, MarketplaceAdapter> = {
  wildberries: wildberriesAdapter,
  ozon: ozonAdapter,
  'yandex-market': yandexMarketAdapter
}

export function getAdapter(marketplace: MarketplaceId): MarketplaceAdapter {
  const adapter = adapters[marketplace]
  if (!adapter) throw new Error(`No adapter for marketplace: ${marketplace}`)
  return adapter
}

export { wildberriesAdapter, ozonAdapter, yandexMarketAdapter }
