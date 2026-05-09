<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  findProductById,
  getTotalLabelCount,
  marketplaceTabs,
  sortProductsByArticle,
  wildberriesAdditionalFields,
  wildberriesAdditionalTableColumns,
  wildberriesBaseTableColumns,
  wildberriesProducts,
  type Marketplace,
  type WildberriesSizeRowKey
} from '~/utils/marketplaceLabels'

const activeMarketplace = ref<Marketplace>('wildberries')
const selectedProductId = ref<number | null>(null)
const products = ref(structuredClone(wildberriesProducts))

const sortedProducts = computed(() => sortProductsByArticle(products.value))
const selectedProduct = computed(() => findProductById(products.value, selectedProductId.value))
const selectedRows = computed(() => selectedProduct.value?.sizes ?? [])
const firstLabel = computed(() => selectedRows.value[0])
const totalSizes = computed(() => products.value.reduce((sum, product) => sum + product.sizes.length, 0))
const bulkValues = ref<Partial<Record<WildberriesSizeRowKey, string>>>({})
const isAdditionalFieldsOpen = ref(false)
const selectedAdditionalFieldKeys = ref<WildberriesSizeRowKey[]>([])
const visibleTableColumns = computed(() => [
  ...wildberriesBaseTableColumns,
  ...wildberriesAdditionalTableColumns.filter((column) => selectedAdditionalFieldKeys.value.includes(column.key))
])

function openProduct(productId: number) {
  selectedProductId.value = productId
}

function backToProducts() {
  selectedProductId.value = null
}

function updateRowValue(rowIndex: number, key: WildberriesSizeRowKey, value: string) {
  const row = selectedRows.value[rowIndex]

  if (!row) {
    return
  }

  if (key === 'quantity') {
    row[key] = Number(value)
    return
  }

  row[key] = value
}

function applyBulkValue(key: WildberriesSizeRowKey, directValue?: string) {
  const value = directValue ?? bulkValues.value[key]

  if (value === undefined) {
    return
  }

  selectedRows.value.forEach((row) => {
    if (key === 'quantity') {
      row[key] = Number(value)
      return
    }

    row[key] = value
  })
}

function updateBulkValue(key: WildberriesSizeRowKey, value: string) {
  bulkValues.value[key] = value
}

function toggleAdditionalField(key: WildberriesSizeRowKey, checked: boolean) {
  if (checked) {
    selectedAdditionalFieldKeys.value = [...new Set([...selectedAdditionalFieldKeys.value, key])]
    return
  }

  selectedAdditionalFieldKeys.value = selectedAdditionalFieldKeys.value.filter((fieldKey) => fieldKey !== key)
}
</script>

