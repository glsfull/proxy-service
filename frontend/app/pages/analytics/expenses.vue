<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { data } = await useFetch('/api/analytics/summary', { default: () => null, ignoreResponseError: true })
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Расходы</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Учет закупки, фулфилмента, налогов, рекламы и прочих затрат для расчета чистой прибыли.</p>
    <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div v-for="expense in (data as any)?.expenses || []" :key="expense.type" class="grid grid-cols-1 sm:grid-cols-[1fr_160px_120px] gap-3 px-5 py-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800 items-center">
        <div>
          <div class="font-medium text-gray-900 dark:text-white">{{ expense.type }}</div>
          <div class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-2">
            <div class="h-full bg-green-500" :style="{ width: `${expense.share}%` }" />
          </div>
        </div>
        <div class="font-semibold text-gray-900 dark:text-white sm:text-right">{{ expense.amount.toLocaleString('ru-RU') }} ₽</div>
        <UButton size="sm" variant="soft" icon="i-lucide-pencil">Изменить</UButton>
      </div>
    </div>
  </div>
</template>
