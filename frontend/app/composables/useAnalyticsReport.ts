type ReportPayload = Record<string, any>

function csvEscape(value: unknown) {
  const text = String(value ?? '')
  return /[",\n;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function useAnalyticsReport() {
  const downloadReport = (payload: ReportPayload, filename = 'analytics-report.csv') => {
    if (typeof document === 'undefined') return

    const rows = [
      ['Раздел', 'Показатель', 'Значение'],
      ['Маркетплейс', 'Код', payload.marketplace],
      ['Период', 'Фильтр', payload.period],
      ...Object.entries(payload.totals || {}).map(([key, value]) => ['Итого', key, value]),
      ...((payload.products || []) as any[]).map(product => ['Товар', product.vendorCode || product.nmId, `${product.title}; цена ${product.price}; закупка ${product.purchasePrice}; остаток ${product.stock}`]),
      ...((payload.finance || []) as any[]).map(row => ['Финансы', `${row.date} ${row.operation}`, row.amount]),
      ...((payload.expenses || []) as any[]).map(row => ['Расходы', row.type, row.amount])
    ]

    const csv = rows.map(row => row.map(csvEscape).join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return { downloadReport }
}
