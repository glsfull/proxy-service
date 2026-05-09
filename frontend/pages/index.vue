<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  additionalFieldDescriptors,
  applyBulkValue,
  defaultLabelSettings,
  findProductById,
  marketplaceTabs,
  sizeLabel,
  sortProductsByArticle,
  THERMAL_SIZES,
  wildberriesProducts,
  type AdditionalFields,
  type BarcodeFormat,
  type BarcodeIndex,
  type BulkKey,
  type LabelSettings,
  type Marketplace,
  type MediaType,
  type SizeDisplayMode,
  type TextAlign,
  type WildberriesSizeRow
} from '~/utils/marketplaceLabels'

const activeMarketplace = ref<Marketplace>('wildberries')
const selectedProductId = ref<number | null>(null)
const previewIdx = ref(0)
const showExtraFields = ref(false)
const saved = ref(false)

const settings = reactive<LabelSettings>({
  ...defaultLabelSettings,
  additionalFields: { ...defaultLabelSettings.additionalFields }
})

const sortedProducts = computed(() => sortProductsByArticle(wildberriesProducts))
const selectedProduct = computed(() => findProductById(wildberriesProducts, selectedProductId.value))
const totalSizes = computed(() =>
  wildberriesProducts.reduce((sum, product) => sum + product.sizes.length, 0)
)

const productRows = ref<WildberriesSizeRow[]>([])

watch(
  selectedProduct,
  (product) => {
    productRows.value = product ? product.sizes.map((row) => ({ ...row })) : []
    previewIdx.value = 0
  },
  { immediate: true }
)

const previewRow = computed(() => {
  if (!productRows.value.length) return null
  return productRows.value[Math.min(previewIdx.value, productRows.value.length - 1)] ?? null
})

const previewBarcode = computed(() => {
  const row = previewRow.value
  if (!row) return ''
  const all = row.barcodes && row.barcodes.length ? row.barcodes : [row.barcode]
  return all[Math.min(settings.barcodeIndex, all.length - 1)] ?? row.barcode
})

const bulk = reactive<Record<BulkKey, string>>({
  vendorCode: '',
  color: '',
  productName: '',
  sellerName: '',
  brand: '',
  expiryDate: '',
  country: '',
  composition: '',
  supplier: '',
  freeText: '',
  quantity: ''
})

function openProduct(productId: number) {
  selectedProductId.value = productId
}

function backToProducts() {
  selectedProductId.value = null
}

function setBarcodeIndex(idx: BarcodeIndex) {
  settings.barcodeIndex = idx
}

function setSizeMode(mode: SizeDisplayMode) {
  settings.sizeDisplayMode = mode
}

function setMediaType(type: MediaType) {
  settings.mediaType = type
}

function setBarcodeFormat(format: BarcodeFormat) {
  settings.barcodeFormat = format
}

function setTextAlign(align: TextAlign) {
  settings.textAlign = align
}

function setThermalSize(label: string) {
  const found = THERMAL_SIZES.find((size) => size.label === label)
  if (found) settings.thermalSize = found
}

function toggleAdditional(key: keyof AdditionalFields, checked: boolean) {
  settings.additionalFields[key] = checked
}

function applyBulk(field: BulkKey) {
  const value = bulk[field]
  if (value === '') return
  productRows.value = applyBulkValue(productRows.value, field, value)
  bulk[field] = ''
}

function handleBulkKey(field: BulkKey, event: KeyboardEvent) {
  if (event.key === 'Enter') {
    applyBulk(field)
  }
}

function handleSave() {
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 1800)
}

function handlePreview() {
  if (typeof window === 'undefined' || !previewRow.value) return
  window.alert(`Предпросмотр этикетки № ${previewIdx.value + 1} из ${productRows.value.length}`)
}

function handlePDF() {
  if (typeof window === 'undefined' || !productRows.value.length) return
  const total = productRows.value.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
  window.alert(`PDF будет содержать ${total} этикеток (макет: ${settings.mediaType === 'a4' ? 'A4' : settings.thermalSize.label}).`)
}

