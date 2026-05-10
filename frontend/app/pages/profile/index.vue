<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: user, error: authError } = await useFetch('/api/auth/me', { ignoreResponseError: true })
if (authError.value) await navigateTo('/auth')

const { data: profile, refresh: refreshProfile } = await useFetch('/api/profile', {
  ignoreResponseError: true,
  default: () => null
})

type ViewMode = 'cards' | 'list'
const viewMode = ref<ViewMode>('cards')
const searchQuery = ref('')

interface ProfileField {
  key: string
  label: string
  value: string
  icon: string
  color: string
  category: string
}

const tokenExpiryDaysLeft = computed(() => {
  const p = profile.value as any
  if (!p?.token_expires_at) return null
  const expiryDate = new Date(p.token_expires_at)
  return Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
})

const tokenExpiryWarning = computed(() => {
  const days = tokenExpiryDaysLeft.value
  if (days === null) return null
  if (days <= 0) return 'Срок действия токена истёк. Обновите токен для продолжения работы.'
  if (days <= 14) return `Токен истекает через ${days} дн. Рекомендуем обновить его заранее.`
  return null
})

const profileFields = computed<ProfileField[]>(() => {
  if (!profile.value) return []
  const p = profile.value as any
  const fields: ProfileField[] = [
    {
      key: 'company_name',
      label: 'Название компании',
      value: p.company_name || '—',
      icon: 'i-lucide-building-2',
      color: 'purple',
      category: 'company'
    },
    {
      key: 'inn',
      label: 'ИНН',
      value: p.inn || 'Не указан',
      icon: 'i-lucide-hash',
      color: 'blue',
      category: 'company'
    },
    {
      key: 'contact_name',
      label: 'Контактное лицо',
      value: p.contact_name || '—',
      icon: 'i-lucide-user',
      color: 'green',
      category: 'contact'
    },
    {
      key: 'wb_token',
      label: 'Токен Wildberries',
      value: p.wb_token ? `${String(p.wb_token).slice(0, 16)}...` : 'Не настроен',
      icon: 'i-lucide-key',
      color: 'amber',
      category: 'api'
    }
  ]

  if (p.seller_name) {
    fields.push({
      key: 'seller_name',
      label: 'Торговая марка (WB)',
      value: p.seller_name,
      icon: 'i-lucide-store',
      color: 'indigo',
      category: 'company'
    })
  }

  if (p.seller_rating !== null && p.seller_rating !== undefined) {
    fields.push({
      key: 'seller_rating',
      label: 'Рейтинг продавца',
      value: String(p.seller_rating),
      icon: 'i-lucide-star',
      color: 'yellow',
      category: 'api'
    })
  }

  if (p.token_expires_at) {
    const expiryDate = new Date(p.token_expires_at)
    const days = tokenExpiryDaysLeft.value
    fields.push({
      key: 'token_expires_at',
      label: 'Срок действия токена',
      value: `${expiryDate.toLocaleDateString('ru-RU')}${days !== null ? ` (${days > 0 ? `ещё ${days} дн.` : 'истёк'})` : ''}`,
      icon: 'i-lucide-clock',
      color: days !== null && days <= 14 ? 'red' : 'sky',
      category: 'api'
    })
  }

  fields.push(
    {
      key: 'created_at',
      label: 'Дата создания',
      value: p.created_at ? new Date(p.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }) : '—',
      icon: 'i-lucide-calendar',
      color: 'sky',
      category: 'meta'
    },
    {
      key: 'updated_at',
      label: 'Последнее обновление',
      value: p.updated_at ? new Date(p.updated_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }) : '—',
      icon: 'i-lucide-clock',
      color: 'slate',
      category: 'meta'
    }
  )

  return fields
})

const filteredFields = computed(() => {
  if (!searchQuery.value.trim()) return profileFields.value
  const q = searchQuery.value.toLowerCase()
  return profileFields.value.filter(f =>
    f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q)
  )
})

interface ProfileFieldColor {
  bg: string
  icon: string
  border: string
}

const defaultColor: ProfileFieldColor = {
  bg: 'bg-slate-100 dark:bg-slate-800/50',
  icon: 'text-slate-500 dark:text-slate-400',
  border: 'border-slate-200 dark:border-slate-700'
}

const colorMap: Record<string, ProfileFieldColor> = {
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800'
  },
  sky: {
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    icon: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-800'
  },
  slate: defaultColor,
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800'
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  }
}

function getColor(color: string): ProfileFieldColor {
  return colorMap[color] ?? defaultColor
}

