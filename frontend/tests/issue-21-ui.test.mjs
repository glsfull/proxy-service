import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

const summary = read('server/api/analytics/summary.get.ts')
assert.match(summary, /fbyStock/, 'analytics summary must expose FBY stock')
assert.match(summary, /fbsStock/, 'analytics summary must expose FBS stock')
assert.match(summary, /preparationCost/, 'analytics summary must expose preparation cost')
assert.match(summary, /barcode/, 'analytics summary must expose barcodes')

const layout = read('app/layouts/default.vue')
assert.match(layout, /Генерация Bar-code/, 'side analytics menu must include barcode generation')
assert.match(layout, /i-lucide-barcode/, 'barcode generation menu item must use a barcode icon')

const products = read('app/pages/analytics/products.vue')
assert.match(products, /expandedRows/, 'products table must support expandable mini cards')
assert.match(products, /draftFor\(product\)\.purchasePrice/, 'purchase price must be inline editable')
assert.match(products, /draftFor\(product\)\.preparationCost/, 'preparation cost must be inline editable')
assert.match(products, /Себестоимость FBY/, 'products table must calculate FBY cost')
assert.match(products, /Себестоимость FBS/, 'products table must calculate FBS cost')
assert.match(products, /Итого/, 'products table must include totals row')
assert.match(products, /retailValue/, 'totals row must include retail value formula')

const barcodeIndex = read('app/pages/analytics/barcodes/index.vue')
assert.match(barcodeIndex, /\/analytics\/barcodes\/\$\{product\.nmId\}/, 'barcode cards must link to dynamic product page')

const barcodeDetail = read('app/pages/analytics/barcodes/[id].vue')
assert.match(barcodeDetail, /applyBulk/, 'barcode page must support bulk editing')
assert.match(barcodeDetail, /Срок годности/, 'barcode page must include optional label fields')
assert.match(barcodeDetail, /тип бумаги|paperType/, 'barcode page must include print paper type option')
assert.match(barcodeDetail, /Штрихкод\*/, 'barcode page must render requested barcode table')

console.log('issue #21 UI affordances are present')
