<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { error: authError } = await useFetch('/api/auth/me', { ignoreResponseError: true })
if (authError.value) await navigateTo('/auth')

// Wizard state
const currentStep = ref(1)
const totalSteps = 3

// Step 1 — WB Token
const token = ref('')
const tokenStatus = ref<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
const tokenMessage = ref('')

interface PingStep {
  category: string
  ok: boolean
  status: number
}

interface SellerInfo {
  tradeMark?: string
  inn?: string
  name?: string
}

const pingSteps = ref<PingStep[]>([])
const sellerInfo = ref<SellerInfo | null>(null)
const sellerRating = ref<number | null>(null)
const tokenExpiresAt = ref<string | null>(null)
const validationPhase = ref<'idle' | 'pinging' | 'seller' | 'rating' | 'done'>('idle')

let tokenCheckTimer: ReturnType<typeof setTimeout> | null = null

watch(token, (val) => {
  tokenStatus.value = 'idle'
  tokenMessage.value = ''
  pingSteps.value = []
  sellerInfo.value = null
  sellerRating.value = null
  tokenExpiresAt.value = null
  validationPhase.value = 'idle'
  if (tokenCheckTimer) clearTimeout(tokenCheckTimer)
  if (val.trim().length > 20) {
    tokenStatus.value = 'checking'
    tokenCheckTimer = setTimeout(() => validateToken(), 800)
  }
})

async function validateToken() {
  if (!token.value.trim()) return
  tokenStatus.value = 'checking'
  pingSteps.value = []
  validationPhase.value = 'pinging'

  try {
    const result = await $fetch<{
      valid: boolean
      reason: string
      steps: PingStep[]
      sellerInfo: SellerInfo | null
      rating: number | null
      tokenExpiresAt: string | null
    }>('/api/wb/validate-token', {
      method: 'POST',
      body: { token: token.value.trim() }
    })

    pingSteps.value = result.steps || []
    validationPhase.value = 'done'

    if (result.valid) {
      sellerInfo.value = result.sellerInfo
      sellerRating.value = result.rating
      tokenExpiresAt.value = result.tokenExpiresAt
      tokenStatus.value = 'valid'
      tokenMessage.value = result.reason

      // Auto-fill company/inn from seller-info if available
      if (result.sellerInfo?.tradeMark && !companyName.value) {
        companyName.value = result.sellerInfo.tradeMark
      }
      if (result.sellerInfo?.inn && !inn.value) {
        inn.value = result.sellerInfo.inn
      }
    } else {
      tokenStatus.value = 'invalid'
      tokenMessage.value = result.reason
    }
  } catch {
    tokenStatus.value = 'invalid'
    tokenMessage.value = 'Не удалось проверить токен'
    validationPhase.value = 'idle'
  }
}

// Step 2 — Profile data
const companyName = ref('')
const inn = ref('')
const contactName = ref('')

// Step 3 — Test results
const testResults = ref<{ label: string; ok: boolean; detail: string }[]>([])
const testLoading = ref(false)

async function runTest() {
  testLoading.value = true
  testResults.value = []

  const results: { label: string; ok: boolean; detail: string }[] = []

  // Test 1: token re-validation (use cached result if already valid)
  if (tokenStatus.value === 'valid') {
    results.push({ label: 'Проверка токена Wildberries', ok: true, detail: tokenMessage.value })
  } else {
    try {
      const r = await $fetch<{ valid: boolean; reason: string }>('/api/wb/validate-token', {
        method: 'POST',
        body: { token: token.value.trim() }
      })
      results.push({ label: 'Проверка токена Wildberries', ok: r.valid, detail: r.reason })
    } catch {
      results.push({ label: 'Проверка токена Wildberries', ok: false, detail: 'Ошибка сети' })
    }
  }

  // Test 2: profile data completeness
  const profileComplete = !!companyName.value.trim() && !!contactName.value.trim()
  results.push({
    label: 'Заполненность профиля',
    ok: profileComplete,
    detail: profileComplete ? 'Все обязательные поля заполнены' : 'Не заполнены поля компании или контакта'
  })

  // Test 3: INN format (optional, 10 or 12 digits)
  const innVal = inn.value.replace(/\D/g, '')
  const innOk = innVal.length === 0 || innVal.length === 10 || innVal.length === 12
  results.push({
    label: 'Формат ИНН',
    ok: innOk,
    detail: innVal.length === 0 ? 'ИНН не указан (необязательно)' : innOk ? `ИНН корректен (${innVal.length} цифр)` : `ИНН должен содержать 10 или 12 цифр, введено: ${innVal.length}`
  })

  // Test 4: token expiry warning
  if (tokenExpiresAt.value) {
    const expiryDate = new Date(tokenExpiresAt.value)
    const daysLeft = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const expiryOk = daysLeft > 14
    results.push({
      label: 'Срок действия токена',
      ok: expiryOk,
      detail: expiryOk
        ? `Токен действителен ещё ${daysLeft} дн. (до ${expiryDate.toLocaleDateString('ru-RU')})`
        : daysLeft <= 0
          ? `Токен истёк ${expiryDate.toLocaleDateString('ru-RU')}`
          : `Токен истекает через ${daysLeft} дн. — рекомендуется обновить`
    })
  }

  testResults.value = results
  testLoading.value = false
}

