<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const mode = ref<'login' | 'register'>('login')
const loginType = ref<'phone' | 'email'>('phone')
const login = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const title = computed(() => mode.value === 'login' ? 'Вход' : 'Регистрация')

const phoneMask = /^[\d\s\+\-\(\)]+$/

function validateLogin(): string {
  if (!login.value.trim()) return 'Введите логин'
  if (loginType.value === 'phone') {
    const digits = login.value.replace(/\D/g, '')
    if (digits.length < 10) return 'Введите корректный номер телефона'
  } else {
    if (!login.value.includes('@')) return 'Введите корректный email'
  }
  return ''
}

async function submit() {
  error.value = ''
  const loginErr = validateLogin()
  if (loginErr) { error.value = loginErr; return }
  if (password.value.length < 6) { error.value = 'Пароль должен быть не менее 6 символов'; return }

  loading.value = true
  try {
    const endpoint = mode.value === 'login' ? '/api/auth/login' : '/api/auth/register'
    await $fetch(endpoint, {
      method: 'POST',
      body: { login: login.value.trim(), password: password.value, type: loginType.value }
    })
    await navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Ошибка авторизации'
  } finally {
    loading.value = false
  }
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
  login.value = ''
  password.value = ''
}
</script>

<template>
  <UCard class="shadow-xl">
    <template #header>
      <div class="text-center py-2">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
      </div>
    </template>

    <div class="space-y-5">
      <!-- Login type tabs -->
      <div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        <button
          v-for="t in [{ value: 'phone', label: 'По телефону', icon: 'i-lucide-phone' }, { value: 'email', label: 'По email', icon: 'i-lucide-mail' }]"
          :key="t.value"
          class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all"
          :class="loginType === t.value ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700'"
          @click="loginType = t.value as 'phone' | 'email'; login = ''; error = ''"
        >
          <UIcon :name="t.icon" class="text-base" />
          {{ t.label }}
        </button>
      </div>

      <!-- Login field -->
      <UFormField :label="loginType === 'phone' ? 'Номер телефона' : 'Email'">
        <UInput
          v-model="login"
          :type="loginType === 'email' ? 'email' : 'tel'"
          :placeholder="loginType === 'phone' ? '+7 (___) ___-__-__' : 'example@mail.ru'"
          :leading-icon="loginType === 'phone' ? 'i-lucide-phone' : 'i-lucide-mail'"
          size="lg"
          class="w-full"
          @keyup.enter="submit"
        />
      </UFormField>

      <!-- Password field -->
      <UFormField label="Пароль">
        <UInput
          v-model="password"
          type="password"
          placeholder="Минимум 6 символов"
          leading-icon="i-lucide-lock"
          size="lg"
          class="w-full"
          @keyup.enter="submit"
        />
      </UFormField>

      <!-- Error -->
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :description="error"
        icon="i-lucide-alert-circle"
      />

      <!-- Submit button -->
      <UButton
        size="lg"
        class="w-full justify-center"
        :loading="loading"
        @click="submit"
      >
        {{ mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
      </UButton>
    </div>

    <template #footer>
      <div class="text-center text-sm text-gray-500">
        <template v-if="mode === 'login'">
          Нет аккаунта?
          <button class="text-purple-600 hover:underline font-medium ml-1" @click="switchMode">
            Зарегистрироваться
          </button>
        </template>
        <template v-else>
          Уже есть аккаунт?
          <button class="text-purple-600 hover:underline font-medium ml-1" @click="switchMode">
            Войти
          </button>
        </template>
      </div>
    </template>
  </UCard>
</template>
