<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: user, error: authError } = await useFetch('/api/auth/me', { ignoreResponseError: true })
if (authError.value) await navigateTo('/auth')

interface ChatMessage {
  id?: number
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

const { data: historyData } = await useFetch<ChatMessage[]>('/api/chat/history', {
  ignoreResponseError: true,
  default: () => []
})

const messages = ref<ChatMessage[]>(historyData.value ?? [])
const inputText = ref('')
const sending = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const notConfigured = ref(false)

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

onMounted(() => scrollToBottom())

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || sending.value) return

  const userMsg: ChatMessage = { role: 'user', content: text }
  messages.value.push(userMsg)
  inputText.value = ''
  await scrollToBottom()

  sending.value = true
  try {
    const res = await $fetch<{ reply: string; configured: boolean }>('/api/chat/message', {
      method: 'POST',
      body: { message: text }
    })
    messages.value.push({ role: 'assistant', content: res.reply })
    if (!res.configured) notConfigured.value = true
  } catch {
    messages.value.push({
      role: 'assistant',
      content: 'Произошла ошибка. Пожалуйста, попробуйте ещё раз или создайте тикет.'
    })
  } finally {
    sending.value = false
    await scrollToBottom()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const suggestedQuestions = [
  'Как создать API токен в Seller Center?',
  'Что делать если токен недействителен?',
  'Как загрузить товары на Wildberries?',
  'Как работает система FBO?',
  'Когда происходят выплаты от WB?'
]

async function sendSuggested(q: string) {
  inputText.value = q
  await sendMessage()
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col" style="height: calc(100vh - 10rem)">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6 shrink-0">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
        <UIcon name="i-lucide-bot" class="text-white text-2xl" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          WB Консультант
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Электронный консультант по работе с Wildberries
        </p>
      </div>
      <div class="ml-auto flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Онлайн
      </div>
    </div>

    <!-- API not configured banner -->
    <div
      v-if="notConfigured"
      class="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4 mb-4 flex items-start gap-3 shrink-0"
    >
      <UIcon name="i-lucide-alert-triangle" class="text-amber-500 text-xl shrink-0 mt-0.5" />
      <div>
        <div class="font-semibold text-amber-800 dark:text-amber-300 text-sm">Yandex GPT не настроен</div>
        <div class="text-amber-700 dark:text-amber-400 text-xs mt-1">
          Задайте переменные окружения <code class="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">YANDEX_GPT_API_KEY</code> и
          <code class="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">YANDEX_FOLDER_ID</code> для полноценной работы консультанта.
        </div>
      </div>
    </div>

    <!-- Chat messages area -->
    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4 space-y-4 mb-4"
    >
      <!-- Welcome state -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center py-8">
        <div class="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
          <UIcon name="i-lucide-message-circle-question" class="text-purple-600 dark:text-purple-400 text-3xl" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Задайте вопрос</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
          Я помогу разобраться с вопросами о торговле на Wildberries: токены, загрузка товаров, склад и многое другое.
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="q in suggestedQuestions"
            :key="q"
            class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-300 transition-all text-left"
            @click="sendSuggested(q)"
          >
            {{ q }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <template v-else>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="flex items-end gap-2 max-w-[85%]"
            :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-0.5"
              :class="msg.role === 'user'
                ? 'bg-purple-600'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600'"
            >
              <UIcon
                :name="msg.role === 'user' ? 'i-lucide-user' : 'i-lucide-bot'"
                class="text-white text-sm"
              />
            </div>
            <div
              class="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
              :class="msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="sending" class="flex justify-start">
          <div class="flex items-end gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <UIcon name="i-lucide-bot" class="text-white text-sm" />
            </div>
            <div class="px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div class="flex gap-1 items-center h-5">
                <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0ms" />
                <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 150ms" />
                <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 300ms" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Input area -->
    <div class="shrink-0 flex gap-3 items-end">
      <div class="flex-1">
        <UTextarea
          v-model="inputText"
          placeholder="Задайте вопрос о Wildberries..."
          :rows="1"
          autoresize
          :disabled="sending"
          class="w-full"
          @keydown="handleKeydown"
        />
      </div>
      <UButton
        size="lg"
        icon="i-lucide-send"
        :loading="sending"
        :disabled="!inputText.trim()"
        class="shrink-0"
        @click="sendMessage"
      >
        <span class="hidden sm:inline">Отправить</span>
      </UButton>
    </div>
    <p class="text-xs text-gray-400 text-center mt-2 shrink-0">
      Enter — отправить, Shift+Enter — новая строка
    </p>
  </div>
</template>