const visibleAdditional = computed(() =>
  additionalFieldDescriptors.filter((descriptor) => settings.additionalFields[descriptor.key])
)
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
          <UButton color="gray" variant="outline" @click="handlePreview">Предпросмотр</UButton>
          <UButton color="gray" variant="outline" @click="handlePDF">Скачать PDF</UButton>
          <UButton @click="handleSave">{{ saved ? '✓ Сохранено' : 'Сохранить' }}</UButton>
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
          <div class="detail-headline">
            <h2>{{ selectedProduct.article }}</h2>
            <p>{{ selectedProduct.name }}</p>
            <span>{{ selectedProduct.brand }}</span>
          </div>
        </div>

        <div class="settings-bar">
          <div class="pills-group">
            <span class="pills-label">Штрихкод:</span>
            <button
              v-for="idx in [0, 1, 2] as BarcodeIndex[]"
              :key="idx"
              type="button"
              class="pill"
              :class="{ on: settings.barcodeIndex === idx }"
              @click="setBarcodeIndex(idx)"
            >{{ idx + 1 }}-й</button>
          </div>
          <div class="pills-group">
            <span class="pills-label">Размер:</span>
            <button
              type="button"
              class="pill"
              :class="{ on: settings.sizeDisplayMode === 'tech' }"
              @click="setSizeMode('tech')"
            >Производителя</button>
            <button
              type="button"
              class="pill"
              :class="{ on: settings.sizeDisplayMode === 'wb' }"
              @click="setSizeMode('wb')"
            >Российский</button>
            <button
              type="button"
              class="pill"
              :class="{ on: settings.sizeDisplayMode === 'both' }"
              @click="setSizeMode('both')"
            >Пр/Рос</button>
          </div>
          <div class="pills-group">
            <span class="pills-label">Тип:</span>
            <button
              type="button"
              class="pill"
              :class="{ on: settings.mediaType === 'a4' }"
              @click="setMediaType('a4')"
            >A4</button>
            <button
              type="button"
              class="pill"
              :class="{ on: settings.mediaType === 'thermal' }"
              @click="setMediaType('thermal')"
            >Термо</button>
          </div>
          <div v-if="settings.mediaType === 'thermal'" class="pills-group">
            <span class="pills-label">Этикетка:</span>
            <select class="pill-select" :value="settings.thermalSize.label" @change="setThermalSize(($event.target as HTMLSelectElement).value)">
              <option v-for="size in THERMAL_SIZES" :key="size.label" :value="size.label">{{ size.label }}</option>
            </select>
          </div>
          <div class="pills-group">
            <span class="pills-label">Формат:</span>
            <button
              v-for="format in (['CODE128','EAN13','CODE39'] as BarcodeFormat[])"
              :key="format"
              type="button"
              class="pill"
              :class="{ on: settings.barcodeFormat === format }"
              @click="setBarcodeFormat(format)"
            >{{ format }}</button>
          </div>
          <div class="pills-group">
            <span class="pills-label">Шрифт: {{ settings.fontSize }}px</span>
            <input
              v-model.number="settings.fontSize"
              type="range"
              min="6"
              max="16"
              class="slider-inline"
            >
          </div>
          <div class="pills-group">
            <span class="pills-label">Текст:</span>
            <button
              type="button"
              class="pill"
              :class="{ on: settings.textAlign === 'center' }"
              @click="setTextAlign('center')"
            >По центру</button>
            <button
              type="button"
              class="pill"
              :class="{ on: settings.textAlign === 'left' }"
              @click="setTextAlign('left')"
            >Слева</button>
          </div>
          <button class="pill pill-extra" type="button" @click="showExtraFields = !showExtraFields">
            {{ showExtraFields ? 'Доп. поля ▲' : 'Доп. поля ▼' }}
          </button>
        </div>

        <div v-if="showExtraFields" class="extra-fields-bar">
          <label
            v-for="descriptor in additionalFieldDescriptors"
            :key="descriptor.key"
            class="extra-chk"
          >
            <input
              type="checkbox"
              :checked="settings.additionalFields[descriptor.key]"
              @change="toggleAdditional(descriptor.key, ($event.target as HTMLInputElement).checked)"
            >
            {{ descriptor.label }}
          </label>
          <label class="extra-chk">
            <input
              type="checkbox"
              :checked="settings.additionalFields.showEac"
              @change="toggleAdditional('showEac', ($event.target as HTMLInputElement).checked)"
            >
            EAC
          </label>
        </div>

        <div class="preview-band">
          <div class="preview-head">
            <p class="panel-title">Предпросмотр этикетки</p>
            <div class="preview-switcher" role="tablist" aria-label="Выбор этикетки">
              <button
                v-for="(row, idx) in productRows"
                :key="row.barcode || idx"
                type="button"
                class="preview-pill"
                :class="{ on: previewIdx === idx }"
                @click="previewIdx = idx"
              >{{ idx + 1 }}</button>
            </div>
          </div>

          <div v-if="previewRow" class="label-preview" :style="{ textAlign: settings.textAlign, fontSize: `${settings.fontSize}px` }">
            <div class="barcode-lines" />
            <strong>{{ previewBarcode }}</strong>
            <span>{{ previewRow.productName }}</span>
            <small>
              Арт: {{ previewRow.article }} · {{ previewRow.color }} · {{ sizeLabel(previewRow.techSize, previewRow.wbSize, settings.sizeDisplayMode) }}
            </small>
            <small v-if="settings.additionalFields.showBrand">{{ previewRow.brand }}</small>
            <small v-if="settings.additionalFields.showCountry && previewRow.country">{{ previewRow.country }}</small>
            <small v-if="settings.additionalFields.showExpiry && previewRow.expiryDate">Срок: {{ previewRow.expiryDate }}</small>
            <small v-if="settings.additionalFields.showComposition && previewRow.composition">{{ previewRow.composition }}</small>
            <small v-if="settings.additionalFields.showSupplier && previewRow.supplier">{{ previewRow.supplier }}</small>
            <small v-if="settings.additionalFields.showFreeText && previewRow.freeText">{{ previewRow.freeText }}</small>
            <b v-if="settings.additionalFields.showEac">EAC</b>
          </div>
          <div v-else class="preview-empty">
            У этого товара нет размеров для предпросмотра.
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="th-static">Штрихкод<span class="req">*</span></th>
                <th>
                  <div class="th-stack">
                    Артикул
                    <div class="bulk-input">
                      <input
                        v-model="bulk.vendorCode"
                        type="text"
                        placeholder="Для всех..."
                        @keydown="handleBulkKey('vendorCode', $event)"
                      >
                      <button type="button" class="bulk-apply" title="Применить ко всем" @click="applyBulk('vendorCode')">✓</button>
                    </div>
                  </div>
                </th>
                <th>
                  <div class="th-stack">
                    Цвет
                    <div class="bulk-input">
                      <input
                        v-model="bulk.color"
                        type="text"
                        placeholder="Для всех..."
                        @keydown="handleBulkKey('color', $event)"
                      >
                      <button type="button" class="bulk-apply" title="Применить ко всем" @click="applyBulk('color')">✓</button>
                    </div>
                  </div>
                </th>
                <th class="th-static">Размер</th>
                <th>
                  <div class="th-stack">
                    Название товара
                    <div class="bulk-input">
                      <input
                        v-model="bulk.productName"
                        type="text"
                        placeholder="Для всех..."
                        @keydown="handleBulkKey('productName', $event)"
                      >
                      <button type="button" class="bulk-apply" title="Применить ко всем" @click="applyBulk('productName')">✓</button>
                    </div>
                  </div>
                </th>
                <th>
                  <div class="th-stack">
                    Наименование продавца<span class="req">*</span>
                    <div class="bulk-input">
                      <input
                        v-model="bulk.sellerName"
                        type="text"
                        placeholder="Для всех..."
                        @keydown="handleBulkKey('sellerName', $event)"
                      >
                      <button type="button" class="bulk-apply" title="Применить ко всем" @click="applyBulk('sellerName')">✓</button>
                    </div>
                  </div>
                </th>
                <th
                  v-for="descriptor in visibleAdditional"
                  :key="descriptor.key"
                >
                  <div class="th-stack">
                    {{ descriptor.label }}
                    <div class="bulk-input">
                      <input
                        v-model="bulk[descriptor.bulkField]"
                        type="text"
                        placeholder="Для всех..."
                        @keydown="handleBulkKey(descriptor.bulkField, $event)"
                      >
                      <button type="button" class="bulk-apply" :title="`Применить ко всем: ${descriptor.label}`" @click="applyBulk(descriptor.bulkField)">✓</button>
                    </div>
                  </div>
                </th>
                <th>
                  <div class="th-stack">
                    Кол-во<span class="req">*</span>
                    <div class="bulk-input">
                      <input
                        v-model="bulk.quantity"
                        type="number"
                        min="1"
                        placeholder="Для всех..."
                        @keydown="handleBulkKey('quantity', $event)"
                      >
                      <button type="button" class="bulk-apply" title="Применить ко всем" @click="applyBulk('quantity')">✓</button>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in productRows" :key="row.barcode || idx">
                <td><input v-model="row.barcode" class="cell-input" type="text"></td>
                <td><input v-model="row.vendorCode" class="cell-input" type="text"></td>
                <td><input v-model="row.color" class="cell-input" type="text"></td>
                <td>
                  <input
                    :value="sizeLabel(row.techSize, row.wbSize, settings.sizeDisplayMode)"
                    class="cell-input cell-input--ro"
                    type="text"
                    readonly
                    tabindex="-1"
                  >
                </td>
                <td><input v-model="row.productName" class="cell-input" type="text"></td>
                <td><input v-model="row.sellerName" class="cell-input" type="text" placeholder="ИП Иванов И.И."></td>
                <td v-for="descriptor in visibleAdditional" :key="descriptor.key">
                  <input v-model="row[descriptor.rowField] as string" class="cell-input" type="text">
                </td>
                <td>
                  <input v-model.number="row.quantity" class="cell-input cell-input--qty" type="number" min="1">
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!productRows.length" class="tbl-empty">У этого товара нет размеров.</p>
        </div>

        <p class="tbl-hint">
          * — обязательные поля. Введите значение в поле «Для всех...» и нажмите ✓ или Enter, чтобы применить ко всем строкам. Нажмите «Сохранить» для записи.
        </p>
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
  cursor: pointer;
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