<template>
  <main class="marketplace-page">
    <aside class="sidebar">
      <div class="brand-mark">PS</div>
      <nav aria-label="Основное меню">
        <button class="menu-item active" type="button">Генератор этикеток маркетплейсов</button>
      </nav>
    </aside>

    <section class="marketplace-workspace">
      <header class="page-header">
        <div>
          <p class="eyebrow">API каталог</p>
          <h1>Генератор этикеток маркетплейсов</h1>
        </div>
        <div class="header-actions">
          <UButton color="gray" variant="outline">Предпросмотр</UButton>
          <UButton color="gray" variant="outline">Скачать PDF</UButton>
          <UButton>Сохранить</UButton>
        </div>
      </header>

      <div class="tabs" role="tablist" aria-label="Маркетплейсы">
        <button
          v-for="tab in marketplaceTabs"
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeMarketplace === tab.id }"
          type="button"
          role="tab"
          :aria-selected="activeMarketplace === tab.id"
          @click="activeMarketplace = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.status === 'planned'">скоро</span>
        </button>
      </div>

      <section v-if="activeMarketplace === 'wildberries' && !selectedProduct" class="product-view">
        <div class="summary-strip">
          <div>
            <strong>{{ sortedProducts.length }}</strong>
            <span>товара выгружено по API</span>
          </div>
          <div>
            <strong>{{ totalSizes }}</strong>
            <span>размеров доступно для этикеток</span>
          </div>
          <UBadge color="blue" variant="subtle">Сортировка по артикулу</UBadge>
        </div>

        <div class="product-grid">
          <button
            v-for="product in sortedProducts"
            :key="product.id"
            class="product-card"
            type="button"
            @click="openProduct(product.id)"
          >
            <img :src="product.photo" :alt="product.name">
            <span class="product-info">
              <strong>{{ product.name }}</strong>
              <small>Артикул: {{ product.article }}</small>
              <small>Вендоркод: {{ product.vendorCode }}</small>
              <small>Бренд: {{ product.brand }}</small>
              <small>Количество размеров: {{ product.sizes.length }}</small>
            </span>
          </button>
        </div>
      </section>

      <section v-else-if="activeMarketplace === 'wildberries' && selectedProduct" class="detail-view">
        <div class="detail-top">
          <UButton color="gray" variant="outline" icon="i-heroicons-arrow-left" @click="backToProducts">
            Все товары
          </UButton>
          <img :src="selectedProduct.photo" :alt="selectedProduct.name">
          <div>
            <h2>{{ selectedProduct.article }}</h2>
            <p>{{ selectedProduct.name }}</p>
            <span>{{ selectedProduct.brand }}</span>
          </div>
        </div>

        <div class="label-settings">
          <span>Штрихкод:</span>
          <UBadge>1-й</UBadge>
          <UBadge color="gray" variant="subtle">2-й</UBadge>
          <span>Размер:</span>
          <UBadge color="gray" variant="subtle">Производителя</UBadge>
          <UBadge>Пр/Рос</UBadge>
          <span>Тип:</span>
          <UBadge color="gray" variant="subtle">A4</UBadge>
          <UBadge>Термо</UBadge>
          <span>Формат:</span>
          <UBadge>CODE128</UBadge>
          <UBadge color="gray" variant="subtle">EAN13</UBadge>
        </div>

        <div class="preview-band">
          <p class="panel-title">Предпросмотр этикетки</p>
          <div class="label-preview">
            <div class="barcode-lines" />
            <strong>{{ firstLabel?.barcode }}</strong>
            <span>{{ selectedProduct.name }}</span>
            <small>Арт: {{ firstLabel?.article }} · {{ firstLabel?.color }} · {{ firstLabel?.size }}</small>
            <small>{{ firstLabel?.brand }}</small>
            <small v-if="firstLabel?.composition">{{ firstLabel.composition }}</small>
            <b>EAC</b>
          </div>
        </div>

        <div class="additional-fields">
          <button
            class="additional-fields-head"
            type="button"
            :aria-expanded="isAdditionalFieldsOpen"
            @click="isAdditionalFieldsOpen = !isAdditionalFieldsOpen"
          >
            <p class="panel-title">Дополнительные поля</p>
            <span>{{ selectedAdditionalFieldKeys.length }} выбрано</span>
          </button>
          <div v-if="isAdditionalFieldsOpen" class="additional-grid">
            <label v-for="field in wildberriesAdditionalFields" :key="field.key" class="additional-field-option">
              <input
                type="checkbox"
                :checked="selectedAdditionalFieldKeys.includes(field.key)"
                @change="toggleAdditionalField(field.key, ($event.target as HTMLInputElement).checked)"
              >
              <span>{{ field.label }}</span>
            </label>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th v-for="column in visibleTableColumns" :key="column.key">
                  <span>{{ column.label }}</span>
                  <div v-if="column.bulkEditable" class="bulk-editor">
                    <input
                      :value="bulkValues[column.key] ?? ''"
                      type="text"
                      :aria-label="`Массовое значение: ${column.label}`"
                      @input="updateBulkValue(column.key, ($event.target as HTMLInputElement).value)"
                    >
                    <button
                      type="button"
                      @click="applyBulkValue(column.key, (($event.currentTarget as HTMLButtonElement).previousElementSibling as HTMLInputElement).value)"
                    >
                      Применить
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in selectedRows" :key="`${row.barcode}-${row.size}`">
                <td v-for="column in visibleTableColumns" :key="column.key">
                  <input
                    class="cell-input"
                    :type="column.inputType ?? 'text'"
                    :value="row[column.key]"
                    :aria-label="`${column.label}: ${row.size}`"
                    @input="updateRowValue(rowIndex, column.key, ($event.target as HTMLInputElement).value)"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="planned-view">
        <h2>{{ marketplaceTabs.find((tab) => tab.id === activeMarketplace)?.label }}</h2>
        <p>Вкладка подготовлена для следующего этапа. Сейчас детально проработан сценарий Wildberries.</p>
      </section>
    </section>
  </main>
</template>

<style scoped>
.marketplace-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  background: #f3f6fb;
  color: #132238;
}

