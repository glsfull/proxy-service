import { describe, expect, it } from 'vitest'
import { findProductById, wildberriesProducts } from '../utils/marketplaceLabels'
import {
  applyBulkValue,
  buildProductRows,
  emptyBulkValues,
  totalLabelCount,
  updateRow
} from '../utils/productRows'

describe('product rows', () => {
  it('builds editable rows out of a product with split sizes', () => {
    const product = findProductById(wildberriesProducts, 2621)
    const rows = product ? buildProductRows(product) : []
    expect(rows).toHaveLength(4)
    expect(rows[0].techSize).toBe('30')
    expect(rows[0].wbSize).toBe('46')
    expect(rows[0].vendorCode).toBe('WB-2621-BLUE')
    expect(rows[0].rowId).toContain('2049332136771')
    expect(rows[0].country).toBe('Россия')
  })

  it('builds rows for sizes that do not contain a slash', () => {
    const product = findProductById(wildberriesProducts, 1018)
    const rows = product ? buildProductRows(product) : []
    expect(rows[0].techSize).toBe('S')
    expect(rows[0].wbSize).toBe('S')
  })

  it('applies a bulk value to every row and ignores empty input', () => {
    const product = findProductById(wildberriesProducts, 1018)
    const rows = product ? buildProductRows(product) : []
    const updated = applyBulkValue(rows, 'sellerName', 'ООО «Новая линия»')
    expect(updated.every((row) => row.sellerName === 'ООО «Новая линия»')).toBe(true)
    expect(updated).not.toBe(rows)
    expect(applyBulkValue(rows, 'sellerName', '')).toBe(rows)
  })

  it('clamps quantity bulk updates to integers >= 1', () => {
    const product = findProductById(wildberriesProducts, 1018)
    const rows = product ? buildProductRows(product) : []
    const updated = applyBulkValue(rows, 'quantity', '0.4')
    expect(updated.every((row) => row.quantity === 1)).toBe(true)
  })

  it('updates a single row immutably and ignores invalid indices', () => {
    const product = findProductById(wildberriesProducts, 1018)
    const rows = product ? buildProductRows(product) : []
    const updated = updateRow(rows, 1, 'color', 'красный')
    expect(updated[1].color).toBe('красный')
    expect(updated[0].color).toBe(rows[0].color)
    expect(updateRow(rows, -1, 'color', 'неважно')).toBe(rows)
    expect(updateRow(rows, 99, 'color', 'неважно')).toBe(rows)
  })

  it('totals quantities across rows', () => {
    const product = findProductById(wildberriesProducts, 1018)
    const rows = product ? buildProductRows(product) : []
    expect(totalLabelCount(rows)).toBe(5)
  })

  it('returns empty bulk values', () => {
    expect(emptyBulkValues()).toMatchObject({ vendorCode: '', quantity: '', country: '' })
  })
})
