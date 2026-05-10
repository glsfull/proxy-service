import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

const layout = read('app/layouts/default.vue')
assert.match(layout, /useMarketplaceSwitcher/, 'default header must use marketplace switcher')
assert.match(layout, /marketplaceOptions/, 'default header must render WB/Ozon/Yandex selector')
assert.match(layout, /sideMenuOpen/, 'hamburger button must control side menu state')
assert.match(layout, /Главная сводка/, 'side menu must include analytics sections')
assert.match(layout, /Настройки синхронизации/, 'side menu must include sync settings')

const analytics = read('app/pages/analytics/index.vue')
assert.match(analytics, /downloadReport/, 'analytics summary must expose report export action')
assert.match(analytics, /selectedMarketplace/, 'analytics summary must bind export to selected marketplace')
assert.match(analytics, /period\.value/, 'analytics summary must export the selected period')

const products = read('app/pages/analytics/products.vue')
assert.match(products, /selectedProduct/, 'products page must support a selected product detail card')
assert.match(products, /Цена закупки/, 'product detail must include purchase price')
assert.match(products, /downloadReport/, 'products page must expose report export action')

console.log('issue #19 UI affordances are present')
