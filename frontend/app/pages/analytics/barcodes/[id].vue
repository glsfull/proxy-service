<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const { selectedMarketplace, currentMarketplace } = useMarketplaceSwitcher()

const { data } = await useFetch('/api/analytics/summary', {
  query: computed(() => ({ marketplace: selectedMarketplace.value })),
  default: () => null,
  ignoreResponseError: true
})

const product = computed(() => (((data.value as any)?.products || []) as any[]).find(row => String(row.nmId) === String(route.params.id)))
const rows = ref<any[]>([])
const labelOptions = ref({
  expiresAt: false,
  country: true,
  brand: true,
  compound: false,
  supplier: true,
  custom: false,
  eac: true
})
const printOptions = ref({
  paperType: 'Термотрансферная',
  labelSize: '58 x 40 мм',
  codeFormat: 'EAN-13',
  fontSize: 10,
  align: 'center'
})
const bulkValues = ref({
  supplierArticle: '',
  color: '',
  brand: ''
})

watch(product, (next) => {
  if (!next || rows.value.length) return
  rows.value = [
    {
      barcode: next.barcode,
      supplierArticle: next.supplierArticle,
      color: next.color,
      size: next.size,
      title: next.title,
      sellerName: (data.value as any)?.profile?.companyName || 'Поставщик WB',
      brand: next.brand,
      quantity: 12
    }
  ]
}, { immediate: true })

function applyBulk(field: 'supplierArticle' | 'color' | 'brand', value: string) {
  rows.value = rows.value.map(row => ({ ...row, [field]: value }))
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <UButton to="/analytics/barcodes" icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="sm" class="mb-2">
          К карточкам
        </UButton>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Этикетки Bar-code</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ currentMarketplace.label }} · {{ product?.title || 'Карточка товара' }}</p>
      </div>
      <UButton icon="i-lucide-printer" color="primary">Подготовить печать</UButton>
    </div>

    <div v-if="!product" class="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center text-gray-500">
      Товар не найден
    </div>

    <template v-else>
      <section class="mb-5 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div class="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <img :src="product.image" :alt="product.title" class="h-48 w-full rounded-md object-cover bg-gray-100">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white mb-2">Поля на этикетке</div>
              <div class="grid grid-cols-2 gap-2">
                <UCheckbox v-model="labelOptions.expiresAt" label="Срок годности" />
                <UCheckbox v-model="labelOptions.country" label="Страна" />
                <UCheckbox v-model="labelOptions.brand" label="Бренд" />
                <UCheckbox v-model="labelOptions.compound" label="Состав" />
                <UCheckbox v-model="labelOptions.supplier" label="Поставщик" />
                <UCheckbox v-model="labelOptions.custom" label="Своя опция" />
                <UCheckbox v-model="labelOptions.eac" label="Лейбл ЕАС" />
              </div>
            </div>
            <div class="space-y-3">
              <USelect v-model="printOptions.paperType" :items="['Термотрансферная', 'Термо ЭКО', 'A4 самоклейка']" class="w-full" />
              <USelect v-model="printOptions.labelSize" :items="['58 x 40 мм', '75 x 120 мм', '100 x 150 мм']" class="w-full" />
              <USelect v-model="printOptions.codeFormat" :items="['EAN-13', 'Code-128', 'DataMatrix']" class="w-full" />
            </div>
            <div class="space-y-3">
              <UInput v-model.number="printOptions.fontSize" type="number" min="8" max="18" icon="i-lucide-case-sensitive" />
              <USelect v-model="printOptions.align" :items="['left', 'center', 'right']" class="w-full" />
              <div class="rounded-md border border-gray-200 p-3 text-center dark:border-gray-800">
                <div class="font-mono text-lg tracking-widest text-gray-900 dark:text-white">|||| |||| ||||</div>
                <div class="mt-1 text-xs text-gray-500">{{ rows[0]?.barcode }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div class="border-b border-gray-200 p-4 dark:border-gray-800">
          <div class="grid gap-2 md:grid-cols-3">
            <UInput v-model="bulkValues.supplierArticle" placeholder="Массово: Артикул" @change="applyBulk('supplierArticle', bulkValues.supplierArticle)" />
            <UInput v-model="bulkValues.color" placeholder="Массово: Цвет" @change="applyBulk('color', bulkValues.color)" />
            <UInput v-model="bulkValues.brand" placeholder="Массово: Бренд" @change="applyBulk('brand', bulkValues.brand)" />
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-[1100px] text-sm">
            <thead class="bg-gray-50 text-left text-gray-500 dark:bg-gray-950/60">
              <tr>
                <th class="px-4 py-3 font-medium">Штрихкод*</th>
                <th class="px-4 py-3 font-medium">Артикул</th>
                <th class="px-4 py-3 font-medium">Цвет</th>
                <th class="px-4 py-3 font-medium">Размер</th>
                <th class="px-4 py-3 font-medium">Название товара</th>
                <th class="px-4 py-3 font-medium">Наименование продавца*</th>
                <th class="px-4 py-3 font-medium">Бренд</th>
                <th class="px-4 py-3 font-medium text-right">Кол-во*</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="(row, index) in rows" :key="index">
                <td class="px-4 py-3"><UInput v-model="row.barcode" size="xs" /></td>
                <td class="px-4 py-3"><UInput v-model="row.supplierArticle" size="xs" /></td>
                <td class="px-4 py-3"><UInput v-model="row.color" size="xs" /></td>
                <td class="px-4 py-3"><UInput v-model="row.size" size="xs" /></td>
                <td class="px-4 py-3"><UInput v-model="row.title" size="xs" /></td>
                <td class="px-4 py-3"><UInput v-model="row.sellerName" size="xs" /></td>
                <td class="px-4 py-3"><UInput v-model="row.brand" size="xs" /></td>
                <td class="px-4 py-3"><UInput v-model.number="row.quantity" type="number" min="1" size="xs" class="ml-auto w-24" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
