<script setup lang="ts">
definePageMeta({ layout: 'default' })

const form = reactive({ oauthToken: '', businessId: '', campaignId: '' })
const saving = ref(false)
const error = ref('')
const success = ref(false)

async function save() {
  if (!form.oauthToken.trim() || !form.businessId.trim() || !form.campaignId.trim()) {
    error.value = 'Заполните OAuth токен, Business ID и Campaign ID'
    return
  }
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/marketplace/connection', {
      method: 'POST',
      body: {
        marketplace: 'yandex-market',
        credentials_ref: JSON.stringify({
          oauthToken: form.oauthToken.trim(),
          businessId: form.businessId.trim(),
          campaignId: form.campaignId.trim()
        }),
        external_account_id: form.businessId.trim(),
        status: 'draft'
      }
    })
    success.value = true
  }
  catch {
    error.value = 'Не удалось сохранить подключение. Попробуйте позже.'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-8 flex items-center gap-3">
      <UIcon name="i-simple-icons-yandex" class="text-3xl text-red-600 dark:text-red-400" />
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Подключение Yandex Market</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Введите учётные данные Yandex Market Partner API</p>
      </div>
    </div>

    <div class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200">
      Модуль Yandex Market запланирован в Backlog API. Сохранённые учётные данные будут использованы после завершения интеграции.
    </div>

    <div v-if="success" class="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800 dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-200 mb-6">
      Данные Yandex Market сохранены. Подключение будет активировано после готовности модуля.
    </div>

    <div v-if="!success" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">OAuth-токен</label>
        <UInput v-model="form.oauthToken" type="password" placeholder="y0_AgAAAA..." class="w-full" />
        <p class="text-xs text-gray-400 mt-1">Получить на OAuth Яндекса с правами доступа к Partner API</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Business ID</label>
        <UInput v-model="form.businessId" placeholder="Числовой идентификатор бизнеса" class="w-full" />
        <p class="text-xs text-gray-400 mt-1">Кабинет партнёра → Настройки → Идентификатор бизнеса</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Campaign ID</label>
        <UInput v-model="form.campaignId" placeholder="Числовой идентификатор кампании" class="w-full" />
        <p class="text-xs text-gray-400 mt-1">Идентификатор магазина в Yandex Market (campaignId)</p>
      </div>
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <div class="flex gap-3 pt-2">
        <UButton :loading="saving" @click="save">Сохранить подключение</UButton>
        <UButton variant="ghost" color="neutral" to="/dashboard">Отмена</UButton>
      </div>
    </div>

    <div v-if="success" class="flex gap-3">
      <UButton to="/dashboard">Вернуться в кабинет</UButton>
    </div>
  </div>
</template>
