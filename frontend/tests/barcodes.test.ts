import { describe, expect, it } from 'vitest'
import { barcodeTemplates, getBarcodeTemplate, validateBarcodeValue } from '../utils/barcodes'

describe('barcode workflow data', () => {
  it('contains multiple barcode types for dashboard configuration', () => {
    expect(barcodeTemplates.map((template) => template.type)).toEqual([
      'ean13',
      'ean8',
      'code128',
      'qr',
      'datamatrix'
    ])
  })

  it('returns template metadata for a selected barcode type', () => {
    expect(getBarcodeTemplate('qr')?.analytics).toContain('Кампании')
  })

  it('validates numeric barcode formats', () => {
    expect(validateBarcodeValue('ean13', '4601234567893')).toBeNull()
    expect(validateBarcodeValue('ean13', '460123')).toBe('EAN-13 должен состоять ровно из 13 цифр.')
    expect(validateBarcodeValue('ean8', '96385074')).toBeNull()
    expect(validateBarcodeValue('ean8', 'ABC')).toBe('EAN-8 должен состоять ровно из 8 цифр.')
  })

  it('validates variable length barcode formats', () => {
    expect(validateBarcodeValue('code128', 'WH-24-A9-105')).toBeNull()
    expect(validateBarcodeValue('qr', 'x'.repeat(161))).toBe('QR-код ограничен 160 символами для удобного сканирования.')
    expect(validateBarcodeValue('datamatrix', 'x'.repeat(121))).toBe('Data Matrix ограничен 120 символами.')
  })
})
