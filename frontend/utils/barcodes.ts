export type BarcodeType = 'ean13' | 'ean8' | 'code128' | 'qr' | 'datamatrix'

export type BarcodeStatus = 'active' | 'draft' | 'paused'

export interface BarcodeConfig {
  id: number
  name: string
  type: BarcodeType
  source: string
  owner: string
  status: BarcodeStatus
  color: string
  sample: string
  createdAt: string
}

export interface BarcodeTemplate {
  type: BarcodeType
  label: string
  description: string
  format: string
  analytics: string[]
  sample: string
}

export const barcodeTemplates: BarcodeTemplate[] = [
  {
    type: 'ean13',
    label: 'EAN-13',
    description: 'Розничные товары, маркетплейсы, складские карточки.',
    format: '13 цифр',
    analytics: ['Продажи по SKU', 'Сравнение каналов', 'Возвраты'],
    sample: '4601234567893'
  },
  {
    type: 'ean8',
    label: 'EAN-8',
    description: 'Малые упаковки и короткие товарные идентификаторы.',
    format: '8 цифр',
    analytics: ['Остатки', 'Сканирования', 'Оборачиваемость'],
    sample: '96385074'
  },
  {
    type: 'code128',
    label: 'Code 128',
    description: 'Логистика, внутренние партии, серийные номера.',
    format: 'До 48 латинских символов, цифр и знаков',
    analytics: ['Маршруты', 'Партии', 'Ошибки приемки'],
    sample: 'WH-24-A9-105'
  },
  {
    type: 'qr',
    label: 'QR',
    description: 'Ссылки, промокоды, клиентские сценарии и офлайн-точки.',
    format: 'URL или произвольный текст до 160 символов',
    analytics: ['Переходы', 'Кампании', 'География'],
    sample: 'https://example.ru/campaign/spring'
  },
  {
    type: 'datamatrix',
    label: 'Data Matrix',
    description: 'Маркировка, лекарства, табак, обувь и прослеживаемость.',
    format: 'Код маркировки до 120 символов',
    analytics: ['Прослеживаемость', 'Статусы ЧЗ', 'Списания'],
    sample: '0104601234567893215ABCDEF'
  }
]

export const initialBarcodes: BarcodeConfig[] = [
  {
    id: 1,
    name: 'Маркетплейс Wildberries',
    type: 'ean13',
    source: 'Каталог товаров',
    owner: 'Команда продаж',
    status: 'active',
    color: 'emerald',
    sample: '4601234567893',
    createdAt: '2026-05-09'
  },
  {
    id: 2,
    name: 'Промо QR для розницы',
    type: 'qr',
    source: 'POS-материалы',
    owner: 'Маркетинг',
    status: 'draft',
    color: 'sky',
    sample: 'https://example.ru/promo/may',
    createdAt: '2026-05-09'
  },
  {
    id: 3,
    name: 'Маркировка партий',
    type: 'datamatrix',
    source: 'Честный знак',
    owner: 'Склад',
    status: 'active',
    color: 'amber',
    sample: '0104601234567893215ABCDEF',
    createdAt: '2026-05-09'
  }
]

export function getBarcodeTemplate(type: BarcodeType) {
  return barcodeTemplates.find((template) => template.type === type)
}

export function validateBarcodeValue(type: BarcodeType, value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Введите значение баркода.'
  }

  if (type === 'ean13' && !/^\d{13}$/.test(trimmed)) {
    return 'EAN-13 должен состоять ровно из 13 цифр.'
  }

  if (type === 'ean8' && !/^\d{8}$/.test(trimmed)) {
    return 'EAN-8 должен состоять ровно из 8 цифр.'
  }

  if (type === 'code128' && !/^[\x20-\x7E]{1,48}$/.test(trimmed)) {
    return 'Code 128 принимает до 48 печатных латинских символов.'
  }

  if (type === 'qr' && trimmed.length > 160) {
    return 'QR-код ограничен 160 символами для удобного сканирования.'
  }

  if (type === 'datamatrix' && trimmed.length > 120) {
    return 'Data Matrix ограничен 120 символами.'
  }

  return null
}

export function statusLabel(status: BarcodeStatus) {
  return {
    active: 'Активен',
    draft: 'Черновик',
    paused: 'Пауза'
  }[status]
}
