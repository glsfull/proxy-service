<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search = ref('')
const period = ref('month')
const expandedRows = ref(new Set<number>())
const selectedProduct = ref<any>(null)
const productDrafts = ref<Record<number, { purchasePrice: number, preparationCost: number }>>({})
const emptyDraft = { purchasePrice: 0, preparationCost: 0 }
const { selectedMarketplace, currentMarketplace } = useMarketplaceSwitcher()
const { downloadReport } = useAnalyticsReport()

const { data } = await useFetch('/api/analytics/summary', {
  query: computed(() => ({ period: period.value, marketplace: selectedMarketplace.value })),
  default: () => null,
  ignoreResponseError: true
})

const capabilities = computed(() => (data.value as any)?.capabilities || {})

const products = computed(() => {
  if (capabilities.value.products === false) return []
  const query = search.value.toLowerCase()
  return (((data.value as any)?.products || []) as any[]).filter(product =>
    [product.title, product.vendorCode, product.supplierArticle, product.brand, product.category, product.color, product.nmId, product.barcode]
      .join(' ')
      .toLowerCase()
      .includes(query)
  )
})

watch(products, (rows) => {
  for (const product of rows) {
    productDrafts.value[product.nmId] ??= {
      purchasePrice: product.purchasePrice || 0,
      preparationCost: product.preparationCost || 0
    }
  }
  selectedProduct.value = rows[0] || null
}, { immediate: true })

function draftFor(product: any) {
  productDrafts.value[product.nmId] ??= {
    purchasePrice: product.purchasePrice || 0,
    preparationCost: product.preparationCost || 0
  }
  return productDrafts.value[product.nmId] ?? emptyDraft
}

function unitCost(product: any) {
  const draft = draftFor(product)
  return Number(draft.purchasePrice || 0) + Number(draft.preparationCost || 0)
}

function fbyCost(product: any) {
  return unitCost(product) * Number(product.fbyStock || 0)
}

function fbsCost(product: any) {
  return unitCost(product) * Number(product.fbsStock || 0)
}

function totalStockCost(product: any) {
  return fbyCost(product) + fbsCost(product)
}

const totals = computed(() => products.value.reduce((acc, product) => {
  acc.fbyStock += Number(product.fbyStock || 0)
  acc.fbsStock += Number(product.fbsStock || 0)
  acc.inTransitToClient += Number(product.inTransitToClient || 0)
  acc.inTransitToWarehouse += Number(product.inTransitToWarehouse || 0)
  acc.fbyCost += fbyCost(product)
  acc.fbsCost += fbsCost(product)
  acc.stockCost += totalStockCost(product)
  acc.retailValue += (Number(product.fbyStock || 0) + Number(product.fbsStock || 0)) * Number(product.retailPrice || product.price || 0)
  return acc
}, { fbyStock: 0, fbsStock: 0, inTransitToClient: 0, inTransitToWarehouse: 0, fbyCost: 0, fbsCost: 0, stockCost: 0, retailValue: 0 }))

