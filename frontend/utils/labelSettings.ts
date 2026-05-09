export type BarcodeIndex = 0 | 1 | 2
export type SizeDisplayMode = 'tech' | 'wb' | 'both'
export type MediaType = 'a4' | 'thermal'
export type BarcodeFormat = 'CODE128' | 'EAN13' | 'CODE39'
export type TextAlign = 'center' | 'left'

export interface ThermalSize {
  label: string
  widthMm: number
  heightMm: number
}

export interface AdditionalFields {
  showExpiry: boolean
  showCountry: boolean
  showBrand: boolean
  showComposition: boolean
  showSupplier: boolean
  showFreeText: boolean
  showEac: boolean
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

export const THERMAL_SIZES: ThermalSize[] = [
  { label: '58×40', widthMm: 58, heightMm: 40 },
  { label: '58×60', widthMm: 58, heightMm: 60 },
  { label: '40×30', widthMm: 40, heightMm: 30 },
  { label: '75×120', widthMm: 75, heightMm: 120 }
]

export const BARCODE_FORMATS: BarcodeFormat[] = ['CODE128', 'EAN13', 'CODE39']

export const SIZE_DISPLAY_MODES: { id: SizeDisplayMode; label: string }[] = [
  { id: 'tech', label: 'Производителя' },
  { id: 'wb', label: 'Российский' },
  { id: 'both', label: 'Пр/Рос' }
]

export const TEXT_ALIGNS: { id: TextAlign; label: string }[] = [
  { id: 'center', label: 'По центру' },
  { id: 'left', label: 'Слева' }
]

export const MEDIA_TYPES: { id: MediaType; label: string }[] = [
  { id: 'a4', label: 'А4' },
  { id: 'thermal', label: 'Термо' }
]

export const ADDITIONAL_FIELD_LABELS: { key: keyof AdditionalFields; label: string }[] = [
  { key: 'showExpiry', label: 'Срок годности' },
  { key: 'showCountry', label: 'Страна' },
  { key: 'showBrand', label: 'Бренд' },
  { key: 'showComposition', label: 'Состав' },
  { key: 'showSupplier', label: 'Поставщик' },
  { key: 'showFreeText', label: 'Свободная надпись' },
  { key: 'showEac', label: 'EAC' }
]

export const FONT_SIZE_MIN = 6
export const FONT_SIZE_MAX = 16

export function defaultLabelSettings(): LabelSettings {
  return {
    barcodeIndex: 0,
    sizeDisplayMode: 'both',
    mediaType: 'thermal',
    thermalSize: THERMAL_SIZES[0],
    fontSize: 12,
    barcodeFormat: 'CODE128',
    textAlign: 'center',
    additionalFields: {
      showExpiry: false,
      showCountry: false,
      showBrand: true,
      showComposition: false,
      showSupplier: false,
      showFreeText: false,
      showEac: true
    }
  }
}

export function clampFontSize(value: number): number {
  if (Number.isNaN(value)) return FONT_SIZE_MIN
  return Math.min(Math.max(Math.round(value), FONT_SIZE_MIN), FONT_SIZE_MAX)
}

export function sizeLabel(techSize: string, wbSize: string, mode: SizeDisplayMode): string {
  const tech = techSize.trim()
  const wb = wbSize.trim()
  if (mode === 'tech') return tech || '—'
  if (mode === 'wb') return wb || '—'
  if (tech && wb) return `${tech}/${wb}`
  return tech || wb || '—'
}

const EAN13_RE = /^\d{13}$/
const CODE39_RE = /^[A-Z0-9 \-.$/+%*]+$/

export function isValidBarcode(value: string, format: BarcodeFormat): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (format === 'EAN13') return EAN13_RE.test(trimmed) && hasValidEan13Checksum(trimmed)
  if (format === 'CODE39') return CODE39_RE.test(trimmed)
  return /^[\x20-\x7e]+$/.test(trimmed)
}

function hasValidEan13Checksum(value: string): boolean {
  const digits = value.split('').map((char) => Number(char))
  const checksum = digits.pop() ?? 0
  const sum = digits.reduce((acc, digit, index) => acc + digit * (index % 2 === 0 ? 1 : 3), 0)
  const calculated = (10 - (sum % 10)) % 10
  return calculated === checksum
}
