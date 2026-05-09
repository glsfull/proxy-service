import { describe, expect, it } from 'vitest'
import {
  ADDITIONAL_FIELD_LABELS,
  BARCODE_FORMATS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  THERMAL_SIZES,
  clampFontSize,
  defaultLabelSettings,
  isValidBarcode,
  sizeLabel
} from '../utils/labelSettings'

describe('label settings', () => {
  it('exposes a default thermal size and supported formats', () => {
    const settings = defaultLabelSettings()
    expect(settings.thermalSize).toEqual(THERMAL_SIZES[0])
    expect(BARCODE_FORMATS).toEqual(['CODE128', 'EAN13', 'CODE39'])
  })

  it('clamps the font size to the supported range', () => {
    expect(clampFontSize(FONT_SIZE_MIN - 5)).toBe(FONT_SIZE_MIN)
    expect(clampFontSize(FONT_SIZE_MAX + 12)).toBe(FONT_SIZE_MAX)
    expect(clampFontSize(10.6)).toBe(11)
  })

  it('renders the size label depending on display mode', () => {
    expect(sizeLabel('30', '46', 'tech')).toBe('30')
    expect(sizeLabel('30', '46', 'wb')).toBe('46')
    expect(sizeLabel('30', '46', 'both')).toBe('30/46')
    expect(sizeLabel('', '', 'both')).toBe('—')
  })

  it('lists toggleable additional fields with labels', () => {
    const keys = ADDITIONAL_FIELD_LABELS.map((field) => field.key)
    expect(keys).toEqual([
      'showExpiry',
      'showCountry',
      'showBrand',
      'showComposition',
      'showSupplier',
      'showFreeText',
      'showEac'
    ])
  })

  it('validates barcodes against the chosen format', () => {
    expect(isValidBarcode('2049332136771', 'EAN13')).toBe(true)
    expect(isValidBarcode('2049332136772', 'EAN13')).toBe(false)
    expect(isValidBarcode('CODE-39 OK', 'CODE39')).toBe(true)
    expect(isValidBarcode('lower-case', 'CODE39')).toBe(false)
    expect(isValidBarcode('Любой ASCII штрих', 'CODE128')).toBe(false)
    expect(isValidBarcode('Hello-World 1', 'CODE128')).toBe(true)
    expect(isValidBarcode('   ', 'CODE128')).toBe(false)
  })
})
