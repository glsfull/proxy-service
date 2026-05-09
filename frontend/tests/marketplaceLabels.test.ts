import { describe, expect, it } from 'vitest'
import {
  findProductById,
  getTotalLabelCount,
  marketplaceTabs,
  sortProductsByArticle,
  wildberriesAdditionalFields,
  wildberriesAdditionalTableColumns,
  wildberriesTableColumns,
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

  it('marks only requested columns and additional fields as bulk editable', () => {
    const bulkEditableLabels = wildberriesTableColumns
      .filter((column) => column.bulkEditable)
      .map((column) => column.label)

    expect(bulkEditableLabels).toEqual([
      'Штрихкод',
      'Артикул',
      'Цвет',
      'Название товара',
      'Наименование продавца',
      'Бренд',
      'Срок годности',
      'Страна',
      'Бренд',
      'Состав',
      'Поставщик',
      'Свободная надпись',
      'EAC'
    ])
  })

  it('provides collapsed checkbox additional fields for every Wildberries size row', () => {
    const fieldKeys = wildberriesAdditionalFields.map((field) => field.key)

    expect(fieldKeys).toEqual([
      'expirationDate',
      'country',
      'brand',
      'composition',
      'supplier',
      'freeText',
      'eac'
    ])
    expect(wildberriesAdditionalTableColumns.map((column) => column.key)).toEqual(fieldKeys)
    expect(wildberriesProducts[0].sizes[0]).toMatchObject({
      expirationDate: 'не ограничен',
      composition: 'хлопок 98%, эластан 2%',
      country: 'Россия',
      supplier: 'ИП Гладких Елена Евгеньевна',
      freeText: 'бережная стирка 30C',
      eac: 'EAC'
    })
  })
})
