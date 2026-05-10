<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { selectedMarketplace, currentMarketplace } = useMarketplaceSwitcher()
const { data } = await useFetch('/api/analytics/summary', {
  query: computed(() => ({ marketplace: selectedMarketplace.value })),
  default: () => null,
  ignoreResponseError: true
})

const capabilities = computed(() => (data.value as any)?.capabilities || {})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Остатки</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ currentMarketplace.label }} · Разделение по FBY/FBS, складам, размерам и баркодам.</p>

    <div
      v-if="currentMarketplace.status === 'planned'"
      class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200"
    >
      Модуль {{ currentMarketplace.label }} запланирован. Отображаются данные WB-модуля.
    </div>

    <div v-if="capabilities.stocks === false" class="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-12 flex flex-col items-center gap-3 text-gray-400">
      <UIcon name="i-lucide-boxes" class="text-4xl" />
      <span>Синхронизация остатков недоступна для {{ currentMarketplace.label }}</span>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="row in (data as any)?.stocks || []" :key="`${row.scheme}-${row.barcode}`" class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <UBadge :color="row.scheme === 'FBY' ? 'primary' : 'neutral'" variant="soft">{{ row.scheme }}</UBadge>
            <h2 class="font-semibold text-gray-900 dark:text-white mt-3">{{ row.warehouse }}</h2>
            <p class="text-sm text-gray-500 mt-1">chrtID {{ row.chrtId }} · {{ row.barcode }}</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ row.quantity }}</div>
            <div class="text-xs text-gray-500">доступно</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-5 text-sm">
          <div class="rounded-md bg-gray-50 dark:bg-gray-950 p-3">
            <div class="text-gray-500">Размер</div>
            <div class="font-medium text-gray-900 dark:text-white mt-1">{{ row.size }}</div>
          </div>
          <div class="rounded-md bg-gray-50 dark:bg-gray-950 p-3">
            <div class="text-gray-500">Резерв</div>
            <div class="font-medium text-gray-900 dark:text-white mt-1">{{ row.reserved }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