function toggleProduct(nmId: number) {
  const next = new Set(expandedRows.value)
  if (next.has(nmId)) next.delete(nmId)
  else next.add(nmId)
  expandedRows.value = next
  selectedProduct.value = products.value.find(product => product.nmId === nmId) || selectedProduct.value
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(value || 0))} ₽`
}

function exportProductsReport() {
  downloadReport(data.value as any, `products-${selectedMarketplace.value}-${period.value}.csv`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Товары</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ currentMarketplace.label }} · Таблица остатков, себестоимости и розничной оценки.</p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <USelect
          v-model="period"
          :items="[
            { label: 'Сегодня', value: 'today' },
            { label: 'Неделя', value: 'week' },
            { label: 'Месяц', value: 'month' }
          ]"
          value-key="value"
          label-key="label"
          class="w-full sm:w-40"
        />
        <UInput v-model="search" icon="i-lucide-search" placeholder="Поиск по товару" class="w-full sm:w-72" />
        <UButton icon="i-lucide-download" color="neutral" variant="soft" @click="exportProductsReport">
          Выгрузка отчёта
        </UButton>
      </div>
    </div>

    <div
      v-if="currentMarketplace.status === 'planned'"
      class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200"
    >
      Модуль {{ currentMarketplace.label }} запланирован. Отображаются данные WB-модуля.
    </div>

    <div v-if="capabilities.products === false" class="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-12 flex flex-col items-center gap-3 text-gray-400">
      <UIcon name="i-lucide-package-x" class="text-4xl" />
      <span>Синхронизация товаров недоступна для {{ currentMarketplace.label }}</span>
    </div>

    <div v-else class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-[1900px] text-sm">
          <thead class="text-left text-gray-500 bg-gray-50 dark:bg-gray-950/60">
            <tr>
              <th class="px-4 py-3 font-medium">Товар</th>
              <th class="px-4 py-3 font-medium">Категория</th>
              <th class="px-4 py-3 font-medium">Цвет</th>
              <th class="px-4 py-3 font-medium">Брэнд</th>
              <th class="px-4 py-3 font-medium text-right">Остаток FBY</th>
              <th class="px-4 py-3 font-medium text-right">Остаток FBS</th>
              <th class="px-4 py-3 font-medium">Размер</th>
              <th class="px-4 py-3 font-medium text-right">В пути к клиенту</th>
              <th class="px-4 py-3 font-medium text-right">В пути на склад</th>
              <th class="px-4 py-3 font-medium">Bar-code</th>
              <th class="px-4 py-3 font-medium text-right">Себестоимость</th>
              <th class="px-4 py-3 font-medium text-right">Подготовка</th>
              <th class="px-4 py-3 font-medium text-right">Себестоимость FBY</th>
              <th class="px-4 py-3 font-medium text-right">Себестоимость FBS</th>
              <th class="px-4 py-3 font-medium text-right">Все склады</th>
              <th class="px-4 py-3 font-medium text-right">Розничная цена</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <template v-for="product in products" :key="product.nmId">
              <tr class="align-top hover:bg-gray-50 dark:hover:bg-gray-950/50">
                <td class="px-4 py-3">
                  <button type="button" class="flex w-full min-w-80 items-center gap-3 text-left" @click="toggleProduct(product.nmId)">
                    <UIcon :name="expandedRows.has(product.nmId) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" class="text-gray-400" />
                    <img :src="product.image" :alt="product.title" class="h-12 w-12 rounded-md object-cover bg-gray-100">
                    <span>
                      <span class="block font-medium text-gray-900 dark:text-white">{{ product.title }}</span>
                      <span class="block text-xs text-gray-500">Арт. {{ product.supplierArticle }} · nmID {{ product.nmId }}</span>
                      <span class="block text-xs text-gray-500">Вендор-код {{ product.vendorCode }}</span>
                    </span>
                  </button>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ product.category }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ product.color }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ product.brand }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ product.fbyStock }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ product.fbsStock }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ product.size }}</td>
                <td class="px-4 py-3 text-right">{{ product.inTransitToClient }}</td>
                <td class="px-4 py-3 text-right">{{ product.inTransitToWarehouse }}</td>
                <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{{ product.barcode }}</td>
                <td class="px-4 py-3 text-right">
                  <UInput v-model.number="draftFor(product).purchasePrice" type="number" min="0" size="xs" class="w-28" aria-label="Себестоимость" />
                </td>
                <td class="px-4 py-3 text-right">
                  <UInput v-model.number="draftFor(product).preparationCost" type="number" min="0" size="xs" class="w-24" aria-label="Подготовка" />
                </td>
                <td class="px-4 py-3 text-right font-medium">{{ formatMoney(fbyCost(product)) }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ formatMoney(fbsCost(product)) }}</td>
                <td class="px-4 py-3 text-right font-semibold">{{ formatMoney(totalStockCost(product)) }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ formatMoney(product.retailPrice || product.price) }}</td>
              </tr>
              <tr v-if="expandedRows.has(product.nmId)" class="bg-gray-50/80 dark:bg-gray-950/40">
                <td colspan="16" class="px-4 py-4">
                  <div class="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                    <img :src="product.image" :alt="product.title" class="h-36 w-full rounded-md object-cover bg-gray-100">
                    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <div class="rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                        <div class="text-xs text-gray-500">Цена закупки</div>
                        <div class="mt-1 font-semibold text-gray-900 dark:text-white">{{ formatMoney(draftFor(product).purchasePrice) }}</div>
                      </div>
                      <div class="rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                        <div class="text-xs text-gray-500">Заказы / выкупы</div>
                        <div class="mt-1 font-semibold text-gray-900 dark:text-white">{{ product.ordered }} / {{ product.bought }}</div>
                      </div>
                      <div class="rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                        <div class="text-xs text-gray-500">Возвраты / отказы</div>
                        <div class="mt-1 font-semibold text-gray-900 dark:text-white">{{ product.returned }} / {{ product.rejected }}</div>
                      </div>
                      <div class="rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                        <div class="text-xs text-gray-500">chrtID / srid</div>
                        <div class="mt-1 text-sm font-medium text-gray-900 dark:text-white">{{ product.chrtId }} · {{ product.srid }}</div>
                      </div>
                      <div class="rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                        <div class="text-xs text-gray-500">Розничная оценка строки</div>
                        <div class="mt-1 font-semibold text-gray-900 dark:text-white">{{ formatMoney((product.fbyStock + product.fbsStock) * (product.retailPrice || product.price)) }}</div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot class="bg-gray-50 text-sm font-semibold text-gray-900 dark:bg-gray-950/70 dark:text-white">
            <tr>
              <td class="px-4 py-3" colspan="4">Итого</td>
              <td class="px-4 py-3 text-right">{{ totals.fbyStock }}</td>
              <td class="px-4 py-3 text-right">{{ totals.fbsStock }}</td>
              <td class="px-4 py-3" />
              <td class="px-4 py-3 text-right">{{ totals.inTransitToClient }}</td>
              <td class="px-4 py-3 text-right">{{ totals.inTransitToWarehouse }}</td>
              <td class="px-4 py-3" colspan="3" />
              <td class="px-4 py-3 text-right">{{ formatMoney(totals.fbyCost) }}</td>
              <td class="px-4 py-3 text-right">{{ formatMoney(totals.fbsCost) }}</td>
              <td class="px-4 py-3 text-right">{{ formatMoney(totals.stockCost) }}</td>
              <td class="px-4 py-3 text-right">{{ formatMoney(totals.retailValue) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>
