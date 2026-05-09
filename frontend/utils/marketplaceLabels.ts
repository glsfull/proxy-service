export type Marketplace = 'wildberries' | 'ozon' | 'yandex'

export interface MarketplaceTab {
  id: Marketplace
  label: string
  status: 'ready' | 'planned'
}

export type SizeDisplayMode = 'tech' | 'wb' | 'both'
export type MediaType = 'a4' | 'thermal'
export type BarcodeFormat = 'CODE128' | 'EAN13' | 'CODE39'
export type TextAlign = 'center' | 'left'
export type BarcodeIndex = 0 | 1 | 2

export interface ThermalSize {
  label: string
  widthMm: number
  heightMm: number
}

export const THERMAL_SIZES: ThermalSize[] = [
  { label: '58×40', widthMm: 58, heightMm: 40 },
  { label: '58×60', widthMm: 58, heightMm: 60 },
  { label: '40×30', widthMm: 40, heightMm: 30 }
]

export interface AdditionalFields {
  showExpiry: boolean
  showCountry: boolean
  showBrand: boolean
  showComposition: boolean
  showSupplier: boolean
  showFreeText: boolean
  showEac: boolean
}

export const defaultAdditionalFields: AdditionalFields = {
  showExpiry: false,
  showCountry: false,
  showBrand: true,
  showComposition: false,
  showSupplier: false,
  showFreeText: false,
  showEac: true
}

export interface LabelSettings {
  barcodeIndex: BarcodeIndex
  sizeDisplayMode: SizeDisplayMode
  mediaType: MediaType
  thermalSize: ThermalSize
  fontSize: number
  barcodeFormat: BarcodeFormat
  textAlign: TextAlign
  additionalFields: AdditionalFields
}

export const defaultLabelSettings: LabelSettings = {
  barcodeIndex: 0,
  sizeDisplayMode: 'both',
  mediaType: 'thermal',
  thermalSize: THERMAL_SIZES[0],
  fontSize: 12,
  barcodeFormat: 'CODE128',
  textAlign: 'center',
  additionalFields: { ...defaultAdditionalFields }
}

export interface WildberriesSizeRow {
  barcode: string
  barcodes?: string[]
  article: string
  vendorCode: string
  color: string
  techSize: string
  wbSize: string
  size: string
  productName: string
  sellerName: string
  brand: string
  expiryDate?: string
  country?: string
  composition?: string
  supplier?: string
  freeText?: string
  quantity: number
}

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

function buildSizeRow(partial: Partial<WildberriesSizeRow> & {
  barcode: string
  article: string
  vendorCode: string
  color: string
  techSize: string
  wbSize: string
  productName: string
  sellerName: string
  brand: string
  quantity: number
}): WildberriesSizeRow {
  return {
    barcodes: [partial.barcode],
    expiryDate: '',
    country: 'Россия',
    composition: '',
    supplier: '',
    freeText: '',
    size: sizeLabel(partial.techSize, partial.wbSize, 'both'),
    ...partial
  }
}

