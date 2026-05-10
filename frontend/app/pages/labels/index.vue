<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  findProductById,
  marketplaceTabs,
  sortProductsByArticle,
  wildberriesProducts,
  type Marketplace
} from '~/utils/marketplaceLabels'
import {
  ADDITIONAL_FIELD_LABELS,
  BARCODE_FORMATS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  MEDIA_TYPES,
  SIZE_DISPLAY_MODES,
  TEXT_ALIGNS,
  THERMAL_SIZES,
  clampFontSize,
  defaultLabelSettings,
  isValidBarcode,
  sizeLabel,
  type BarcodeIndex
} from '~/utils/labelSettings'
import {
  applyBulkValue,
  buildProductRows,
  emptyBulkValues,
  totalLabelCount,
  updateRow,
  type BulkField,
  type ProductRow
} from '~/utils/productRows'

const activeMarketplace = ref<Marketplace>('wildberries')
const selectedProductId = ref<number | null>(null)

const sortedProducts = computed(() => sortProductsByArticle(wildberriesProducts))
const selectedProduct = computed(() => findProductById(wildberriesProducts, selectedProductId.value))
const totalSizes = computed(() =>
  wildberriesProducts.reduce((sum, product) => sum + product.sizes.length, 0)
)

const settings = reactive(defaultLabelSettings())
const productRows = ref<ProductRow[]>([])
const bulk = reactive(emptyBulkValues())
const showExtraFields = ref(false)
const previewIndex = ref(0)
const savedAt = ref<number | null>(null)
const previewHtml = ref<string | null>(null)

watch(selectedProduct, (next) => {
  productRows.value = next ? buildProductRows(next) : []
  previewIndex.value = 0
  Object.assign(bulk, emptyBulkValues())
})

const totalLabels = computed(() => totalLabelCount(productRows.value))

const previewRow = computed(() => {
  if (!productRows.value.length) return null
  const safeIndex = Math.min(Math.max(previewIndex.value, 0), productRows.value.length - 1)
  return productRows.value[safeIndex]
})

const previewBarcode = computed(() => {
  const row = previewRow.value
  if (!row) return ''
  return row.allBarcodes[settings.barcodeIndex] ?? row.allBarcodes[0] ?? row.barcode
})

const previewSize = computed(() => {
  const row = previewRow.value
  if (!row) return ''
  return sizeLabel(row.techSize, row.wbSize, settings.sizeDisplayMode)
})

const previewBarcodeIsValid = computed(() =>
  previewBarcode.value ? isValidBarcode(previewBarcode.value, settings.barcodeFormat) : false
)

function openProduct(productId: number) {
  selectedProductId.value = productId
}

function backToProducts() {
  selectedProductId.value = null
}

function setBarcodeIndex(index: BarcodeIndex) {
  settings.barcodeIndex = index
}

function applyBulk(field: BulkField) {
  productRows.value = applyBulkValue(productRows.value, field, bulk[field])
  bulk[field] = ''
}

function setRowValue<F extends keyof ProductRow>(index: number, field: F, value: ProductRow[F]) {
  productRows.value = updateRow(productRows.value, index, field, value)
}

function setQuantity(index: number, raw: string) {
  const numeric = Math.max(1, Math.round(Number(raw) || 1))
  setRowValue(index, 'quantity', numeric)
}

function selectThermalSize(label: string) {
  const found = THERMAL_SIZES.find((size) => size.label === label)
  if (found) settings.thermalSize = found
}

function changeFontSize(value: string) {
  settings.fontSize = clampFontSize(Number(value))
}

function handleSave() {
  savedAt.value = Date.now()
  setTimeout(() => {
    if (savedAt.value && Date.now() - savedAt.value >= 1900) savedAt.value = null
  }, 2000)
}

