<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: user, error: authError } = await useFetch('/api/auth/me', { ignoreResponseError: true })
if (authError.value) await navigateTo('/auth')
if (!(user.value as any)?.isAdmin) await navigateTo('/dashboard')

const activeTab = ref<'logs' | 'tickets'>('logs')

const { data: logsData, refresh: refreshLogs } = await useFetch('/api/admin/logs', {
  ignoreResponseError: true,
  default: () => ({ logs: [], total: 0 })
})

const { data: tickets, refresh: refreshTickets } = await useFetch('/api/admin/tickets', {
  ignoreResponseError: true,
  default: () => []
})

const updatingTicket = ref<number | null>(null)

const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'neutral' | 'error' }> = {
  open: { label: 'Открыт', color: 'warning' },
  in_progress: { label: 'В работе', color: 'info' },
  resolved: { label: 'Решён', color: 'success' },
  closed: { label: 'Закрыт', color: 'neutral' }
}

const ticketStatuses = [
  { value: 'open', label: 'Открыт' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'resolved', label: 'Решён' },
  { value: 'closed', label: 'Закрыт' }
]

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function statusCodeColor(code: number) {
  if (code < 300) return 'text-green-600 dark:text-green-400'
  if (code < 400) return 'text-blue-600 dark:text-blue-400'
  if (code < 500) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

async function updateTicketStatus(ticketId: number, status: string) {
  updatingTicket.value = ticketId
  try {
    await $fetch(`/api/tickets/${ticketId}`, { method: 'PATCH', body: { status } })
    await refreshTickets()
  } finally {
    updatingTicket.value = null
  }
}

const logStats = computed(() => {
  const logs = (logsData.value as any)?.logs ?? []
  const total = logs.length
  const errors = logs.filter((l: any) => l.status_code >= 400).length
  const avgDuration = total
    ? Math.round(logs.reduce((s: number, l: any) => s + (l.duration_ms ?? 0), 0) / total)
    : 0
  return { total, errors, avgDuration }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Header -->
    <div class="mb-10">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <UIcon name="i-lucide-shield-check" class="text-red-600 dark:text-red-400 text-xl" />
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Панель администратора
        </h1>
      </div>
      <p class="text-base text-gray-500 dark:text-gray-400 mt-1 ml-13">
        Управление тикетами и мониторинг запросов
      </p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
      <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Всего запросов</div>
        <div class="text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ (logsData as any)?.total ?? 0 }}
        </div>
      </div>
      <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Ошибок (последние 100)</div>
        <div class="text-3xl font-extrabold" :class="logStats.errors > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
          {{ logStats.errors }}
        </div>
      </div>
      <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Открытых тикетов</div>
        <div class="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
          {{ (tickets as any[]).filter(t => t.status === 'open').length }}
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="activeTab === 'logs'
          ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        @click="activeTab = 'logs'"
      >
        <UIcon name="i-lucide-activity" class="text-base" />
        Логи запросов
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="activeTab === 'tickets'
          ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        @click="activeTab = 'tickets'"
      >
        <UIcon name="i-lucide-ticket" class="text-base" />
        Тикеты
        <span
          v-if="(tickets as any[]).filter(t => t.status === 'open').length"
          class="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        >
          {{ (tickets as any[]).filter(t => t.status === 'open').length }}
        </span>
      </button>
    </div>

    <!-- Request logs tab -->
    <template v-if="activeTab === 'logs'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Последние запросы</h2>
        <UButton size="sm" variant="ghost" icon="i-lucide-refresh-cw" @click="() => refreshLogs()">
          Обновить
        </UButton>
      </div>

      <div v-if="!(logsData as any)?.logs?.length" class="text-center py-16 text-gray-400">
        <UIcon name="i-lucide-inbox" class="text-5xl mb-3" />
        <p>Логи ещё не собраны</p>
      </div>

      <div v-else class="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Время</th>
                <th class="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Метод</th>
                <th class="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Путь</th>
                <th class="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Код</th>
                <th class="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Время (мс)</th>
                <th class="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Пользователь</th>
                <th class="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">IP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="log in (logsData as any).logs"
                :key="log.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td class="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                  {{ formatDate(log.created_at) }}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-0.5 rounded text-xs font-mono font-bold"
                    :class="log.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'"
                  >
                    {{ log.method }}
                  </span>
                </td>
                <td class="px-4 py-3 font-mono text-gray-700 dark:text-gray-300 text-xs max-w-xs truncate">
                  {{ log.path }}
                </td>
                <td class="px-4 py-3 font-mono font-bold" :class="statusCodeColor(log.status_code)">
                  {{ log.status_code }}
                </td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                  {{ log.duration_ms ?? '—' }}
                </td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                  {{ log.user_name || log.email || log.phone || '—' }}
                </td>
                <td class="px-4 py-3 text-gray-400 font-mono text-xs">
                  {{ log.ip || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Tickets tab -->
    <template v-else>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Все тикеты</h2>
        <UButton size="sm" variant="ghost" icon="i-lucide-refresh-cw" @click="() => refreshTickets()">
          Обновить
        </UButton>
      </div>

      <div v-if="!(tickets as any[]).length" class="text-center py-16 text-gray-400">
        <UIcon name="i-lucide-ticket" class="text-5xl mb-3" />
        <p>Тикетов нет</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="ticket in (tickets as any[])"
          :key="ticket.id"
          class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
        >
          <div class="flex flex-col lg:flex-row lg:items-start gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-3 mb-2">
                <span class="text-xs text-gray-400 font-mono">#{{ ticket.id }}</span>
                <UBadge
                  :color="statusConfig[ticket.status]?.color ?? 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ statusConfig[ticket.status]?.label ?? ticket.status }}
                </UBadge>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ ticket.user_name || ticket.email || ticket.phone }}
                </span>
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {{ ticket.title }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                {{ ticket.description }}
              </p>
              <div class="text-xs text-gray-400 mt-3">
                Создан: {{ formatDate(ticket.created_at) }}
              </div>
            </div>
            <div class="shrink-0 flex flex-col gap-2">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Изменить статус:</div>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="s in ticketStatuses"
                  :key="s.value"
                  size="xs"
                  :variant="ticket.status === s.value ? 'solid' : 'outline'"
                  :color="s.value === 'resolved' ? 'success' : s.value === 'closed' ? 'neutral' : s.value === 'in_progress' ? 'info' : 'warning'"
                  :loading="updatingTicket === ticket.id"
                  :disabled="ticket.status === s.value"
                  @click="updateTicketStatus(ticket.id, s.value)"
                >
                  {{ s.label }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
