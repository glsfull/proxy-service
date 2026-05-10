<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { data } = await useFetch('/api/analytics/summary', { default: () => null, ignoreResponseError: true })

function statusLabel(status: string) {
  return status === 'done' ? 'Готово' : status === 'running' ? 'Выполняется' : 'В очереди'
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Настройки синхронизации</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Цикл WB: баланс, карточки, остатки, цены, финансы.</p>
      </div>
      <UButton icon="i-lucide-play">Запустить цикл</UButton>
    </div>
    <div class="space-y-3">
      <div v-for="(step, index) in (data as any)?.sync || []" :key="step.step" class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-200">{{ Number(index) + 1 }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-semibold text-gray-900 dark:text-white">{{ step.step }}</h2>
              <UBadge :color="step.status === 'done' ? 'success' : step.status === 'running' ? 'warning' : 'neutral'" variant="soft">{{ statusLabel(step.status) }}</UBadge>
            </div>
            <p class="text-sm text-gray-500 mt-1 truncate">{{ step.endpoint }}</p>
          </div>
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ step.duration }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