.sidebar {
  background: #ffffff;
  border-right: 1px solid #dbe4f0;
  padding: 24px 16px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  margin-bottom: 28px;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 800;
}

.menu-item {
  width: 100%;
  min-height: 44px;
  border: 1px solid #c9d7ea;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 10px 12px;
  text-align: left;
  font-weight: 700;
}

.marketplace-workspace {
  min-width: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 32px;
  background: #ffffff;
  border-bottom: 1px solid #dbe4f0;
}

.eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  font-size: 28px;
  line-height: 1.2;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 16px 32px 0;
  background: #ffffff;
}

.tab-button {
  min-height: 42px;
  border: 1px solid #c9d7ea;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: #f8fafc;
  padding: 10px 18px;
  color: #334155;
  font-weight: 800;
}

.tab-button.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.tab-button span {
  margin-left: 8px;
  font-size: 11px;
  opacity: 0.75;
}

.product-view,
.detail-view,
.planned-view {
  padding: 24px 32px 40px;
}

.summary-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 18px;
}

.summary-strip div {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.summary-strip strong {
  font-size: 26px;
  color: #1d4ed8;
}

.summary-strip span {
  color: #475569;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.product-card {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 14px;
  min-height: 146px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
  padding: 12px;
  text-align: left;
  cursor: pointer;
}

.product-card:hover {
  border-color: #2563eb;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.12);
}

.product-card img,
.detail-top img {
  width: 88px;
  height: 112px;
  object-fit: cover;
  border-radius: 6px;
  background: #e2e8f0;
}

.product-info {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.product-info strong {
  color: #1d4ed8;
  line-height: 1.25;
}

.product-info small {
  color: #475569;
}

.detail-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.detail-top h2 {
  color: #1d4ed8;
  font-size: 20px;
}

.detail-top span,
.detail-top p {
  color: #475569;
}

.label-settings {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.preview-band {
  min-height: 220px;
  margin-top: 12px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
}

.panel-title {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.label-preview {
  width: 232px;
  min-height: 160px;
  display: grid;
  justify-items: center;
  gap: 4px;
  margin: 10px auto 0;
  border: 1px solid #d6e0ee;
  background: #ffffff;
  padding: 10px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  text-align: center;
  font-size: 9px;
}

.barcode-lines {
  width: 200px;
  height: 58px;
  background: repeating-linear-gradient(
    90deg,
    #000000 0 2px,
    transparent 2px 4px,
    #000000 4px 7px,
    transparent 7px 10px
  );
}

.label-preview strong {
  font-size: 10px;
}

.label-preview b {
  justify-self: end;
  border: 2px solid #111827;
  padding: 1px 6px;
  font-size: 14px;
}

.additional-fields {
  margin-top: 12px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
  padding: 14px;
}

.additional-fields-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  gap: 16px;
  cursor: pointer;
  text-align: left;
}

.additional-fields-head span {
  color: #64748b;
  font-size: 13px;
}

.additional-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.additional-field-option {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d6e0ee;
  border-radius: 6px;
  background: #f8fafc;
  padding: 8px 10px;
}

.additional-field-option span {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.additional-field-option input {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
}

.bulk-editor input,
.cell-input {
  width: 100%;
  min-width: 0;
  border: 1px solid #c9d7ea;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 12px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
}

table {
  width: 100%;
  min-width: 1320px;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #dbe4f0;
  text-align: left;
  white-space: nowrap;
}

th {
  background: #eaf3ff;
  color: #334155;
  font-size: 12px;
  text-transform: uppercase;
  vertical-align: top;
}

td {
  color: #0f172a;
  font-size: 14px;
}

.bulk-editor {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) auto;
  gap: 6px;
  margin-top: 8px;
}

.bulk-editor input,
.cell-input {
  min-height: 34px;
  padding: 7px 8px;
}

.bulk-editor button {
  min-height: 34px;
  border: 1px solid #2563eb;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.cell-input:focus,
.bulk-editor input:focus {
  border-color: #2563eb;
  outline: 2px solid rgba(37, 99, 235, 0.18);
}

.planned-view {
  max-width: 720px;
}

.planned-view p {
  margin-top: 8px;
  color: #475569;
}

@media (max-width: 900px) {
  .marketplace-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid #dbe4f0;
  }

  .page-header,
  .detail-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .product-view,
  .detail-view,
  .planned-view,
  .page-header {
    padding-left: 16px;
    padding-right: 16px;
  }

  .tabs {
    overflow-x: auto;
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
