import { describe, expect, it } from 'vitest'
import { CURRENT_WORK, PLANNED_WORK, buildBaklog } from '../utils/baklog'

describe('baklog generator', () => {
  it('builds the markdown header, sections and entries', () => {
    const md = buildBaklog({
      generatedAt: new Date('2026-05-09T20:00:00Z'),
      current: CURRENT_WORK,
      planned: PLANNED_WORK
    })
    expect(md).toContain('# Бэклог: дашборд аналитики и генератор этикеток')
    expect(md).toContain('> Сгенерировано: 2026-05-09 20:00 UTC.')
    expect(md).toContain('## Текущие работы')
    expect(md).toContain('## Запланированные работы')
    expect(md).toContain(`- **${CURRENT_WORK[0].title}**`)
    expect(md).toContain(`- **${PLANNED_WORK[0].title}**`)
  })

  it('reports an empty section instead of an empty list', () => {
    const md = buildBaklog({
      generatedAt: new Date('2026-05-09T20:00:00Z'),
      current: [],
      planned: []
    })
    expect(md).toContain('_Пока нет записей._')
  })
})
