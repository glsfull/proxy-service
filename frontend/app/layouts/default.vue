<script setup lang="ts">
const { data: user } = await useFetch('/api/auth/me', {
  default: () => null,
  ignoreResponseError: true
})

const sideMenuOpen = ref(false)
const { marketplaceOptions, selectedMarketplace, currentMarketplace, selectMarketplace } = useMarketplaceSwitcher()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/auth')
}

const analyticsLinks = [
  { to: '/analytics', label: 'Главная сводка', icon: 'i-lucide-layout-dashboard' },
  { to: '/analytics/products', label: 'Товары', icon: 'i-lucide-package-search' },
  { to: '/analytics/stocks', label: 'Остатки', icon: 'i-lucide-boxes' },
  { to: '/analytics/finance', label: 'Финансовые отчёты', icon: 'i-lucide-receipt-text' },
  { to: '/analytics/expenses', label: 'Расходы', icon: 'i-lucide-calculator' },
  { to: '/analytics/barcodes', label: 'Генерация Bar-code', icon: 'i-lucide-barcode' },
  { to: '/analytics/sync', label: 'Настройки синхронизации', icon: 'i-lucide-refresh-cw' }
]

const navLinks = computed(() => {
  const links = [
    { to: '/dashboard', label: 'Кабинет', icon: 'i-lucide-layout-dashboard' },
    { to: '/analytics', label: 'Аналитика', icon: 'i-lucide-chart-no-axes-combined' },
    { to: '/tickets', label: 'Тикеты', icon: 'i-lucide-ticket' },
    { to: '/chat', label: 'Консультант', icon: 'i-lucide-bot' },
    { to: '/profile', label: 'Профиль', icon: 'i-lucide-user-circle' }
  ]
  if ((user.value as any)?.isAdmin) {
    links.push({ to: '/admin', label: 'Админ', icon: 'i-lucide-shield-check' })
  }
  return links
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo -->
        <div class="flex items-center gap-4 min-w-0">
          <UButton
            v-if="user"
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-menu"
            aria-label="Открыть меню"
            @click="sideMenuOpen = true"
          />
          <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
            <UIcon name="i-lucide-bar-chart-2" class="text-purple-600 text-2xl" />
            <span class="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">WB Аналитика</span>
          </NuxtLink>

          <!-- Nav links (show when user is authenticated) -->
          <nav v-if="user" class="hidden lg:flex items-center gap-1 ml-2">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800"
              active-class="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
            >
              <UIcon :name="link.icon" class="text-base" />
              <span class="hidden sm:inline">{{ link.label }}</span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-2">
          <div
            v-if="user"
            class="hidden md:inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1"
            :title="`Текущий маркетплейс: ${currentMarketplace.label}`"
          >
            <button
              v-for="marketplace in marketplaceOptions"
              :key="marketplace.id"
              type="button"
              class="flex min-w-20 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all"
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

          <!-- Theme toggle -->
          <UColorModeButton
            size="sm"
            variant="ghost"
            color="neutral"
          />

          <template v-if="user">
            <span class="text-sm text-gray-500 hidden md:block">{{ (user as any).email || (user as any).phone }}</span>
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-log-out" @click="logout">
              <span class="hidden sm:inline">Выйти</span>
            </UButton>
          </template>
          <template v-else>
            <UButton size="sm" to="/auth">Войти</UButton>
          </template>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <USlideover v-if="user" v-model:open="sideMenuOpen" title="Навигация">
      <template #body>
        <div class="space-y-6">
          <div>
            <div class="text-xs font-semibold uppercase text-gray-400 mb-2">Маркетплейс</div>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="marketplace in marketplaceOptions"
                :key="marketplace.id"
                type="button"
                class="flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors"
                :class="selectedMarketplace === marketplace.id
                  ? 'border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900'"
                @click="selectMarketplace(marketplace.id)"
              >
                <span class="flex items-center gap-2">
                  <UIcon :name="marketplace.icon" :class="marketplace.accentClass" />
                  {{ marketplace.label }}
                </span>
                <UBadge :color="marketplace.status === 'active' ? 'primary' : 'neutral'" variant="soft">
                  {{ marketplace.status === 'active' ? 'Активен' : 'Запланировано' }}
                </UBadge>
              </button>
            </div>
          </div>

          <div>
            <div class="text-xs font-semibold uppercase text-gray-400 mb-2">Разделы</div>
            <nav class="space-y-1">
              <NuxtLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                active-class="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                @click="sideMenuOpen = false"
              >
                <UIcon :name="link.icon" />
                {{ link.label }}
              </NuxtLink>
            </nav>
          </div>

          <div>
            <div class="text-xs font-semibold uppercase text-gray-400 mb-2">Аналитика</div>
            <nav class="space-y-1">
              <NuxtLink
                v-for="link in analyticsLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                active-class="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                @click="sideMenuOpen = false"
              >
                <UIcon :name="link.icon" />
                {{ link.label }}
              </NuxtLink>
            </nav>
          </div>
        </div>
      </template>
    </USlideover>

    <footer class="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-sm text-gray-400">
      WB Аналитика &copy; {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>
