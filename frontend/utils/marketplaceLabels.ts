export type Marketplace = 'wildberries' | 'ozon' | 'yandex'

export interface MarketplaceTab {
  id: Marketplace
  label: string
  status: 'ready' | 'planned'
}

export interface WildberriesSizeRow {
  barcode: string
  article: string
  color: string
  size: string
  productName: string
  sellerName: string
  brand: string
  quantity: number
}

export type WildberriesSizeRowField = keyof WildberriesSizeRow

export interface WildberriesProduct {
  id: number
  photo: string
  name: string
  article: string
  vendorCode: string
  brand: string
  sizes: WildberriesSizeRow[]
}

export const marketplaceTabs: MarketplaceTab[] = [
  { id: 'wildberries', label: 'Wildberries', status: 'ready' },
  { id: 'ozon', label: 'Ozon', status: 'planned' },
  { id: 'yandex', label: 'Яндекс Маркет', status: 'planned' }
]

export const wildberriesProducts: WildberriesProduct[] = [
  {
    id: 2621,
    photo: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=320&q=80',
    name: 'Джинсы свободные багги, оверсайз, широкие к низу',
    article: 'Джинсы-2621',
    vendorCode: 'WB-2621-BLUE',
    brand: 'Gladkih',
    sizes: [
      {
        barcode: '2049332136771',
        article: 'Джинсы-2621',
        color: 'синий',
        size: '30/46',
        productName: 'Джинсы свободные багги, оверсайз, широкие к низу',
        sellerName: 'ИП Гладких Елена Евгеньевна',
        brand: 'Gladkih',
        quantity: 1
      },
      {
        barcode: '2049332136849',
        article: 'Джинсы-2621',
        color: 'синий',
        size: '29/44',
        productName: 'Джинсы свободные багги, оверсайз, широкие к низу',
        sellerName: 'ИП Гладких Елена Евгеньевна',
        brand: 'Gladkih',
        quantity: 1
      },
      {
        barcode: '2049332136788',
        article: 'Джинсы-2621',
        color: 'синий',
        size: '31/48',
        productName: 'Джинсы свободные багги, оверсайз, широкие к низу',
        sellerName: 'ИП Гладких Елена Евгеньевна',
        brand: 'Gladkih',
        quantity: 1
      },
      {
        barcode: '2049332136795',
        article: 'Джинсы-2621',
        color: 'синий',
        size: '32/50',
        productName: 'Джинсы свободные багги, оверсайз, широкие к низу',
        sellerName: 'ИП Гладких Елена Евгеньевна',
        brand: 'Gladkih',
        quantity: 1
      }
    ]
  },
  {
    id: 1018,
    photo: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=320&q=80',
    name: 'Рубашка хлопковая свободного кроя',
    article: 'Рубашка-1018',
    vendorCode: 'WB-1018-WHITE',
    brand: 'Nord Line',
    sizes: [
      {
        barcode: '2037710010181',
        article: 'Рубашка-1018',
        color: 'белый',
        size: 'S',
        productName: 'Рубашка хлопковая свободного кроя',
        sellerName: 'ООО Северная линия',
        brand: 'Nord Line',
        quantity: 2
      },
      {
        barcode: '2037710010182',
        article: 'Рубашка-1018',
        color: 'белый',
        size: 'M',
        productName: 'Рубашка хлопковая свободного кроя',
        sellerName: 'ООО Северная линия',
        brand: 'Nord Line',
        quantity: 3
      }
    ]
  },
  {
    id: 3340,
    photo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=320&q=80',
    name: 'Кроссовки повседневные текстильные',
    article: 'Кроссовки-3340',
    vendorCode: 'WB-3340-GRAY',
    brand: 'Stepway',
    sizes: [
      {
        barcode: '2073340000401',
        article: 'Кроссовки-3340',
        color: 'серый',
        size: '40',
        productName: 'Кроссовки повседневные текстильные',
        sellerName: 'ООО Степвей',
        brand: 'Stepway',
        quantity: 4
      },
      {
        barcode: '2073340000418',
        article: 'Кроссовки-3340',
        color: 'серый',
        size: '41',
        productName: 'Кроссовки повседневные текстильные',
        sellerName: 'ООО Степвей',
        brand: 'Stepway',
        quantity: 4
      },
      {
        barcode: '2073340000425',
        article: 'Кроссовки-3340',
        color: 'серый',
        size: '42',
        productName: 'Кроссовки повседневные текстильные',
        sellerName: 'ООО Степвей',
        brand: 'Stepway',
        quantity: 2
      }
    ]
  }
]

export function sortProductsByArticle(products: WildberriesProduct[]) {
  return [...products].sort((first, second) => first.article.localeCompare(second.article, 'ru'))
}

export function findProductById(products: WildberriesProduct[], id: number | null) {
  return products.find((product) => product.id === id) ?? null
}

export function getTotalLabelCount(product: WildberriesProduct) {
  return product.sizes.reduce((sum, row) => sum + row.quantity, 0)
}

export function updateSizeRow<Field extends WildberriesSizeRowField>(
  row: WildberriesSizeRow,
  field: Field,
  value: WildberriesSizeRow[Field]
) {
  return {
    ...row,
    [field]: value
  }
}

export function applyBulkSizeRowField<Field extends WildberriesSizeRowField>(
  rows: WildberriesSizeRow[],
  field: Field,
  value: WildberriesSizeRow[Field] | ''
) {
  if (value === '') return rows

  return rows.map((row) => updateSizeRow(row, field, value))
}
