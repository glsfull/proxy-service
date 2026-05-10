export type MarketplaceId = 'wildberries' | 'ozon' | 'yandex-market'

export interface MarketplaceCredentials {
  token?: string
  clientId?: string
  apiKey?: string
  oauthToken?: string
  businessId?: string
  campaignId?: string
}

export interface MarketplaceAuthContext {
  marketplace: MarketplaceId
  credentials: MarketplaceCredentials
  externalAccountId?: string | null
}

export interface MarketplaceValidationResult {
  valid: boolean
  reason: string
  externalAccountId?: string | null
  sellerName?: string | null
  capabilities?: Partial<Record<MarketplaceCapability, boolean>>
}

export type MarketplaceCapability =
  | 'products'
  | 'stocks'
  | 'orders'
  | 'finance'
  | 'ads'

export interface MarketplaceSyncOptions {
  from?: string
  to?: string
  force?: boolean
  trace?: boolean
}

export interface MarketplaceSyncResult {
  ok: boolean
  processed: number
  cursor?: string | number | null
  warnings?: string[]
}

export interface MarketplaceAdapter {
  id: MarketplaceId
  auth: (credentials: MarketplaceCredentials) => MarketplaceAuthContext
  validate: (context: MarketplaceAuthContext) => Promise<MarketplaceValidationResult>
  syncProducts?: (context: MarketplaceAuthContext, options?: MarketplaceSyncOptions) => Promise<MarketplaceSyncResult>
  syncStocks?: (context: MarketplaceAuthContext, options?: MarketplaceSyncOptions) => Promise<MarketplaceSyncResult>
  syncOrders?: (context: MarketplaceAuthContext, options?: MarketplaceSyncOptions) => Promise<MarketplaceSyncResult>
  syncFinance?: (context: MarketplaceAuthContext, options?: MarketplaceSyncOptions) => Promise<MarketplaceSyncResult>
  syncAds?: (context: MarketplaceAuthContext, options?: MarketplaceSyncOptions) => Promise<MarketplaceSyncResult>
}
