<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: user, error: authError } = await useFetch('/api/auth/me', { ignoreResponseError: true })

if (authError.value) {
  await navigateTo('/auth')
}

const { data: profile } = await useFetch('/api/profile', { ignoreResponseError: true, default: () => null })
const { marketplaceOptions, selectedMarketplace, currentMarketplace, selectMarketplace } = useMarketplaceSwitcher()

const tokenActive = computed(() => {
  const p = profile.value as any
  return p?.wb_token && String(p.wb_token).length > 10
})

const stats = computed(() => {
  const p = profile.value as any
  if (!p) return []
  return [
    {
      label: 'Статус токена',
      value: tokenActive.value ? 'Активен' : 'Не настроен',
      icon: 'i-lucide-key',
      color: tokenActive.value ? 'green' : 'gray',
      valueColor: tokenActive.value ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
    },
    {
      label: 'Компания',
      value: p.company_name || '—',
      icon: 'i-lucide-building-2',
      color: 'purple',
      valueColor: 'text-gray-900 dark:text-white'
    },
    {
      label: 'Контакт',
      value: p.contact_name || '—',
      icon: 'i-lucide-user',
      color: 'blue',
      valueColor: 'text-gray-900 dark:text-white'
    }
  ]
})

const quickActions = computed(() => [
  {
    label: 'Аналитика',
    description: 'Сводка, товары, остатки и финансы WB',
    icon: 'i-lucide-chart-no-axes-combined',
    to: '/analytics',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  {
    label: profile.value ? 'Мой профиль' : 'Создать профиль',
    description: 'Просмотр и управление данными профиля',
    icon: 'i-lucide-user-circle',
    to: '/profile',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    label: profile.value ? 'Изменить настройки' : 'Настройка профиля',
    description: 'Мастер настройки токена и данных',
    icon: 'i-lucide-settings-2',
    to: '/profile/setup',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    label: 'Тикеты поддержки',
    description: 'Создать обращение к команде поддержки',
    icon: 'i-lucide-ticket',
    to: '/tickets',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20'
  },
  {
    label: 'WB Консультант',
    description: 'Электронный помощник по вопросам Wildberries',
    icon: 'i-lucide-bot',
    to: '/chat',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20'
  }
])
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Page header -->
    <div class="mb-10">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Личный кабинет
      </h1>
      <p class="text-base text-gray-500 dark:text-gray-400 mt-2">
        Добро пожаловать, <span class="text-gray-700 dark:text-gray-300 font-medium">{{ (user as any)?.name || (user as any)?.email || (user as any)?.phone }}</span>
      </p>
    </div>

    <!-- Profile not created yet -->
    <template v-if="!profile">
      <div class="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 p-8 mb-8 text-center">
        <div class="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-info" class="text-amber-600 dark:text-amber-400 text-2xl" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Профиль не заполнен</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Для начала работы с платформой необходимо создать профиль с токеном Wildberries.
        </p>
        <UButton to="/profile/setup" size="lg" icon="i-lucide-plus-circle">
          Создать профиль
        </UButton>
      </div>
    </template>

    <!-- Profile stats -->
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              :class="stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'"
            >
              <UIcon
                :name="stat.icon"
                class="text-2xl"
                :class="stat.color === 'green' ? 'text-green-600 dark:text-green-400' : stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'"
              />
            </div>
            <div class="min-w-0">
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</div>
              <div class="text-xl font-bold truncate" :class="stat.valueColor">{{ stat.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="profile" class="mb-10">
      <div class="flex flex-col gap-4 mb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Разделы аналитики</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Текущий маркетплейс: <span class="font-medium text-gray-700 dark:text-gray-200">{{ currentMarketplace.label }}</span>
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
            <button
              v-for="marketplace in marketplaceOptions"
              :key="marketplace.id"
              type="button"
              class="flex min-w-24 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all"
              :class="selectedMarketplace === marketplace.id
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'"
              :title="marketplace.description"
              @click="selectMarketplace(marketplace.id)"
            >
              <UIcon :name="marketplace.icon" class="text-base" :class="marketplace.accentClass" />
              <span>{{ marketplace.shortLabel }}</span>
            </button>
          </div>
          <UDropdownMenu
            :items="[[
              { label: 'Главная сводка', icon: 'i-lucide-layout-dashboard', to: '/analytics' },
              { label: 'Товары', icon: 'i-lucide-package-search', to: '/analytics/products' },
              { label: 'Остатки', icon: 'i-lucide-boxes', to: '/analytics/stocks' },
              { label: 'Финансовые отчёты', icon: 'i-lucide-receipt-text', to: '/analytics/finance' },
              { label: 'Расходы', icon: 'i-lucide-calculator', to: '/analytics/expenses' },
              { label: 'Настройки синхронизации', icon: 'i-lucide-refresh-cw', to: '/analytics/sync' }
            ]]"
          >
            <UButton icon="i-lucide-menu" variant="soft" color="neutral" />
          </UDropdownMenu>
        </div>
      </div>
      <div
        v-if="currentMarketplace.status === 'planned'"
        class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200 flex items-center justify-between gap-4"
      >
        <span>Модуль {{ currentMarketplace.label }} запланирован в Backlog API. Данные пока отображаются из активного WB-модуля.</span>
        <NuxtLink
          :to="`/marketplace/connect/${currentMarketplace.id}`"
          class="shrink-0 text-amber-900 dark:text-amber-100 underline underline-offset-2 hover:no-underline font-medium"
        >
          Подключить
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="section in [
            { label: 'Главная сводка', to: '/analytics', icon: 'i-lucide-layout-dashboard' },
            { label: 'Товары', to: '/analytics/products', icon: 'i-lucide-package-search' },
            { label: 'Остатки', to: '/analytics/stocks', icon: 'i-lucide-boxes' },
            { label: 'Финансовые отчёты', to: '/analytics/finance', icon: 'i-lucide-receipt-text' },
            { label: 'Расходы', to: '/analytics/expenses', icon: 'i-lucide-calculator' },
            { label: 'Настройки синхронизации', to: '/analytics/sync', icon: 'i-lucide-refresh-cw' }
          ]"
          :key="section.to"
          :to="section.to"
          class="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow"
        >
          <UIcon :name="section.icon" class="text-xl text-gray-400" />
          <span class="font-medium text-gray-900 dark:text-white">{{ section.label }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Quick actions -->
    <div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Быстрые действия</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.to"
          :to="action.to"
          class="group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" :class="action.bg">
            <UIcon :name="action.icon" class="text-2xl" :class="action.color" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900 dark:text-white">{{ action.label }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ action.description }}</div>
          </div>
          <UIcon name="i-lucide-arrow-right" class="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition-colors shrink-0" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
