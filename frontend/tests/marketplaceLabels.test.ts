import { describe, expect, it } from 'vitest'
import {
  applyBulkValue,
  defaultLabelSettings,
  findProductById,
  getTotalLabelCount,
  marketplaceTabs,
  sizeLabel,
  sortProductsByArticle,
  THERMAL_SIZES,
  wildberriesProducts
} from '../utils/marketplaceLabels'

describe('marketplace label generator data', () => {
  it('contains the requested marketplace tabs', () => {
    expect(marketplaceTabs.map((tab) => tab.label)).toEqual(['Wildberries', 'Ozon', 'Яндекс Маркет'])
  })

  it('sorts Wildberries products by article', () => {
    const sorted = sortProductsByArticle(wildberriesProducts)

    expect(sorted.map((product) => product.article)).toEqual([
      'Джинсы-2621',
      'Кроссовки-3340',
      'Рубашка-1018'
    ])
  })

  it('returns the requested table rows for a selected product', () => {
    const product = findProductById(wildberriesProducts, 2621)

    expect(product?.sizes[0]).toMatchObject({
      barcode: '2049332136771',
      article: 'Джинсы-2621',
      color: 'синий',
      sellerName: 'ИП Гладких Елена Евгеньевна',
      brand: 'Gladkih'
    })
  })

  it('counts labels by size row quantities', () => {
    const product = findProductById(wildberriesProducts, 1018)

    expect(product && getTotalLabelCount(product)).toBe(5)
  })
})

describe('label settings helpers', () => {
  it('exposes thermal size presets', () => {
    expect(THERMAL_SIZES.map((size) => size.label)).toContain('58×40')
    expect(defaultLabelSettings.thermalSize.label).toBe(THERMAL_SIZES[0].label)
  })

  it('uses the requested size mode for the cell value', () => {
    expect(sizeLabel('30', '46', 'tech')).toBe('30')
    expect(sizeLabel('30', '46', 'wb')).toBe('46')
    expect(sizeLabel('30', '46', 'both')).toBe('30/46')
    expect(sizeLabel('', '46', 'both')).toBe('46')
    expect(sizeLabel('', '', 'both')).toBe('—')
  })

  it('applies bulk values across rows preserving other fields', () => {
    const rows = wildberriesProducts[0]!.sizes.map((row) => ({ ...row }))
    const updated = applyBulkValue(rows, 'sellerName', 'ИП Тестов И.И.')

    expect(updated.every((row) => row.sellerName === 'ИП Тестов И.И.')).toBe(true)
    expect(updated[0]?.barcode).toBe(rows[0]?.barcode)
  })

  it('coerces quantity bulk value to a number', () => {
    const rows = wildberriesProducts[0]!.sizes.map((row) => ({ ...row }))
    const updated = applyBulkValue(rows, 'quantity', '7')

    expect(updated.every((row) => row.quantity === 7)).toBe(true)
  })

  it('returns the original rows when bulk value is empty', () => {
    const rows = wildberriesProducts[0]!.sizes.map((row) => ({ ...row }))
    const updated = applyBulkValue(rows, 'sellerName', '')

    expect(updated).toBe(rows)
  })
})