h1, h2, p { margin: 0; }
h1 { font-size: 28px; line-height: 1.2; }

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
  cursor: pointer;
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

.detail-headline h2 {
  color: #1d4ed8;
  font-size: 20px;
}

.detail-headline span,
.detail-headline p {
  color: #475569;
}

.settings-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  padding: 12px 14px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
}

.pills-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pills-label {
  color: #334155;
  font-weight: 700;
}

.pill {
  border: 1px solid #c9d7ea;
  border-radius: 999px;
  background: #f8fafc;
  padding: 4px 12px;
  color: #1f2937;
  font-weight: 600;
  cursor: pointer;
}

.pill.on {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.pill-extra {
  margin-left: auto;
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #1d4ed8;
}

.pill-select {
  border: 1px solid #c9d7ea;
  border-radius: 6px;
  padding: 4px 8px;
  background: #ffffff;
}

.slider-inline {
  width: 120px;
}

.extra-fields-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
  padding: 10px 14px;
  margin-top: 10px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fef9c3;
  color: #78350f;
  font-weight: 600;
}

.extra-chk {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.preview-band {
  margin-top: 12px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #fefce8;
  padding: 16px;
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.panel-title {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.preview-switcher {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.preview-pill {
  min-width: 28px;
  border: 1px solid #c9d7ea;
  border-radius: 6px;
  background: #ffffff;
  padding: 4px 8px;
  font-weight: 600;
  cursor: pointer;
}

.preview-pill.on {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.label-preview {
  width: 232px;
  min-height: 160px;
  display: grid;
  justify-items: center;
  gap: 4px;
  margin: 14px auto 4px;
  border: 1px solid #d6e0ee;
  background: #ffffff;
  padding: 10px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
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
  font-size: 1em;
}

.label-preview b {
  justify-self: end;
  border: 2px solid #111827;
  padding: 1px 6px;
  font-size: 1.2em;
}

.preview-empty {
  padding: 18px;
  color: #64748b;
  text-align: center;
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
  min-width: 1200px;
  border-collapse: collapse;
}

th, td {
  padding: 10px 12px;
  border-bottom: 1px solid #dbe4f0;
  text-align: left;
  vertical-align: top;
  white-space: nowrap;
}

th {
  background: #eaf3ff;
  color: #334155;
  font-size: 12px;
  text-transform: uppercase;
}

th.th-static {
  vertical-align: middle;
}

.req {
  color: #dc2626;
  margin-left: 2px;
}

.th-stack {
  display: grid;
  gap: 6px;
}

.bulk-input {
  display: flex;
  gap: 4px;
}

.bulk-input input {
  flex: 1;
  min-width: 0;
  border: 1px solid #c9d7ea;
  border-radius: 6px;
  padding: 4px 8px;
  background: #ffffff;
  text-transform: none;
}

.bulk-apply {
  border: 1px solid #c9d7ea;
  border-radius: 6px;
  background: #f8fafc;
  padding: 0 8px;
  cursor: pointer;
  font-weight: 700;
  color: #15803d;
}

.cell-input {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 4px 6px;
  background: transparent;
  color: #0f172a;
  font-size: 14px;
}

.cell-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #f0f9ff;
}

.cell-input--ro {
  background: #f1f5f9;
  color: #475569;
  cursor: not-allowed;
}

.cell-input--qty {
  max-width: 80px;
}

.tbl-hint {
  margin: 12px 4px 0;
  color: #64748b;
  font-size: 12px;
}

.tbl-empty {
  padding: 18px;
  color: #64748b;
  text-align: center;
}

.planned-view {
  max-width: 720px;
}

.planned-view p {
  margin-top: 8px;
  color: #475569;
}

@media (max-width: 1100px) {
  .pill-extra {
    margin-left: 0;
  }
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
