<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  applyBulkSizeRowField,
  findProductById,
  getTotalLabelCount,
  marketplaceTabs,
  sortProductsByArticle,
  updateSizeRow,
  wildberriesProducts,
  type Marketplace,
  type WildberriesSizeRow,
  type WildberriesSizeRowField
} from '~/utils/marketplaceLabels'

const activeMarketplace = ref<Marketplace>('wildberries')
const selectedProductId = ref<number | null>(null)
const editableRowsByProduct = ref<Record<number, WildberriesSizeRow[]>>({})
const showExtraFields = ref(false)
const saved = ref(false)
const settings = ref({
  barcodeIndex: 0,
  sizeMode: 'both',
  mediaType: 'thermal',
  thermalSize: '58 x 40 мм',
  barcodeFormat: 'CODE128',
  fontSize: 10,
  textAlign: 'center'
})
const additionalFields = ref({
  brand: true,
  expiryDate: false,
  country: false,
  composition: false,
  supplier: false,
  freeText: false,
  eac: true
})
const bulk = ref<Record<WildberriesSizeRowField, string>>({
  barcode: '',
  article: '',
  color: '',
  size: '',
  productName: '',
  sellerName: '',
  brand: '',
  quantity: ''
})

const sortedProducts = computed(() => sortProductsByArticle(wildberriesProducts))
const selectedProduct = computed(() => findProductById(wildberriesProducts, selectedProductId.value))
const selectedRows = computed(() => {
  if (!selectedProduct.value) return []

  return editableRowsByProduct.value[selectedProduct.value.id] ?? selectedProduct.value.sizes
})
const firstLabel = computed(() => selectedRows.value[0])
const totalSizes = computed(() => wildberriesProducts.reduce((sum, product) => sum + product.sizes.length, 0))
const totalLabels = computed(() => selectedRows.value.reduce((sum, row) => sum + row.quantity, 0))
const previewAlignClass = computed(() => `align-${settings.value.textAlign}`)

function openProduct(productId: number) {
  selectedProductId.value = productId
  if (!editableRowsByProduct.value[productId]) {
    const product = findProductById(wildberriesProducts, productId)
    editableRowsByProduct.value = {
      ...editableRowsByProduct.value,
      [productId]: product?.sizes.map((row) => ({ ...row })) ?? []
    }
  }
}

function backToProducts() {
  selectedProductId.value = null
}

function setSetting<Key extends keyof typeof settings.value>(key: Key, value: typeof settings.value[Key]) {
  settings.value = {
    ...settings.value,
    [key]: value
  }
}

function updateSelectedRow<Field extends WildberriesSizeRowField>(
  rowIndex: number,
  field: Field,
  value: WildberriesSizeRow[Field]
) {
  if (!selectedProduct.value) return

  editableRowsByProduct.value = {
    ...editableRowsByProduct.value,
    [selectedProduct.value.id]: selectedRows.value.map((row, index) =>
      index === rowIndex ? updateSizeRow(row, field, value) : row
    )
  }
}

function applyBulk(field: WildberriesSizeRowField) {
  if (!selectedProduct.value) return

  const rawValue = bulk.value[field]
  const value = field === 'quantity' ? Number(rawValue) : rawValue
  editableRowsByProduct.value = {
    ...editableRowsByProduct.value,
    [selectedProduct.value.id]: applyBulkSizeRowField(
      selectedRows.value,
      field,
      value as WildberriesSizeRow[typeof field]
    )
  }
  bulk.value = {
    ...bulk.value,
    [field]: ''
  }
}