const tokenActive = computed(() => {
  const p = profile.value as any
  return p?.wb_token && String(p.wb_token).length > 10
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Профиль
        </h1>
        <p class="text-base text-gray-500 dark:text-gray-400 mt-2">
          Управление профилем и настройками аккаунта
        </p>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <UButton
          v-if="profile"
          to="/profile/setup"
          size="lg"
          icon="i-lucide-refresh-cw"
          color="warning"
          variant="outline"
        >
          Обновить токен
        </UButton>
        <UButton
          to="/profile/setup"
          size="lg"
          icon="i-lucide-settings-2"
        >
          {{ profile ? 'Редактировать профиль' : 'Создать профиль' }}
        </UButton>
      </div>
    </div>

    <!-- Token expiry warning banner -->
    <UAlert
      v-if="tokenExpiryWarning"
      color="warning"
      variant="soft"
      icon="i-lucide-clock-alert"
      class="mb-6"
      :description="tokenExpiryWarning"
    >
      <template #actions>
        <UButton to="/profile/setup" size="sm" color="warning" icon="i-lucide-refresh-cw">
          Обновить токен
        </UButton>
      </template>
    </UAlert>

    <!-- User info card -->
    <div class="rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 sm:p-8 mb-8 text-white shadow-xl shadow-purple-500/20">
      <div class="flex flex-col sm:flex-row sm:items-center gap-5">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
          <UIcon name="i-lucide-user-circle" class="text-white text-4xl sm:text-5xl" />
        </div>
        <div class="flex-1">
          <div class="text-2xl sm:text-3xl font-bold">
            {{ (user as any)?.name || (profile as any)?.contact_name || 'Пользователь' }}
          </div>
          <div class="text-purple-200 text-base mt-1">
            {{ (user as any)?.email || (user as any)?.phone || '—' }}
          </div>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-center">
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            :class="tokenActive ? 'bg-green-500/30 text-green-200' : 'bg-white/10 text-white/60'"
          >
            <div class="w-2 h-2 rounded-full" :class="tokenActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'" />
            {{ tokenActive ? 'Токен активен' : 'Токен не настроен' }}
          </div>
        </div>
      </div>
    </div>

    <!-- No profile state -->
    <template v-if="!profile">
      <div class="text-center py-20">
        <div class="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-user-plus" class="text-purple-600 dark:text-purple-400 text-4xl" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Профиль не создан</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Создайте профиль с токеном Wildberries, чтобы начать работу с аналитикой маркетплейса.
        </p>
        <UButton to="/profile/setup" size="xl" icon="i-lucide-plus-circle">
          Создать профиль
        </UButton>
      </div>
    </template>

    <!-- Profile fields -->
    <template v-else>
      <!-- Controls: search + view toggle -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="Поиск по полям профиля..."
            leading-icon="i-lucide-search"
            size="lg"
            class="w-full"
          />
        </div>
        <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 self-center shrink-0">
          <button
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            :class="viewMode === 'cards'
              ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
            @click="viewMode = 'cards'"
          >
            <UIcon name="i-lucide-layout-grid" class="text-base" />
            <span class="hidden sm:inline">Карточки</span>
          </button>
          <button
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            :class="viewMode === 'list'
              ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
            @click="viewMode = 'list'"
          >
            <UIcon name="i-lucide-list" class="text-base" />
            <span class="hidden sm:inline">Список</span>
          </button>
        </div>
      </div>

      <!-- Empty search results -->
      <div v-if="filteredFields.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-search-x" class="text-gray-300 dark:text-gray-600 text-5xl mb-4" />
        <p class="text-gray-500 dark:text-gray-400 text-lg">Ничего не найдено</p>
        <p class="text-gray-400 text-sm mt-1">Попробуйте изменить поисковый запрос</p>
      </div>

      <!-- Cards view -->
      <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="field in filteredFields"
          :key="field.key"
          class="group rounded-2xl border bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
          :class="getColor(field.color).border"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              :class="getColor(field.color).bg"
            >
              <UIcon :name="field.icon" class="text-2xl" :class="getColor(field.color).icon" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {{ field.label }}
              </div>
              <div class="text-xl font-bold text-gray-900 dark:text-white truncate">
                {{ field.value }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List view -->
      <div v-else class="space-y-3">
        <div
          v-for="field in filteredFields"
          :key="field.key"
          class="group flex items-center gap-5 rounded-2xl border bg-white dark:bg-gray-900 px-6 py-5 transition-all hover:shadow-md"
          :class="getColor(field.color).border"
        >
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
            :class="getColor(field.color).bg"
          >
            <UIcon :name="field.icon" class="text-xl" :class="getColor(field.color).icon" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ field.label }}</div>
            <div class="text-lg font-bold text-gray-900 dark:text-white truncate">{{ field.value }}</div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-gray-400 transition-colors" />
        </div>
      </div>
    </template>
  </div>
</template>
