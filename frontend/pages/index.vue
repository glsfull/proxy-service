<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  barcodeTemplates,
  getBarcodeTemplate,
  initialBarcodes,
  statusLabel,
  validateBarcodeValue,
  type BarcodeConfig,
  type BarcodeStatus,
  type BarcodeType
} from '~/utils/barcodes'

const barcodes = ref<BarcodeConfig[]>([...initialBarcodes])
const selectedType = ref<BarcodeType>('ean13')
const selectedStatus = ref<BarcodeStatus>('active')
const selectedId = ref(initialBarcodes[0].id)

const form = reactive({
  name: '',
  source: '',
  owner: '',
  sample: getBarcodeTemplate(selectedType.value)?.sample ?? ''
})

const selectedTemplate = computed(() => getBarcodeTemplate(selectedType.value) ?? barcodeTemplates[0])
const validationError = computed(() => validateBarcodeValue(selectedType.value, form.sample))
const selectedBarcode = computed(() => barcodes.value.find((barcode) => barcode.id === selectedId.value) ?? barcodes.value[0])
const activeCount = computed(() => barcodes.value.filter((barcode) => barcode.status === 'active').length)
const draftCount = computed(() => barcodes.value.filter((barcode) => barcode.status === 'draft').length)
const barcodeTypeOptions = computed(() => barcodeTemplates.map((template) => ({
  label: template.label,
  value: template.type
})))

function selectTemplate(type: BarcodeType) {
  selectedType.value = type
  form.sample = getBarcodeTemplate(type)?.sample ?? ''
}

function addBarcode() {
  if (validationError.value) {
    return
  }

  const nextBarcode: BarcodeConfig = {
    id: Date.now(),
    name: form.name.trim() || selectedTemplate.value.label,
    type: selectedType.value,
    source: form.source.trim() || 'Новый источник',
    owner: form.owner.trim() || 'Ответственный не назначен',
    status: selectedStatus.value,
    color: selectedType.value === 'qr' ? 'sky' : selectedType.value === 'datamatrix' ? 'amber' : 'emerald',
    sample: form.sample.trim(),
    createdAt: new Date().toISOString().slice(0, 10)
  }

  barcodes.value = [nextBarcode, ...barcodes.value]
  selectedId.value = nextBarcode.id
  form.name = ''
  form.source = ''
  form.owner = ''
}
</script>

<template>
  <main class="dashboard-shell">
    <section class="dashboard-hero">
      <div class="hero-copy">
        <p class="eyebrow">Аналитический дашборд</p>
        <h1>Баркоды для товаров, партий и клиентских сценариев</h1>
        <p>
          Добавляйте разные форматы кодов, связывайте их с источниками данных и сразу проверяйте,
          какие метрики будут доступны командам продаж, склада и маркетинга.
        </p>
      </div>

      <div class="metrics-grid">
        <UCard>
          <p class="metric-label">Всего кодов</p>
          <strong>{{ barcodes.length }}</strong>
        </UCard>
        <UCard>
          <p class="metric-label">Активны</p>
          <strong>{{ activeCount }}</strong>
        </UCard>
        <UCard>
          <p class="metric-label">Черновики</p>
          <strong>{{ draftCount }}</strong>
        </UCard>
      </div>
    </section>

    <section class="workspace">
      <aside class="type-panel">
        <div class="section-title">
          <p class="eyebrow">Типы</p>
          <h2>Выберите формат</h2>
        </div>

        <button
          v-for="template in barcodeTemplates"
          :key="template.type"
          class="type-option"
          :class="{ selected: selectedType === template.type }"
          type="button"
          @click="selectTemplate(template.type)"
        >
          <span>{{ template.label }}</span>
          <small>{{ template.format }}</small>
        </button>
      </aside>

      <section class="builder-panel">
        <div class="section-title">
          <p class="eyebrow">Конструктор</p>
          <h2>Новый виджет баркода</h2>
        </div>

        <div class="form-grid">
          <UFormGroup label="Название виджета">
            <UInput v-model="form.name" placeholder="Например, QR для весенней акции" />
          </UFormGroup>

          <UFormGroup label="Тип баркода">
            <USelectMenu v-model="selectedType" :options="barcodeTypeOptions" value-attribute="value" option-attribute="label" />
          </UFormGroup>

          <UFormGroup label="Источник данных">
            <UInput v-model="form.source" placeholder="CRM, каталог, склад, Честный знак" />
          </UFormGroup>

          <UFormGroup label="Владелец">
            <UInput v-model="form.owner" placeholder="Команда или сотрудник" />
          </UFormGroup>
        </div>

        <UFormGroup label="Тестовое значение" :error="validationError || undefined">
          <UTextarea v-model="form.sample" :rows="3" />
        </UFormGroup>

        <div class="status-row">
          <UButton
            v-for="status in ['active', 'draft', 'paused']"
            :key="status"
            :variant="selectedStatus === status ? 'solid' : 'outline'"
            color="gray"
            @click="selectedStatus = status as BarcodeStatus"
          >
            {{ statusLabel(status as BarcodeStatus) }}
          </UButton>
        </div>

        <div class="template-summary">
          <div>
            <strong>{{ selectedTemplate.label }}</strong>
            <p>{{ selectedTemplate.description }}</p>
          </div>
          <UBadge color="gray" variant="subtle">{{ selectedTemplate.format }}</UBadge>
        </div>

        <UButton size="lg" color="primary" :disabled="Boolean(validationError)" @click="addBarcode">
          Добавить в дашборд
        </UButton>
      </section>

      <section class="preview-panel">
        <div class="section-title">
          <p class="eyebrow">Превью</p>
          <h2>{{ selectedBarcode.name }}</h2>
        </div>

        <div class="barcode-preview">
          <div class="barcode-lines" />
          <code>{{ selectedBarcode.sample }}</code>
        </div>

        <dl class="details-list">
          <div>
            <dt>Тип</dt>
            <dd>{{ getBarcodeTemplate(selectedBarcode.type)?.label }}</dd>
          </div>
          <div>
            <dt>Источник</dt>
            <dd>{{ selectedBarcode.source }}</dd>
          </div>
          <div>
            <dt>Владелец</dt>
            <dd>{{ selectedBarcode.owner }}</dd>
          </div>
          <div>
            <dt>Статус</dt>
            <dd>{{ statusLabel(selectedBarcode.status) }}</dd>
          </div>
        </dl>
      </section>
    </section>

    <section class="table-section">
      <div class="section-title">
        <p class="eyebrow">Дашборд</p>
        <h2>Добавленные виджеты</h2>
      </div>

      <div class="barcode-list">
        <button
          v-for="barcode in barcodes"
          :key="barcode.id"
          class="barcode-row"
          :class="{ selected: selectedId === barcode.id }"
          type="button"
          @click="selectedId = barcode.id"
        >
          <span>
            <strong>{{ barcode.name }}</strong>
            <small>{{ getBarcodeTemplate(barcode.type)?.label }} · {{ barcode.source }}</small>
          </span>
          <UBadge :color="barcode.status === 'active' ? 'green' : barcode.status === 'draft' ? 'yellow' : 'gray'" variant="subtle">
            {{ statusLabel(barcode.status) }}
          </UBadge>
        </button>
      </div>
    </section>
  </main>
</template>
