<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl mb-4">
          <UIcon name="i-lucide-bar-chart-2" class="text-purple-600 text-3xl" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">WB Аналитика</h1>
        <p class="text-sm text-gray-500 mt-1">Платформа аналитики Wildberries</p>
      </div>
      <slot />
    </div>
  </div>
</template>
