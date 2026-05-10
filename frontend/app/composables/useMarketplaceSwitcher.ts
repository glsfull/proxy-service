import { getMarketplaceOption, marketplaceOptions, type MarketplaceId } from '~/utils/marketplaces'

export function useMarketplaceSwitcher() {
  const selectedMarketplace = useState<MarketplaceId>('selected-marketplace', () => 'wildberries')

  const currentMarketplace = computed(() => getMarketplaceOption(selectedMarketplace.value))

  const selectMarketplace = async (id: MarketplaceId) => {
    selectedMarketplace.value = id
    await $fetch('/api/marketplace/connection', {
      method: 'POST',
      body: { marketplace: id, status: 'selected' }
    }).catch(() => {})
  }

  return {
    marketplaceOptions,
    selectedMarketplace,
    currentMarketplace,
    selectMarketplace
  }
}