function buildPreviewHtml(): string {
  const product = selectedProduct.value
  if (!product) return ''
  const rows = productRows.value
  const fontSize = settings.fontSize
  const align = settings.textAlign === 'left' ? 'left' : 'center'
  const labels = rows.map((row) => {
    const code = row.allBarcodes[settings.barcodeIndex] ?? row.allBarcodes[0] ?? row.barcode
    const size = sizeLabel(row.techSize, row.wbSize, settings.sizeDisplayMode)
    const extras: string[] = []
    if (settings.additionalFields.showExpiry && row.expiryDate) extras.push(`Срок годности: ${row.expiryDate}`)
    if (settings.additionalFields.showCountry && row.country) extras.push(`Страна: ${row.country}`)
    if (settings.additionalFields.showBrand && row.brand) extras.push(`Бренд: ${row.brand}`)
    if (settings.additionalFields.showComposition && row.composition) extras.push(`Состав: ${row.composition}`)
    if (settings.additionalFields.showSupplier && row.supplier) extras.push(`Поставщик: ${row.supplier}`)
    if (settings.additionalFields.showFreeText && row.freeText) extras.push(row.freeText)
    return `
      <article style="text-align:${align};font-size:${fontSize}px;border:1px solid #d6e0ee;padding:12px;border-radius:8px;display:grid;gap:6px;">
        <div style="height:42px;background:repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 4px,#111 4px 7px,transparent 7px 10px);"></div>
        <code style="font-family:ui-monospace,monospace;">${escapeHtml(code)}</code>
        <strong>${escapeHtml(row.title)}</strong>
        <span>Арт: ${escapeHtml(row.vendorCode)} · ${escapeHtml(row.color)} · ${escapeHtml(size)}</span>
        <span>${escapeHtml(row.sellerName)}</span>
        ${extras.map((extra) => `<span>${escapeHtml(extra)}</span>`).join('')}
        ${settings.additionalFields.showEac ? '<b style="border:2px solid #111;padding:2px 6px;justify-self:end;">EAC</b>' : ''}
      </article>`
  })
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Предпросмотр этикеток</title></head><body style="margin:24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;font-family:Inter,system-ui,sans-serif;color:#0f172a;background:#f6f8fb;">${labels.join('')}</body></html>`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;'
    if (char === '<') return '&lt;'
    if (char === '>') return '&gt;'
    if (char === '"') return '&quot;'
    return '&#39;'
  })
}

function handlePreview() {
  previewHtml.value = buildPreviewHtml()
}

function handleDownloadPdf() {
  const html = buildPreviewHtml()
  if (typeof window === 'undefined' || !html) return
  const printable = window.open('', '_blank')
  if (!printable) return
  printable.document.open()
  printable.document.write(html)
  printable.document.close()
  setTimeout(() => printable.print(), 250)
}
</script>

<template>
  <main class="marketplace-page">
    <aside class="sidebar">
      <div class="brand-mark" aria-label="proxy-service">PS</div>
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
          <UButton color="neutral" variant="outline" @click="handlePreview">Предпросмотр</UButton>
          <UButton color="neutral" variant="outline" @click="handleDownloadPdf">Скачать PDF</UButton>
          <UButton @click="handleSave">{{ savedAt ? '✓ Сохранено' : 'Сохранить' }}</UButton>
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
          <UBadge color="info" variant="subtle">Сортировка по артикулу</UBadge>
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

      <section
        v-else-if="activeMarketplace === 'wildberries' && selectedProduct"
        class="detail-view"
      >
        <div class="detail-top">
          <UButton color="neutral" variant="outline" icon="i-heroicons-arrow-left" @click="backToProducts">
            Все товары
          </UButton>
          <img :src="selectedProduct.photo" :alt="selectedProduct.name">
          <div>
            <h2>{{ selectedProduct.article }}</h2>
            <p>{{ selectedProduct.name }}</p>
            <span>{{ selectedProduct.brand }}</span>
            <span class="muted">Этикеток к печати: {{ totalLabels }}</span>
          </div>
        </div>

        <div class="settings-bar">
          <div class="pill-group">
            <span class="pill-label">Штрихкод:</span>
            <button
              v-for="index in [0, 1, 2] as BarcodeIndex[]"
              :key="index"
              type="button"
              class="pill"
              :class="{ active: settings.barcodeIndex === index }"
              @click="setBarcodeIndex(index)"
            >
              {{ index + 1 }}-й
            </button>
          </div>
          <div class="pill-group">
            <span class="pill-label">Размер:</span>
            <button
              v-for="mode in SIZE_DISPLAY_MODES"
              :key="mode.id"
              type="button"
              class="pill"
              :class="{ active: settings.sizeDisplayMode === mode.id }"
              @click="settings.sizeDisplayMode = mode.id"
            >
              {{ mode.label }}
            </button>
          </div>
          <div class="pill-group">
            <span class="pill-label">Тип:</span>
            <button
              v-for="media in MEDIA_TYPES"
              :key="media.id"
              type="button"
              class="pill"
              :class="{ active: settings.mediaType === media.id }"
              @click="settings.mediaType = media.id"
            >
              {{ media.label }}
            </button>
          </div>
          <div v-if="settings.mediaType === 'thermal'" class="pill-group">
            <span class="pill-label">Этикетка:</span>
            <select
              class="pill-select"
              :value="settings.thermalSize.label"
              @change="(event) => selectThermalSize((event.target as HTMLSelectElement).value)"
            >
              <option v-for="size in THERMAL_SIZES" :key="size.label" :value="size.label">
                {{ size.label }}
              </option>
            </select>
          </div>
          <div class="pill-group">
            <span class="pill-label">Формат:</span>
            <button
              v-for="format in BARCODE_FORMATS"
              :key="format"
              type="button"
              class="pill"
              :class="{ active: settings.barcodeFormat === format }"
              @click="settings.barcodeFormat = format"
            >
              {{ format }}
            </button>
          </div>
          <div class="pill-group">
            <span class="pill-label">Шрифт: {{ settings.fontSize }}px</span>
            <input
              type="range"
              class="pill-range"
              :min="FONT_SIZE_MIN"
              :max="FONT_SIZE_MAX"
              :value="settings.fontSize"
              @input="(event) => changeFontSize((event.target as HTMLInputElement).value)"
            >
          </div>
          <div class="pill-group">
            <span class="pill-label">Текст:</span>
            <button
              v-for="align in TEXT_ALIGNS"
              :key="align.id"
              type="button"
              class="pill"
              :class="{ active: settings.textAlign === align.id }"
              @click="settings.textAlign = align.id"
            >
              {{ align.label }}
            </button>
          </div>
          <button
            type="button"
            class="pill"
            :aria-expanded="showExtraFields"
            @click="showExtraFields = !showExtraFields"
          >
            {{ showExtraFields ? 'Доп. поля ▲' : 'Доп. поля ▼' }}
          </button>
        </div>

        <div v-if="showExtraFields" class="extras-bar">
          <label
            v-for="field in ADDITIONAL_FIELD_LABELS"
            :key="field.key"
            class="extras-chk"
          >
            <input
              type="checkbox"
              :checked="settings.additionalFields[field.key]"
              @change="(event) => (settings.additionalFields[field.key] = (event.target as HTMLInputElement).checked)"
            >
            {{ field.label }}
          </label>
        </div>

        <div class="preview-band">
          <p class="panel-title">Предпросмотр этикетки</p>
          <div v-if="previewRow" class="preview-row">
            <div
              class="label-preview"
              :class="{ 'align-left': settings.textAlign === 'left' }"
              :style="{ fontSize: settings.fontSize + 'px' }"
            >
              <div class="barcode-lines" />
              <strong>{{ previewBarcode }}</strong>
              <span>{{ previewRow.title }}</span>
              <small>Арт: {{ previewRow.vendorCode }} · {{ previewRow.color }} · {{ previewSize }}</small>
              <small>{{ previewRow.sellerName }}</small>
              <small v-if="settings.additionalFields.showBrand && previewRow.brand">{{ previewRow.brand }}</small>
              <small v-if="settings.additionalFields.showComposition && previewRow.composition">
                Состав: {{ previewRow.composition }}
              </small>
              <small v-if="settings.additionalFields.showCountry && previewRow.country">
                Страна: {{ previewRow.country }}
              </small>
              <small v-if="settings.additionalFields.showExpiry && previewRow.expiryDate">
                Срок годности: {{ previewRow.expiryDate }}
              </small>
              <small v-if="settings.additionalFields.showSupplier && previewRow.supplier">
                Поставщик: {{ previewRow.supplier }}
              </small>
              <small v-if="settings.additionalFields.showFreeText && previewRow.freeText">{{ previewRow.freeText }}</small>
              <b v-if="settings.additionalFields.showEac">EAC</b>
            </div>
            <div class="preview-side">
              <div class="preview-counter">
                {{ Math.min(previewIndex + 1, productRows.length) }} / {{ productRows.length }}
              </div>
              <div class="preview-pager">
                <button
                  v-for="(row, index) in productRows"
                  :key="row.rowId"
                  type="button"
                  class="pager-btn"
                  :class="{ on: index === previewIndex }"
                  @click="previewIndex = index"
                >
                  {{ index + 1 }}
                </button>
              </div>
              <p class="preview-hint">
                {{ previewBarcodeIsValid ? `Штрихкод соответствует формату ${settings.barcodeFormat}.` : `Внимание: штрихкод не соответствует формату ${settings.barcodeFormat}.` }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="previewHtml" class="snapshot">
          <div class="snapshot-head">
            <strong>HTML-снимок предпросмотра</strong>
            <button type="button" class="pill" @click="previewHtml = null">Скрыть</button>
          </div>
          <textarea readonly :value="previewHtml" rows="6" />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr class="bulk-row">
                <th>
                  <div class="th-label">Штрихкод <span class="req">*</span></div>
                </th>
                <th>
                  <div class="th-label">Артикул</div>
                  <div class="bulk-input">
                    <input v-model="bulk.vendorCode" placeholder="Для всех…" @keyup.enter="applyBulk('vendorCode')">
                    <button type="button" @click="applyBulk('vendorCode')">✓</button>
                  </div>
                </th>
                <th>
                  <div class="th-label">Цвет</div>
                  <div class="bulk-input">
                    <input v-model="bulk.color" placeholder="Для всех…" @keyup.enter="applyBulk('color')">
                    <button type="button" @click="applyBulk('color')">✓</button>
                  </div>
                </th>
                <th>
                  <div class="th-label">Размер</div>
                </th>
                <th>
                  <div class="th-label">Название товара</div>
                </th>
                <th>
                  <div class="th-label">Наименование продавца <span class="req">*</span></div>
                  <div class="bulk-input">
                    <input v-model="bulk.sellerName" placeholder="Для всех…" @keyup.enter="applyBulk('sellerName')">
                    <button type="button" @click="applyBulk('sellerName')">✓</button>
                  </div>
                </th>
                <th>
                  <div class="th-label">Бренд</div>
                  <div class="bulk-input">
                    <input v-model="bulk.brand" placeholder="Для всех…" @keyup.enter="applyBulk('brand')">
                    <button type="button" @click="applyBulk('brand')">✓</button>
                  </div>
                </th>
                <th v-if="settings.additionalFields.showExpiry">
                  <div class="th-label">Срок годности</div>
                  <div class="bulk-input">
                    <input v-model="bulk.expiryDate" placeholder="Для всех…" @keyup.enter="applyBulk('expiryDate')">
                    <button type="button" @click="applyBulk('expiryDate')">✓</button>
                  </div>
                </th>
                <th v-if="settings.additionalFields.showCountry">
                  <div class="th-label">Страна</div>
                  <div class="bulk-input">
                    <input v-model="bulk.country" placeholder="Для всех…" @keyup.enter="applyBulk('country')">
                    <button type="button" @click="applyBulk('country')">✓</button>
                  </div>
                </th>
                <th v-if="settings.additionalFields.showComposition">
                  <div class="th-label">Состав</div>
                  <div class="bulk-input">
                    <input v-model="bulk.composition" placeholder="Для всех…" @keyup.enter="applyBulk('composition')">
                    <button type="button" @click="applyBulk('composition')">✓</button>
                  </div>
                </th>
                <th v-if="settings.additionalFields.showSupplier">
                  <div class="th-label">Поставщик</div>
                  <div class="bulk-input">
                    <input v-model="bulk.supplier" placeholder="Для всех…" @keyup.enter="applyBulk('supplier')">
                    <button type="button" @click="applyBulk('supplier')">✓</button>
                  </div>
                </th>
                <th v-if="settings.additionalFields.showFreeText">
                  <div class="th-label">Надпись</div>
                  <div class="bulk-input">
                    <input v-model="bulk.freeText" placeholder="Для всех…" @keyup.enter="applyBulk('freeText')">
                    <button type="button" @click="applyBulk('freeText')">✓</button>
                  </div>
                </th>
                <th>
                  <div class="th-label">Кол-во <span class="req">*</span></div>
                  <div class="bulk-input">
                    <input
                      v-model="bulk.quantity"
                      type="number"
                      min="1"
                      placeholder="Для всех…"
                      @keyup.enter="applyBulk('quantity')"
                    >
                    <button type="button" @click="applyBulk('quantity')">✓</button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in productRows" :key="row.rowId">
                <td>
                  <input class="cell-input" :value="row.barcode" @input="(event) => setRowValue(index, 'barcode', (event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input" :value="row.vendorCode" @input="(event) => setRowValue(index, 'vendorCode', (event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input" :value="row.color" @input="(event) => setRowValue(index, 'color', (event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input cell-input--sm" :value="sizeLabel(row.techSize, row.wbSize, settings.sizeDisplayMode)" readonly>
                </td>
                <td>
                  <input class="cell-input" :value="row.title" @input="(event) => setRowValue(index, 'title', (event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input" :value="row.sellerName" @input="(event) => setRowValue(index, 'sellerName', (event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input class="cell-input" :value="row.brand" @input="(event) => setRowValue(index, 'brand', (event.target as HTMLInputElement).value)">
                </td>
                <td v-if="settings.additionalFields.showExpiry">
                  <input class="cell-input" :value="row.expiryDate" @input="(event) => setRowValue(index, 'expiryDate', (event.target as HTMLInputElement).value)">
                </td>
                <td v-if="settings.additionalFields.showCountry">
                  <input class="cell-input" :value="row.country" @input="(event) => setRowValue(index, 'country', (event.target as HTMLInputElement).value)">
                </td>
                <td v-if="settings.additionalFields.showComposition">
                  <input class="cell-input" :value="row.composition" @input="(event) => setRowValue(index, 'composition', (event.target as HTMLInputElement).value)">
                </td>
                <td v-if="settings.additionalFields.showSupplier">
                  <input class="cell-input" :value="row.supplier" @input="(event) => setRowValue(index, 'supplier', (event.target as HTMLInputElement).value)">
                </td>
                <td v-if="settings.additionalFields.showFreeText">
                  <input class="cell-input" :value="row.freeText" @input="(event) => setRowValue(index, 'freeText', (event.target as HTMLInputElement).value)">
                </td>
                <td>
                  <input
                    class="cell-input cell-input--sm"
                    type="number"
                    min="1"
                    :value="row.quantity"
                    @input="(event) => setQuantity(index, (event.target as HTMLInputElement).value)"
                  >
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!productRows.length" class="muted">У этого товара нет размеров.</p>
        </div>

        <p class="hint">
          * — обязательные поля. Введите значение в «Для всех…» и нажмите ✓ или Enter, чтобы применить ко всем строкам.
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
  display: block;
}

.detail-top .muted {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 2px;
}

.settings-bar,
.extras-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 12px 14px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  font-weight: 700;
  margin-top: 12px;
}

.extras-bar {
  background: #f8fafc;
  font-weight: 600;
}

.extras-chk {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.pill-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pill-label {
  color: #334155;
  font-weight: 700;
}

.pill {
  border: 1px solid #c9d7ea;
  background: #f8fafc;
  color: #1f2937;
  border-radius: 6px;
  padding: 6px 10px;
  font-weight: 700;
  cursor: pointer;
}

.pill.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.pill-select {
  border: 1px solid #c9d7ea;
  background: #ffffff;
  color: #1f2937;
  border-radius: 6px;
  padding: 6px 8px;
  font-weight: 700;
}

.pill-range {
  width: 120px;
}

.preview-band {
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

.preview-row {
  display: grid;
  grid-template-columns: minmax(220px, auto) 1fr;
  gap: 18px;
  align-items: start;
  margin-top: 10px;
}

.label-preview {
  width: 232px;
  min-height: 160px;
  display: grid;
  justify-items: center;
  gap: 4px;
  border: 1px solid #d6e0ee;
  background: #ffffff;
  padding: 10px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  text-align: center;
}

.label-preview.align-left {
  text-align: left;
  justify-items: start;
}

.label-preview b {
  border: 2px solid #111827;
  padding: 1px 6px;
  font-size: 14px;
  justify-self: end;
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

.preview-side {
  display: grid;
  gap: 12px;
}

.preview-counter {
  font-weight: 700;
  color: #1d4ed8;
}

.preview-pager {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pager-btn {
  min-width: 32px;
  height: 32px;
  border: 1px solid #c9d7ea;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
}

.pager-btn.on {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.preview-hint {
  color: #475569;
  font-size: 13px;
}

.snapshot {
  margin-top: 12px;
  border: 1px solid #d6e0ee;
  border-radius: 8px;
  background: #ffffff;
  padding: 14px;
}

.snapshot-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.snapshot textarea {
  width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  border: 1px solid #d6e0ee;
  border-radius: 6px;
  padding: 8px;
  background: #f8fafc;
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

th,
td {
  padding: 10px 12px;
  border-bottom: 1px solid #dbe4f0;
  text-align: left;
  vertical-align: top;
}

th {
  background: #eaf3ff;
  color: #334155;
  font-size: 12px;
  text-transform: uppercase;
}

td {
  color: #0f172a;
  font-size: 14px;
}

.th-label {
  margin-bottom: 6px;
  font-weight: 700;
}

.req {
  color: #b91c1c;
  margin-left: 4px;
}

.bulk-input {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.bulk-input input {
  width: 120px;
  border: 1px solid #c9d7ea;
  border-radius: 6px;
  padding: 4px 6px;
}

.bulk-input button {
  border: 1px solid #c9d7ea;
  border-radius: 6px;
  background: #ffffff;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: 700;
}

.cell-input {
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  padding: 4px 6px;
  border-radius: 4px;
}

.cell-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #ffffff;
}

.cell-input--sm {
  width: 90px;
}

.hint {
  margin-top: 10px;
  color: #475569;
  font-size: 12px;
}

.muted {
  color: #94a3b8;
}

.planned-view {
  max-width: 720px;
}

.planned-view p {
  margin-top: 8px;
  color: #475569;
}

@media (max-width: 1180px) {
  .preview-row {
    grid-template-columns: 1fr;
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
