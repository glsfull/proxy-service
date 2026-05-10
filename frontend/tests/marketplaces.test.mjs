import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../app/utils/marketplaces.ts', import.meta.url), 'utf8')

for (const id of ['wildberries', 'ozon', 'yandex-market']) {
  assert.match(source, new RegExp(`id: '${id}'`), `missing marketplace ${id}`)
}

assert.match(source, /status: 'active'[\s\S]*label: 'Wildberries'|label: 'Wildberries'[\s\S]*status: 'active'/)
assert.match(source, /status: 'planned'/, 'planned marketplace status is required')
assert.match(source, /getMarketplaceOption/, 'fallback lookup helper is required')

console.log('marketplace catalog includes WB, Ozon, and Yandex Market')