function saveDraft() {
  saved.value = true
  window.setTimeout(() => {
    saved.value = false
  }, 2000)
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
          <UButton @click="saveDraft">{{ saved ? 'Сохранено' : 'Сохранить' }}</UButton>
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
          <button
            v-for="index in [0, 1, 2]"
            :key="index"
            class="setting-pill"
            :class="{ active: settings.barcodeIndex === index }"
            type="button"
            @click="setSetting('barcodeIndex', index)"
          >
            {{ index + 1 }}-й
          </button>
          <span>Размер:</span>
          <button class="setting-pill" :class="{ active: settings.sizeMode === 'tech' }" type="button" @click="setSetting('sizeMode', 'tech')">Производителя</button>
          <button class="setting-pill" :class="{ active: settings.sizeMode === 'both' }" type="button" @click="setSetting('sizeMode', 'both')">Пр/Рос</button>
          <span>Тип:</span>
          <button class="setting-pill" :class="{ active: settings.mediaType === 'a4' }" type="button" @click="setSetting('mediaType', 'a4')">A4</button>
          <button class="setting-pill" :class="{ active: settings.mediaType === 'thermal' }" type="button" @click="setSetting('mediaType', 'thermal')">Термо</button>
          <select v-if="settings.mediaType === 'thermal'" v-model="settings.thermalSize" class="setting-select" aria-label="Размер термоэтикетки">
            <option>58 x 40 мм</option>
            <option>58 x 60 мм</option>
            <option>75 x 120 мм</option>
          </select>
          <span>Формат:</span>
          <button class="setting-pill" :class="{ active: settings.barcodeFormat === 'CODE128' }" type="button" @click="setSetting('barcodeFormat', 'CODE128')">CODE128</button>
          <button class="setting-pill" :class="{ active: settings.barcodeFormat === 'EAN13' }" type="button" @click="setSetting('barcodeFormat', 'EAN13')">EAN13</button>
          <label class="range-setting">
            Шрифт: {{ settings.fontSize }}px
            <input v-model.number="settings.fontSize" min="6" max="16" type="range">
          </label>
          <button class="setting-pill" :class="{ active: settings.textAlign === 'center' }" type="button" @click="setSetting('textAlign', 'center')">По центру</button>
          <button class="setting-pill" :class="{ active: settings.textAlign === 'left' }" type="button" @click="setSetting('textAlign', 'left')">Слева</button>
          <button class="setting-pill" type="button" @click="showExtraFields = !showExtraFields">Доп. поля</button>
        </div>

        <div v-if="showExtraFields" class="extra-fields">
          <label><input v-model="additionalFields.expiryDate" type="checkbox"> Срок годности</label>
          <label><input v-model="additionalFields.country" type="checkbox"> Страна</label>
          <label><input v-model="additionalFields.brand" type="checkbox"> Бренд</label>
          <label><input v-model="additionalFields.composition" type="checkbox"> Состав</label>
          <label><input v-model="additionalFields.supplier" type="checkbox"> Поставщик</label>
          <label><input v-model="additionalFields.freeText" type="checkbox"> Свободная надпись</label>
          <label><input v-model="additionalFields.eac" type="checkbox"> EAC</label>
        </div>

        <div class="preview-band">
          <p class="panel-title">Предпросмотр этикетки</p>
          <div class="label-preview" :class="previewAlignClass" :style="{ fontSize: `${settings.fontSize}px` }">
            <div class="barcode-lines" />
            <strong>{{ firstLabel?.barcode }}</strong>
            <span>{{ selectedProduct.name }}</span>
            <small>Арт: {{ selectedProduct.article }} · {{ firstLabel?.color }} · {{ firstLabel?.size }}</small>
            <small v-if="additionalFields.brand">{{ selectedProduct.brand }}</small>
            <small v-if="additionalFields.expiryDate">Срок годности: 12.2027</small>
            <small v-if="additionalFields.country">Страна: Россия</small>
            <small v-if="additionalFields.composition">Состав: хлопок, эластан</small>
            <small v-if="additionalFields.supplier">Поставщик: Proxy Service</small>
            <small v-if="additionalFields.freeText">Маркировка для склада</small>
            <b v-if="additionalFields.eac">EAC</b>
          </div>
          <div class="preview-meta">
            <span>{{ selectedRows.length }} строк</span>
            <span>{{ totalLabels }} этикеток</span>
            <span>{{ settings.mediaType === 'thermal' ? settings.thermalSize : 'A4' }}</span>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <span>Штрихкод*</span>
                </th>
                <th>
                  <span>Артикул</span>
                  <div class="bulk-row">
                    <input v-model="bulk.article" placeholder="Для всех...">
                    <button type="button" title="Применить ко всем" @click="applyBulk('article')">✓</button>
                  </div>
                </th>
                <th>
                  <span>Цвет</span>
                  <div class="bulk-row">
                    <input v-model="bulk.color" placeholder="Для всех...">
                    <button type="button" title="Применить ко всем" @click="applyBulk('color')">✓</button>
                  </div>
                </th>
                <th>Размер</th>
                <th>
                  <span>Название товара</span>
                  <div class="bulk-row">
                    <input v-model="bulk.productName" placeholder="Для всех...">
                    <button type="button" title="Применить ко всем" @click="applyBulk('productName')">✓</button>
                  </div>
                </th>
                <th>
                  <span>Наименование продавца*</span>
                  <div class="bulk-row">
                    <input v-model="bulk.sellerName" placeholder="Для всех...">
                    <button type="button" title="Применить ко всем" @click="applyBulk('sellerName')">✓</button>
                  </div>
                </th>
                <th v-if="additionalFields.brand">
                  <span>Бренд</span>
                  <div class="bulk-row">
                    <input v-model="bulk.brand" placeholder="Для всех...">
                    <button type="button" title="Применить ко всем" @click="applyBulk('brand')">✓</button>
                  </div>
                </th>
                <th>
                  <span>Кол-во*</span>
                  <div class="bulk-row">
                    <input v-model="bulk.quantity" min="1" type="number" placeholder="Для всех...">
                    <button type="button" title="Применить ко всем" @click="applyBulk('quantity')">✓</button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in selectedRows" :key="row.barcode">
                <td>
                  <input class="cell-input" :value="row.barcode" @input="updateSelectedRow(rowIndex, 'barcode', ($event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input" :value="row.article" @input="updateSelectedRow(rowIndex, 'article', ($event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input" :value="row.color" @input="updateSelectedRow(rowIndex, 'color', ($event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input small" :value="row.size" @input="updateSelectedRow(rowIndex, 'size', ($event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input wide" :value="row.productName" @input="updateSelectedRow(rowIndex, 'productName', ($event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input wide" :value="row.sellerName" @input="updateSelectedRow(rowIndex, 'sellerName', ($event.target as HTMLInputElement).value)">
                </td>
                <td v-if="additionalFields.brand">
                  <input class="cell-input" :value="row.brand" @input="updateSelectedRow(rowIndex, 'brand', ($event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input qty" min="1" type="number" :value="row.quantity" @input="updateSelectedRow(rowIndex, 'quantity', Number(($event.target as HTMLInputElement).value))">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="table-hint">* — обязательные поля. Введите значение в поле «Для всех...» и нажмите ✓, чтобы применить его ко всем строкам.</p>
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

.setting-pill {
  min-height: 30px;
  border: 1px solid #c9d7ea;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.setting-pill.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.setting-select {
  min-height: 30px;
  border: 1px solid #c9d7ea;
  border-radius: 8px;
  background: #ffffff;
  padding: 4px 8px;
  color: #334155;
  font-weight: 700;
}

.range-setting {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #334155;
}

.range-setting input {
  width: 110px;
}

.extra-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  padding: 12px 14px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
}

.extra-fields label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

.label-preview.align-left {
  justify-items: start;
  text-align: left;
}

.label-preview.align-left .barcode-lines {
  justify-self: center;
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

.preview-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
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
  min-width: 1100px;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 14px;
  border-bottom: 1px solid #dbe4f0;
  text-align: left;
  white-space: nowrap;
}

th {
  background: #eaf3ff;
  color: #334155;
  font-size: 12px;
  text-transform: uppercase;
}

.bulk-row {
  display: grid;
  grid-template-columns: minmax(104px, 1fr) 28px;
  gap: 4px;
  margin-top: 7px;
}

.bulk-row input,
.cell-input {
  width: 100%;
  min-width: 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
  padding: 6px 8px;
  font-size: 13px;
}

.bulk-row button {
  width: 28px;
  min-height: 28px;
  border: 1px solid #2563eb;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
}

.cell-input.small {
  max-width: 90px;
}

.cell-input.wide {
  min-width: 220px;
}

.cell-input.qty {
  max-width: 80px;
}

.table-hint {
  margin-top: 10px;
  color: #64748b;
  font-size: 13px;
}

td {
  color: #0f172a;
  font-size: 14px;
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