// Navigation
function canProceedStep1() {
  return tokenStatus.value === 'valid'
}

function canProceedStep2() {
  return companyName.value.trim().length > 0 && contactName.value.trim().length > 0
}

async function nextStep() {
  if (currentStep.value === 1 && !canProceedStep1()) return
  if (currentStep.value === 2 && !canProceedStep2()) return
  if (currentStep.value === 2) {
    await runTest()
  }
  currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

const saving = ref(false)
const saveError = ref('')

async function saveProfile() {
  saving.value = true
  saveError.value = ''
  try {
    await $fetch('/api/profile', {
      method: 'POST',
      body: {
        wb_token: token.value.trim(),
        company_name: companyName.value.trim(),
        inn: inn.value.trim(),
        contact_name: contactName.value.trim(),
        seller_name: sellerInfo.value?.tradeMark ?? sellerInfo.value?.name ?? null,
        seller_id: sellerInfo.value?.name ?? null,
        seller_rating: sellerRating.value,
        token_expires_at: tokenExpiresAt.value
      }
    })
    await navigateTo('/dashboard')
  } catch (e: any) {
    saveError.value = e?.data?.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

// Token expiry warning computed
const tokenExpiryWarning = computed(() => {
  if (!tokenExpiresAt.value) return null
  const expiryDate = new Date(tokenExpiresAt.value)
  const daysLeft = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft <= 14) return `Токен истекает через ${daysLeft} дн. (${expiryDate.toLocaleDateString('ru-RU')}). Рекомендуем обновить заранее.`
  return null
})

// Steps config
const steps = [
  { label: 'Токен WB', icon: 'i-lucide-key' },
  { label: 'Профиль', icon: 'i-lucide-user' },
  { label: 'Проверка', icon: 'i-lucide-check-circle' }
]

const PING_CATEGORIES = ['Контент', 'Аналитика', 'Маркетплейс', 'Статистика', 'Финансы']
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Создание профиля</h1>
      <p class="text-gray-500">Мастер настройки за 3 простых шага</p>
    </div>

    <!-- Step indicator -->
    <div class="flex items-center mb-10">
      <template v-for="(step, idx) in steps" :key="idx">
        <div class="flex flex-col items-center">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all"
            :class="{
              'bg-purple-600 border-purple-600 text-white': currentStep > idx + 1,
              'bg-purple-600 border-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-900': currentStep === idx + 1,
              'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400': currentStep < idx + 1
            }"
          >
            <UIcon v-if="currentStep > idx + 1" name="i-lucide-check" class="text-sm" />
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span
            class="text-xs mt-1 font-medium"
            :class="currentStep === idx + 1 ? 'text-purple-600' : 'text-gray-400'"
          >
            {{ step.label }}
          </span>
        </div>
        <div
          v-if="idx < steps.length - 1"
          class="flex-1 h-0.5 mx-2 mb-5 transition-all"
          :class="currentStep > idx + 1 ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'"
        />
      </template>
    </div>

    <UCard class="shadow-lg">
      <!-- STEP 1: WB Token -->
      <template v-if="currentStep === 1">
        <div class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold mb-1">Шаг 1: Токен Wildberries</h2>
            <p class="text-sm text-gray-500">
              Введите токен Wildberries для подключения к API. Вы можете создать его в разделе
              <a href="https://seller.wildberries.ru/supplier-settings/access-to-new-api" target="_blank" class="text-purple-600 hover:underline">Настройки → Доступ к API</a>.
              Токен должен иметь доступ ко всем 4 категориям: <strong>Контент, Маркетплейс, Статистика, Аналитика</strong>.
            </p>
          </div>

          <UFormField label="API-токен Wildberries">
            <div class="relative">
              <UInput
                v-model="token"
                type="password"
                placeholder="eyJhbGciOiJFUzI1NiIs..."
                leading-icon="i-lucide-key"
                size="lg"
                class="w-full"
                autocomplete="off"
              />
            </div>
          </UFormField>

          <!-- Token status indicator -->
          <div class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
            :class="{
              'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800': tokenStatus === 'idle',
              'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20': tokenStatus === 'checking',
              'border-green-400 bg-green-50 dark:bg-green-900/20': tokenStatus === 'valid',
              'border-red-400 bg-red-50 dark:bg-red-900/20': tokenStatus === 'invalid'
            }"
          >
            <div v-if="tokenStatus === 'idle'" class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
            <UIcon v-else-if="tokenStatus === 'checking'" name="i-lucide-loader-2" class="animate-spin text-yellow-500 text-xl" />
            <div v-else-if="tokenStatus === 'valid'" class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-check" class="text-white text-xs" />
            </div>
            <div v-else-if="tokenStatus === 'invalid'" class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-x" class="text-white text-xs" />
            </div>

            <div class="flex-1">
              <div class="text-sm font-medium"
                :class="{
                  'text-gray-500': tokenStatus === 'idle',
                  'text-yellow-700 dark:text-yellow-400': tokenStatus === 'checking',
                  'text-green-700 dark:text-green-400': tokenStatus === 'valid',
                  'text-red-700 dark:text-red-400': tokenStatus === 'invalid'
                }"
              >
                <template v-if="tokenStatus === 'idle'">Ожидание ввода токена</template>
                <template v-else-if="tokenStatus === 'checking'">Проверка токена через API Wildberries...</template>
                <template v-else-if="tokenStatus === 'valid'">Токен действителен</template>
                <template v-else-if="tokenStatus === 'invalid'">Токен недействителен</template>
              </div>
              <div v-if="tokenMessage" class="text-xs text-gray-500 mt-0.5">{{ tokenMessage }}</div>
            </div>
          </div>

          <!-- Step-by-step ping results -->
          <div v-if="pingSteps.length > 0 || tokenStatus === 'checking'" class="space-y-2">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Проверка категорий API</div>
            <div
              v-for="(cat, idx) in PING_CATEGORIES"
              :key="cat"
              class="flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-all"
              :class="pingSteps[idx]
                ? (pingSteps[idx].ok ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10')
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'"
            >
              <template v-if="!pingSteps[idx] && tokenStatus === 'checking'">
                <UIcon name="i-lucide-loader-2" class="animate-spin text-gray-400 text-base shrink-0" />
              </template>
              <template v-else-if="pingSteps[idx]">
                <div
                  class="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  :class="pingSteps[idx].ok ? 'bg-green-500' : 'bg-red-500'"
                >
                  <UIcon :name="pingSteps[idx].ok ? 'i-lucide-check' : 'i-lucide-x'" class="text-white text-xs" style="font-size:9px" />
                </div>
              </template>
              <template v-else>
                <div class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
              </template>
              <span
                :class="pingSteps[idx]
                  ? (pingSteps[idx].ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')
                  : 'text-gray-400'"
              >{{ cat }}</span>
              <span v-if="pingSteps[idx] && !pingSteps[idx].ok" class="ml-auto text-xs text-red-500">HTTP {{ pingSteps[idx].status || 'недоступен' }}</span>
            </div>
          </div>

          <!-- Seller info preview -->
          <div v-if="sellerInfo && tokenStatus === 'valid'" class="p-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 text-sm space-y-1">
            <div class="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
              <UIcon name="i-lucide-store" />
              Данные продавца получены
            </div>
            <div v-if="sellerInfo.tradeMark" class="text-gray-700 dark:text-gray-300">Торговая марка: <strong>{{ sellerInfo.tradeMark }}</strong></div>
            <div v-if="sellerInfo.inn" class="text-gray-700 dark:text-gray-300">ИНН: <strong>{{ sellerInfo.inn }}</strong></div>
            <div v-if="sellerRating !== null" class="text-gray-700 dark:text-gray-300">Рейтинг: <strong>{{ sellerRating }}</strong></div>
          </div>

          <!-- Token expiry warning -->
          <UAlert
            v-if="tokenExpiryWarning"
            color="warning"
            variant="soft"
            icon="i-lucide-clock-alert"
            :description="tokenExpiryWarning"
          />

          <UAlert
            color="info"
            variant="soft"
            icon="i-lucide-shield"
            description="Токен хранится в зашифрованном виде и доступен только вам. Токен должен иметь доступ ко всем 4 категориям WB API."
          />
        </div>
      </template>

      <!-- STEP 2: Profile data -->
      <template v-else-if="currentStep === 2">
        <div class="space-y-5">
          <div>
            <h2 class="text-lg font-semibold mb-1">Шаг 2: Данные профиля</h2>
            <p class="text-sm text-gray-500">Заполните информацию о вашей компании</p>
          </div>

          <UFormField label="Название компании *">
            <UInput
              v-model="companyName"
              placeholder="ООО Ромашка"
              leading-icon="i-lucide-building-2"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField label="ИНН (необязательно)">
            <UInput
              v-model="inn"
              placeholder="1234567890"
              leading-icon="i-lucide-hash"
              size="lg"
              class="w-full"
              maxlength="12"
            />
            <template #hint>
              <span class="text-xs text-gray-400">10 цифр для юрлица, 12 для ИП</span>
            </template>
          </UFormField>

          <UFormField label="Контактное лицо *">
            <UInput
              v-model="contactName"
              placeholder="Иван Иванов"
              leading-icon="i-lucide-user"
              size="lg"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>

      <!-- STEP 3: Test results -->
      <template v-else-if="currentStep === 3">
        <div class="space-y-5">
          <div>
            <h2 class="text-lg font-semibold mb-1">Шаг 3: Результаты проверки</h2>
            <p class="text-sm text-gray-500">Убедитесь, что все данные корректны перед сохранением</p>
          </div>

          <div v-if="testLoading" class="flex items-center justify-center py-8 gap-3">
            <UIcon name="i-lucide-loader-2" class="animate-spin text-purple-600 text-2xl" />
            <span class="text-gray-500">Выполняем проверку...</span>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="result in testResults"
              :key="result.label"
              class="flex items-start gap-3 p-4 rounded-xl border"
              :class="result.ok ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                :class="result.ok ? 'bg-green-500' : 'bg-red-500'"
              >
                <UIcon :name="result.ok ? 'i-lucide-check' : 'i-lucide-x'" class="text-white text-xs" />
              </div>
              <div>
                <div class="font-medium text-sm" :class="result.ok ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
                  {{ result.label }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">{{ result.detail }}</div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div v-if="!testLoading && testResults.length > 0" class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-2">
            <h3 class="font-medium text-sm">Итог профиля:</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-gray-500">Компания:</div>
              <div class="font-medium">{{ companyName }}</div>
              <div v-if="inn" class="text-gray-500">ИНН:</div>
              <div v-if="inn" class="font-medium">{{ inn }}</div>
              <div class="text-gray-500">Контакт:</div>
              <div class="font-medium">{{ contactName }}</div>
              <div v-if="sellerRating !== null" class="text-gray-500">Рейтинг WB:</div>
              <div v-if="sellerRating !== null" class="font-medium">{{ sellerRating }}</div>
              <div class="text-gray-500">API-токен:</div>
              <div class="font-medium font-mono text-xs">{{ token.slice(0, 16) }}...</div>
            </div>
          </div>

          <UAlert
            v-if="saveError"
            color="error"
            variant="soft"
            :description="saveError"
            icon="i-lucide-alert-circle"
          />
        </div>
      </template>

      <!-- Navigation buttons -->
      <template #footer>
        <div class="flex items-center justify-between">
          <UButton
            v-if="currentStep > 1"
            variant="ghost"
            icon="i-lucide-arrow-left"
            @click="prevStep"
          >
            Назад
          </UButton>
          <div v-else />

          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-400">{{ currentStep }} / {{ totalSteps }}</span>

            <UButton
              v-if="currentStep < totalSteps"
              :disabled="(currentStep === 1 && !canProceedStep1()) || (currentStep === 2 && !canProceedStep2())"
              trailing-icon="i-lucide-arrow-right"
              @click="nextStep"
            >
              Далее
            </UButton>

            <UButton
              v-else
              :loading="saving"
              :disabled="testLoading || (testResults.length > 0 && !testResults.every(r => r.ok))"
              icon="i-lucide-save"
              color="success"
              @click="saveProfile"
            >
              Сохранить профиль
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