export const wildberriesProducts: WildberriesProduct[] = [
  {
    id: 2621,
    photo: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=320&q=80',
    name: 'Джинсы свободные багги, оверсайз, широкие к низу',
    article: 'Джинсы-2621',
    vendorCode: 'WB-2621-BLUE',
    brand: 'Gladkih',
    sizes: [
      buildSizeRow({
        barcode: '2049332136771',
        article: 'Джинсы-2621',
        vendorCode: 'WB-2621-BLUE',
        color: 'синий',
        techSize: '30',
        wbSize: '46',
        productName: 'Джинсы свободные багги, оверсайз, широкие к низу',
        sellerName: 'ИП Гладких Елена Евгеньевна',
        brand: 'Gladkih',
        quantity: 1
      }),
      buildSizeRow({
        barcode: '2049332136849',
        article: 'Джинсы-2621',
        vendorCode: 'WB-2621-BLUE',
        color: 'синий',
        techSize: '29',
        wbSize: '44',
        productName: 'Джинсы свободные багги, оверсайз, широкие к низу',
        sellerName: 'ИП Гладких Елена Евгеньевна',
        brand: 'Gladkih',
        quantity: 1
      }),
      buildSizeRow({
        barcode: '2049332136788',
        article: 'Джинсы-2621',
        vendorCode: 'WB-2621-BLUE',
        color: 'синий',
        techSize: '31',
        wbSize: '48',
        productName: 'Джинсы свободные багги, оверсайз, широкие к низу',
        sellerName: 'ИП Гладких Елена Евгеньевна',
        brand: 'Gladkih',
        quantity: 1
      }),
      buildSizeRow({
        barcode: '2049332136795',
        article: 'Джинсы-2621',
        vendorCode: 'WB-2621-BLUE',
        color: 'синий',
        techSize: '32',
        wbSize: '50',
        productName: 'Джинсы свободные багги, оверсайз, широкие к низу',
        sellerName: 'ИП Гладких Елена Евгеньевна',
        brand: 'Gladkih',
        quantity: 1
      })
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
      buildSizeRow({
        barcode: '2037710010181',
        article: 'Рубашка-1018',
        vendorCode: 'WB-1018-WHITE',
        color: 'белый',
        techSize: 'S',
        wbSize: '44',
        productName: 'Рубашка хлопковая свободного кроя',
        sellerName: 'ООО Северная линия',
        brand: 'Nord Line',
        quantity: 2
      }),
      buildSizeRow({
        barcode: '2037710010182',
        article: 'Рубашка-1018',
        vendorCode: 'WB-1018-WHITE',
        color: 'белый',
        techSize: 'M',
        wbSize: '46',
        productName: 'Рубашка хлопковая свободного кроя',
        sellerName: 'ООО Северная линия',
        brand: 'Nord Line',
        quantity: 3
      })
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
      buildSizeRow({
        barcode: '2073340000401',
        article: 'Кроссовки-3340',
        vendorCode: 'WB-3340-GRAY',
        color: 'серый',
        techSize: '40',
        wbSize: '40',
        productName: 'Кроссовки повседневные текстильные',
        sellerName: 'ООО Степвей',
        brand: 'Stepway',
        quantity: 4
      }),
      buildSizeRow({
        barcode: '2073340000418',
        article: 'Кроссовки-3340',
        vendorCode: 'WB-3340-GRAY',
        color: 'серый',
        techSize: '41',
        wbSize: '41',
        productName: 'Кроссовки повседневные текстильные',
        sellerName: 'ООО Степвей',
        brand: 'Stepway',
        quantity: 4
      }),
      buildSizeRow({
        barcode: '2073340000425',
        article: 'Кроссовки-3340',
        vendorCode: 'WB-3340-GRAY',
        color: 'серый',
        techSize: '42',
        wbSize: '42',
        productName: 'Кроссовки повседневные текстильные',
        sellerName: 'ООО Степвей',
        brand: 'Stepway',
        quantity: 2
      })
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

export function sizeLabel(techSize: string, wbSize: string, mode: SizeDisplayMode): string {
  if (mode === 'tech') return techSize || '—'
  if (mode === 'wb') return wbSize || '—'
  if (techSize && wbSize && techSize !== wbSize) return `${techSize}/${wbSize}`
  return techSize || wbSize || '—'
}

export type BulkKey =
  | 'vendorCode'
  | 'color'
  | 'productName'
  | 'sellerName'
  | 'brand'
  | 'expiryDate'
  | 'country'
  | 'composition'
  | 'supplier'
  | 'freeText'
  | 'quantity'

export function applyBulkValue<T extends WildberriesSizeRow>(rows: T[], field: BulkKey, value: string): T[] {
  if (value === '') return rows
  const parsed: WildberriesSizeRow[keyof WildberriesSizeRow] =
    field === 'quantity' ? Number(value) || 0 : value
  return rows.map((row) => ({ ...row, [field]: parsed }))
}

export interface AdditionalFieldDescriptor {
  key: keyof AdditionalFields
  label: string
  rowField: keyof WildberriesSizeRow
  bulkField: BulkKey
}

export const additionalFieldDescriptors: AdditionalFieldDescriptor[] = [
  { key: 'showExpiry', label: 'Срок годности', rowField: 'expiryDate', bulkField: 'expiryDate' },
  { key: 'showCountry', label: 'Страна', rowField: 'country', bulkField: 'country' },
  { key: 'showBrand', label: 'Бренд', rowField: 'brand', bulkField: 'brand' },
  { key: 'showComposition', label: 'Состав', rowField: 'composition', bulkField: 'composition' },
  { key: 'showSupplier', label: 'Поставщик', rowField: 'supplier', bulkField: 'supplier' },
  { key: 'showFreeText', label: 'Свободная надпись', rowField: 'freeText', bulkField: 'freeText' }
]
