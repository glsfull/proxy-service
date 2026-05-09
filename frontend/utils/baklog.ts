export interface BaklogEntry {
  title: string
  description: string
}

export interface BaklogInput {
  generatedAt: Date
  current: BaklogEntry[]
  planned: BaklogEntry[]
}

export const CURRENT_WORK: BaklogEntry[] = [
  {
    title: 'Дашборд аналитики с генератором этикеток',
    description:
      'Боковое меню в стиле wb-analitika, страница «Генератор этикеток маркетплейсов» с вкладками Wildberries, Ozon и Яндекс Маркет.'
  },
  {
    title: 'Карточки товаров и сортировка по артикулу',
    description:
      'Wildberries отображает карточки, выгруженные через API. Список сортируется по артикулу.'
  },
  {
    title: 'Детальная таблица размеров и штрихкодов',
    description:
      'Открытие карточки переключает вид на таблицу с штрихкодом, артикулом, цветом, размером, названием, продавцом, брендом и количеством.'
  },
  {
    title: 'Настройки этикетки и предпросмотр',
    description:
      'Переключатели позиции штрихкода, режима размера, типа носителя (А4/Термо), формата (CODE128/EAN13/CODE39), шрифта и выравнивания текста, плюс встроенный предпросмотр этикетки.'
  },
  {
    title: 'Дополнительные поля и массовое заполнение',
    description:
      'Чек-боксы для срока годности, страны, бренда, состава, поставщика, свободной надписи и EAC. В шапке таблицы доступны поля «Для всех…» с кнопкой применения ко всем строкам.'
  },
  {
    title: 'Документация пользователя и описание функциональности',
    description:
      'Файлы frontend/docs/user-guide.md и frontend/docs/feature-description.md описывают сценарий и поведение интерфейса.'
  }
]

export const PLANNED_WORK: BaklogEntry[] = [
  {
    title: 'Полноценные вкладки Ozon и Яндекс Маркет',
    description:
      'Подключение источников данных и адаптация таблицы под особенности структур Ozon и Yandex Market.'
  },
  {
    title: 'Реальная генерация PDF и термопечати',
    description:
      'Подключение библиотеки печати штрихкодов и генерации PDF под форматы А4 и термоэтикеток.'
  },
  {
    title: 'Сохранение пользовательских настроек',
    description:
      'Сохранение per-user настроек (формат, шрифт, выравнивание, выбранные доп. поля) в Supabase.'
  },
  {
    title: 'История изменений этикеток',
    description:
      'Лог изменений по карточке для контроля массовых правок и возможности отката.'
  },
  {
    title: 'Экспорт baklog.md в CI',
    description:
      'Запуск npm run baklog при каждом релизе и автоматический коммит обновлённого baklog.md в репозиторий.'
  }
]

export function buildBaklog(input: BaklogInput): string {
  const lines: string[] = []
  lines.push('# Бэклог: дашборд аналитики и генератор этикеток')
  lines.push('')
  lines.push(`> Сгенерировано: ${formatDate(input.generatedAt)}.`)
  lines.push('')
  lines.push('## Текущие работы')
  lines.push('')
  appendEntries(lines, input.current)
  lines.push('')
  lines.push('## Запланированные работы')
  lines.push('')
  appendEntries(lines, input.planned)
  lines.push('')
  return lines.join('\n')
}

function appendEntries(lines: string[], entries: BaklogEntry[]): void {
  if (!entries.length) {
    lines.push('_Пока нет записей._')
    return
  }
  for (const entry of entries) {
    lines.push(`- **${entry.title}** — ${entry.description}`)
  }
}

function formatDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getUTCDate())
  const hours = pad(date.getUTCHours())
  const minutes = pad(date.getUTCMinutes())
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`
}
