<script setup lang="ts">
definePageMeta({ layout: 'default' })

const period = ref('month')
const periods = [
  { label: 'Сегодня', value: 'today' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' }
]

const { selectedMarketplace, currentMarketplace } = useMarketplaceSwitcher()
const { downloadReport } = useAnalyticsReport()

const { data } = await useFetch('/api/analytics/summary', {
  query: computed(() => ({ period: period.value, marketplace: selectedMarketplace.value })),
  default: () => null,
  ignoreResponseError: true
})

const capabilities = computed(() => (data.value as any)?.capabilities || {})

const metrics = computed(() => {
  const totals = (data.value as any)?.totals || {}
  const all = [
    { label: 'Баланс', value: totals.balance, suffix: '₽', icon: 'i-lucide-wallet', tone: 'emerald', cap: 'finance' },
    { label: 'Остатки', value: totals.stock, suffix: 'шт', icon: 'i-lucide-boxes', tone: 'sky', cap: 'stocks' },
    { label: 'Продажи', value: totals.sales, suffix: '₽', icon: 'i-lucide-chart-no-axes-combined', tone: 'violet', cap: 'orders' },
    { label: 'Заказы', value: totals.orders, suffix: 'шт', icon: 'i-lucide-shopping-cart', tone: 'amber', cap: 'orders' },
    { label: 'Выкупы', value: totals.buyouts, suffix: 'шт', icon: 'i-lucide-badge-check', tone: 'green', cap: 'orders' },
    { label: 'Отказы', value: totals.rejections, suffix: 'шт', icon: 'i-lucide-circle-minus', tone: 'rose', cap: 'orders' },
    { label: 'Возвраты', value: totals.returns, suffix: 'шт', icon: 'i-lucide-rotate-ccw', tone: 'orange', cap: 'orders' }
  ]
  return all.filter(m => capabilities.value[m.cap] !== false)
})

function formatNumber(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value || 0)
}

function exportCurrentReport() {
  downloadReport(data.value as any, `analytics-${selectedMarketplace.value}-${period.value}.csv`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Главная сводка</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ (data as any)?.profile?.companyName }} · {{ currentMarketplace.label }} · обновлено {{ new Date((data as any)?.updatedAt || Date.now()).toLocaleString('ru-RU') }}
        </p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <USelect v-model="period" :items="periods" value-key="value" label-key="label" class="w-44" />
        <UButton icon="i-lucide-download" color="neutral" variant="soft" @click="exportCurrentReport">
          Выгрузка отчёта
        </UButton>
      </div>
    </div>

    <div
      v-if="currentMarketplace.status === 'planned'"
      class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200"
    >
      Модуль {{ currentMarketplace.label }} запланирован. Данные отображаются из активного WB-модуля.
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="metric in metrics" :key="metric.label" class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ metric.label }}</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ formatNumber(metric.value) }} <span class="text-sm font-medium text-gray-400">{{ metric.suffix }}</span></div>
          </div>
          <UIcon :name="metric.icon" class="text-2xl text-gray-400" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <section v-if="capabilities.products !== false" class="lg:col-span-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900 dark:text-white">Товары по продажам</h2>
          <UButton to="/analytics/products" size="sm" variant="ghost" trailing-icon="i-lucide-arrow-right">Открыть</UButton>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left text-gray-500 bg-gray-50 dark:bg-gray-950/60">
              <tr>
                <th class="px-5 py-3 font-medium">Товар</th>
                <th class="px-5 py-3 font-medium">nmID</th>
                <th class="px-5 py-3 font-medium text-right">Заказы</th>
                <th class="px-5 py-3 font-medium text-right">Выручка</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="product in (data as any)?.products || []" :key="product.nmId">
                <td class="px-5 py-3 text-gray-900 dark:text-white">{{ product.title }}</td>
                <td class="px-5 py-3 text-gray-500">{{ product.nmId }}</td>
                <td class="px-5 py-3 text-right">{{ product.ordered }}</td>
                <td class="px-5 py-3 text-right">{{ formatNumber(product.revenue) }} ₽</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div v-else class="lg:col-span-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-8 flex items-center justify-center text-sm text-gray-400">
        Товары недоступны для {{ currentMarketplace.label }}
      </div>

      <section class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <h2 class="font-semibold text-gray-900 dark:text-white mb-4">Расходы</h2>
        <div class="space-y-4">
          <div v-for="expense in (data as any)?.expenses || []" :key="expense.type">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-300">{{ expense.type }}</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatNumber(expense.amount) }} ₽</span>
            </div>
            <div class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div class="h-full bg-green-500" :style="{ width: `${expense.share}%` }" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
