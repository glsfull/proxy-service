<script setup lang="ts">
definePageMeta({ layout: 'default' })

const operation = ref('all')
const { selectedMarketplace, currentMarketplace } = useMarketplaceSwitcher()

const { data } = await useFetch('/api/analytics/summary', {
  query: computed(() => ({ marketplace: selectedMarketplace.value })),
  default: () => null,
  ignoreResponseError: true
})

const capabilities = computed(() => (data.value as any)?.capabilities || {})
const rows = computed(() => {
  const source = ((data.value as any)?.finance || []) as any[]
  return operation.value === 'all' ? source : source.filter(row => row.operation === operation.value)
})
const operations = computed(() => ['all', ...new Set((((data.value as any)?.finance || []) as any[]).map(row => row.operation))])
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Финансовые отчёты</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ currentMarketplace.label }} · Строки реализации и эквайринга с привязкой к nmID и srid.</p>
      </div>
      <USelect v-model="operation" :items="operations.map(value => ({ label: value === 'all' ? 'Все операции' : value, value }))" value-key="value" label-key="label" class="w-52" />
    </div>

    <div
      v-if="currentMarketplace.status === 'planned'"
      class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200"
    >
      Модуль {{ currentMarketplace.label }} запланирован. Отображаются данные WB-модуля.
    </div>

    <div v-if="capabilities.finance === false" class="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-12 flex flex-col items-center gap-3 text-gray-400">
      <UIcon name="i-lucide-receipt-text" class="text-4xl" />
      <span>Финансовые отчёты недоступны для {{ currentMarketplace.label }}</span>
    </div>
    <div v-else class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-gray-500 bg-gray-50 dark:bg-gray-950/60">
            <tr>
              <th class="px-5 py-3 font-medium">Дата</th>
              <th class="px-5 py-3 font-medium">Операция</th>
              <th class="px-5 py-3 font-medium">Бренд</th>
              <th class="px-5 py-3 font-medium">Идентификаторы</th>
              <th class="px-5 py-3 font-medium text-right">Сумма</th>
              <th class="px-5 py-3 font-medium text-right">Комиссия</th>
              <th class="px-5 py-3 font-medium text-right">Логистика</th>
              <th class="px-5 py-3 font-medium text-right">Эквайринг</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="row in rows" :key="`${row.date}-${row.operation}-${row.srid}`">
              <td class="px-5 py-3">{{ row.date }}</td>
              <td class="px-5 py-3">{{ row.operation }}</td>
              <td class="px-5 py-3">{{ row.brand }}</td>
              <td class="px-5 py-3 text-gray-500">nmID {{ row.nmId }} · {{ row.srid }}</td>
              <td class="px-5 py-3 text-right font-medium">{{ row.amount.toLocaleString('ru-RU') }} ₽</td>
              <td class="px-5 py-3 text-right">{{ row.commission.toLocaleString('ru-RU') }} ₽</td>
              <td class="px-5 py-3 text-right">{{ row.logistics.toLocaleString('ru-RU') }} ₽</td>
              <td class="px-5 py-3 text-right">{{ row.acquiring.toLocaleString('ru-RU') }} ₽</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
