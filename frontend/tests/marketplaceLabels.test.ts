import { describe, expect, it } from 'vitest'
import {
  findProductById,
  getTotalLabelCount,
  marketplaceTabs,
  sortProductsByArticle,
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
      size: '30/46',
      sellerName: 'ИП Гладких Елена Евгеньевна',
      brand: 'Gladkih'
    })
  })

  it('counts labels by size row quantities', () => {
    const product = findProductById(wildberriesProducts, 1018)

    expect(product && getTotalLabelCount(product)).toBe(5)
  })
})
