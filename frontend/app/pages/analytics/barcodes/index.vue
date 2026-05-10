<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search = ref('')
const { selectedMarketplace, currentMarketplace } = useMarketplaceSwitcher()

const { data } = await useFetch('/api/analytics/summary', {
  query: computed(() => ({ marketplace: selectedMarketplace.value })),
  default: () => null,
  ignoreResponseError: true
})

const products = computed(() => {
  const query = search.value.toLowerCase()
  return (((data.value as any)?.products || []) as any[]).filter(product =>
    [product.title, product.vendorCode, product.supplierArticle, product.brand, product.color, product.barcode]
      .join(' ')
      .toLowerCase()
      .includes(query)
  )
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Генерация Bar-code</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ currentMarketplace.label }} · Выбор карточки товара для подготовки этикеток.</p>
      </div>
      <UInput v-model="search" icon="i-lucide-search" placeholder="Поиск по карточкам" class="w-full sm:w-80" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <NuxtLink
        v-for="product in products"
        :key="product.nmId"
        :to="`/analytics/barcodes/${product.nmId}`"
        class="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-900/70"
      >
        <img :src="product.image" :alt="product.title" class="h-40 w-full rounded-md object-cover bg-gray-100">
        <div class="mt-4 flex items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-gray-900 dark:text-white">{{ product.title }}</h2>
            <p class="mt-1 text-sm text-gray-500">{{ product.brand }} · {{ product.color }} · {{ product.size }}</p>
          </div>
          <UIcon name="i-lucide-arrow-right" class="mt-1 text-gray-400" />
        </div>
        <div class="mt-4 text-xs text-gray-500">
          <div>Артикул {{ product.supplierArticle }}</div>
          <div>Bar-code {{ product.barcode }}</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
