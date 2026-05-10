export type MarketplaceId = 'wildberries' | 'ozon' | 'yandex-market'

export interface MarketplaceOption {
  id: MarketplaceId
  label: string
  shortLabel: string
  status: 'active' | 'planned'
  icon: string
  accentClass: string
  description: string
}

export const marketplaceOptions: MarketplaceOption[] = [
  {
    id: 'wildberries',
    label: 'Wildberries',
    shortLabel: 'WB',
    status: 'active',
    icon: 'i-simple-icons-wildberries',
    accentClass: 'text-purple-600 dark:text-purple-400',
    description: 'Активный модуль аналитики и синхронизации'
  },
  {
    id: 'ozon',
    label: 'Ozon',
    shortLabel: 'Ozon',
    status: 'planned',
    icon: 'i-simple-icons-ozon',
    accentClass: 'text-blue-600 dark:text-blue-400',
    description: 'Запланированный модуль по Backlog API'
  },
  {
    id: 'yandex-market',
    label: 'Yandex Market',
    shortLabel: 'Market',
    status: 'planned',
    icon: 'i-simple-icons-yandex',
    accentClass: 'text-red-600 dark:text-red-400',
    description: 'Запланированный модуль по Backlog API'
  }
]

export function getMarketplaceOption(id: MarketplaceId): MarketplaceOption {
  const fallback = marketplaceOptions[0]
  if (!fallback) throw new Error('Marketplace options cannot be empty')
  return marketplaceOptions.find((marketplace) => marketplace.id === id) ?? fallback
}
