export interface MarketplaceRequestTrace {
  marketplace: string
  endpoint: string
  method: string
  status?: number
  durationMs: number
  retry?: number
  rateLimitRemaining?: string | null
}

export function isMarketplaceVerboseTraceEnabled(): boolean {
  return process.env.MARKETPLACE_VERBOSE_TRACE === '1' || process.env.MARKETPLACE_VERBOSE_TRACE === 'true'
}

export function traceMarketplaceRequest(entry: MarketplaceRequestTrace): void {
  if (!isMarketplaceVerboseTraceEnabled()) return

  console.info('[marketplace-request]', {
    marketplace: entry.marketplace,
    endpoint: entry.endpoint,
    method: entry.method,
    status: entry.status ?? null,
    durationMs: entry.durationMs,
    retry: entry.retry ?? 0,
    rateLimitRemaining: entry.rateLimitRemaining ?? null
  })
}
