import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

for (const marketplace of ['wildberries', 'ozon', 'yandex-market']) {
  const specPath = `server/marketplaces/specs/${marketplace}.json`
  assert.ok(existsSync(new URL(specPath, root)), `missing ${marketplace} module spec`)

  const spec = JSON.parse(read(specPath))
  assert.equal(spec.id, marketplace)
  assert.ok(Array.isArray(spec.auth.requiredFields), `${marketplace} auth fields must be declared`)
  assert.ok(spec.capabilities.products, `${marketplace} products capability is required`)
  assert.ok(spec.capabilities.stocks, `${marketplace} stocks capability is required`)
  assert.ok(spec.capabilities.orders, `${marketplace} orders capability is required`)
  assert.ok(spec.capabilities.finance, `${marketplace} finance capability is required`)
  assert.ok(spec.capabilities.ads, `${marketplace} ads capability is required`)
  assert.ok(Array.isArray(spec.endpoints), `${marketplace} endpoints must be declared`)
  assert.ok(spec.endpoints.some((endpoint) => endpoint.operation === 'validate'), `${marketplace} validate endpoint is required`)
}

const adapterContract = read('server/marketplaces/adapters/contract.ts')
for (const method of ['auth', 'validate', 'syncProducts', 'syncStocks', 'syncOrders', 'syncFinance', 'syncAds']) {
  assert.match(adapterContract, new RegExp(`${method}\\??\\s*:`), `adapter contract missing ${method}`)
}

const pagination = read('server/utils/marketplace/pagination.ts')
for (const token of ['createCursorPaginator', 'createOffsetPaginator', 'createIdContinuationPaginator']) {
  assert.match(pagination, new RegExp(`export async function\\* ${token}`), `missing ${token}`)
}

const polling = read('server/utils/marketplace/polling.ts')
assert.match(polling, /export async function pollAsyncReport/, 'missing polling helper')
assert.match(polling, /timeoutMs/, 'polling helper must support timeout')

const trace = read('server/utils/marketplace/request-trace.ts')
assert.match(trace, /MARKETPLACE_VERBOSE_TRACE/, 'verbose trace must be off unless explicitly enabled')
assert.match(trace, /marketplace/, 'trace entries must include marketplace')
assert.match(trace, /endpoint/, 'trace entries must include endpoint')

const db = read('server/utils/db.ts')
assert.match(db, /CREATE TABLE IF NOT EXISTS marketplace_connections/, 'missing marketplace_connections table')
assert.match(db, /marketplace TEXT NOT NULL DEFAULT 'wildberries'/, 'profiles must keep a migrated marketplace column')
assert.match(db, /INSERT INTO marketplace_connections/, 'WB-only profiles must migrate into marketplace_connections')

console.log('marketplace architecture specs and helpers are present')
