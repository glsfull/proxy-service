import type { WildberriesProduct, WildberriesSizeRow } from './marketplaceLabels'

export interface ProductRow extends WildberriesSizeRow {
  rowId: string
  techSize: string
  wbSize: string
  vendorCode: string
  title: string
  expiryDate: string
  country: string
  composition: string
  supplier: string
  freeText: string
  allBarcodes: string[]
}

export type BulkField =
  | 'vendorCode'
  | 'color'
  | 'sellerName'
  | 'brand'
  | 'expiryDate'
  | 'country'
  | 'composition'
  | 'supplier'
  | 'freeText'
  | 'quantity'

export interface BulkValues {
  vendorCode: string
  color: string
  sellerName: string
  brand: string
  expiryDate: string
  country: string
  composition: string
  supplier: string
  freeText: string
  quantity: string
}

export function emptyBulkValues(): BulkValues {
  return {
    vendorCode: '',
    color: '',
    sellerName: '',
    brand: '',
    expiryDate: '',
    country: '',
    composition: '',
    supplier: '',
    freeText: '',
    quantity: ''
  }
}

export function buildProductRows(product: WildberriesProduct): ProductRow[] {
  return product.sizes.map((size, index) => {
    const [techSize, wbSize] = splitSize(size.size)
    return {
      ...size,
      rowId: `${product.id}-${index}-${size.barcode}`,
      vendorCode: product.vendorCode,
      title: product.name,
      techSize,
      wbSize,
      expiryDate: '',
      country: 'Россия',
      composition: '',
      supplier: '',
      freeText: '',
      allBarcodes: [size.barcode]
    }
  })
}

function splitSize(value: string): [string, string] {
  const trimmed = value.trim()
  if (!trimmed) return ['', '']
  const sep = trimmed.indexOf('/')
  if (sep === -1) return [trimmed, trimmed]
  return [trimmed.slice(0, sep).trim(), trimmed.slice(sep + 1).trim()]
}

export function applyBulkValue<F extends BulkField>(
  rows: ProductRow[],
  field: F,
  value: string
): ProductRow[] {
  if (value === '') return rows
  if (field === 'quantity') {
    const numeric = Math.max(1, Math.round(Number(value) || 0))
    return rows.map((row) => ({ ...row, quantity: numeric }))
  }
  return rows.map((row) => ({ ...row, [field]: value }))
}

export function updateRow<F extends keyof ProductRow>(
  rows: ProductRow[],
  index: number,
  field: F,
  value: ProductRow[F]
): ProductRow[] {
  if (index < 0 || index >= rows.length) return rows
  const next = rows.slice()
  next[index] = { ...next[index], [field]: value }
  return next
}

export function totalLabelCount(rows: ProductRow[]): number {
  return rows.reduce((sum, row) => sum + (Number.isFinite(row.quantity) ? row.quantity : 0), 0)
}
