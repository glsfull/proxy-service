<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: user, error: authError } = await useFetch('/api/auth/me', { ignoreResponseError: true })
if (authError.value) await navigateTo('/auth')

const { data: tickets, refresh } = await useFetch('/api/tickets', {
  ignoreResponseError: true,
  default: () => []
})

const showCreateModal = ref(false)
const creating = ref(false)
const newTicket = reactive({ title: '', description: '' })

const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'info' | 'neutral' | 'error' }> = {
  open: { label: 'Открыт', color: 'warning' },
  in_progress: { label: 'В работе', color: 'info' },
  resolved: { label: 'Решён', color: 'success' },
  closed: { label: 'Закрыт', color: 'neutral' }
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function createTicket() {
  if (!newTicket.title.trim() || !newTicket.description.trim()) return
  creating.value = true
  try {
    await $fetch('/api/tickets', {
      method: 'POST',
      body: { title: newTicket.title, description: newTicket.description }
    })
    newTicket.title = ''
    newTicket.description = ''
    showCreateModal.value = false
    await refresh()
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Тикеты
        </h1>
        <p class="text-base text-gray-500 dark:text-gray-400 mt-2">
          Обращения в службу поддержки
        </p>
      </div>
      <UButton size="lg" icon="i-lucide-plus-circle" @click="showCreateModal = true">
        Создать тикет
      </UButton>
    </div>

    <!-- Create ticket modal -->
    <UModal v-model:open="showCreateModal" title="Новый тикет">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Тема обращения" required>
            <UInput
              v-model="newTicket.title"
              placeholder="Кратко опишите проблему..."
              size="lg"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Описание" required>
            <UTextarea
              v-model="newTicket.description"
              placeholder="Подробно опишите вашу проблему, укажите шаги для воспроизведения..."
              :rows="5"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="ghost" @click="showCreateModal = false">
            Отмена
          </UButton>
          <UButton
            :loading="creating"
            :disabled="!newTicket.title.trim() || !newTicket.description.trim()"
            icon="i-lucide-send"
            @click="createTicket"
          >
            Отправить
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Empty state -->
    <div v-if="!(tickets as any[]).length" class="text-center py-20">
      <div class="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
        <UIcon name="i-lucide-ticket" class="text-blue-600 dark:text-blue-400 text-4xl" />
      </div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Тикетов нет</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Если у вас возникли проблемы или вопросы, создайте тикет — наша команда поддержки поможет.
      </p>
      <UButton size="xl" icon="i-lucide-plus-circle" @click="showCreateModal = true">
        Создать первый тикет
      </UButton>
    </div>

    <!-- Tickets list -->
    <div v-else class="space-y-4">
      <div
        v-for="ticket in (tickets as any[])"
        :key="ticket.id"
        class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start gap-4">
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
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {{ ticket.title }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">
              {{ ticket.description }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <div class="text-xs text-gray-400">
              {{ formatDate(ticket.created_at) }}
            </div>
            <div v-if="ticket.updated_at !== ticket.created_at" class="text-xs text-gray-400 mt-1">
              Обновлён: {{ formatDate(ticket.updated_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
