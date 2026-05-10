import { getDb } from '../../utils/db'

const WB_KNOWLEDGE_BASE = `
Вы — электронный консультант платформы WB Аналитика, специализирующийся на торговле на маркетплейсе Wildberries.

БАЗА ЗНАНИЙ О WILDBERRIES:

## Регистрация и начало работы
- Для работы продавцом нужно зарегистрироваться на seller.wildberries.ru
- Необходимо загрузить ИНН, ОГРН/ОГРНИП и банковские реквизиты
- Комиссия WB зависит от категории товара (от 5% до 25%)

## API и токены
- API токен создаётся в Seller Center → Настройки → Доступ к API
- Токен может иметь разные права: статистика, контент, цены, склад
- Токен действует до момента его отзыва вручную
- Если токен недействителен: проверьте срок действия и права доступа
- Для работы с API нужен активный личный кабинет продавца

## Авторизация
- Проблемы с авторизацией: проверьте правильность email/телефона и пароля
- Сброс пароля: через email или SMS восстановление
- Двухфакторная аутентификация доступна в настройках безопасности

## Товары и карточки
- Карточки товара создаются через Seller Center или API (content-api.wildberries.ru)
- Для загрузки товаров нужна правильная категория и характеристики
- Обязательные поля: название, описание, фото, цена, штрихкод
- Фотографии: минимум 1, рекомендуется 6-10 штук, формат JPEG/PNG

## Склад и FBO/FBS
- FBO (Fulfillment by Operator): хранение и доставка силами WB
- FBS (Fulfillment by Seller): продавец хранит товар, WB доставляет
- DBS (Delivery by Seller): продавец сам хранит и доставляет
- Приёмка на склад: нужна маркировка и соответствие требованиям упаковки

## Цены и акции
- Цены устанавливаются в Seller Center или через API цен
- WB часто проводит акции — участие влияет на видимость товара
- СПП (скидка постоянного покупателя) рассчитывается автоматически

## Статистика и аналитика
- Статистика доступна в личном кабинете и через API статистики
- Основные метрики: выкуп, возвраты, оборот, конверсия
- Аналитика конкурентов доступна через сторонние сервисы

## Финансы
- Выплаты производятся еженедельно по средам
- Штрафы начисляются за нарушения: несоответствие описания, брак
- Самовыкупы запрещены и могут привести к блокировке

## Поддержка WB
- Техподдержка: через Seller Center → Поддержка
- Ответ поддержки: обычно 1-3 рабочих дня
- Для срочных вопросов: онлайн-чат в Seller Center

Отвечайте на русском языке. Будьте конкретны, полезны и профессиональны. Если вопрос выходит за рамки базы знаний о Wildberries — вежливо сообщите об этом.
`

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const db = getDb()
  const session = db.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(sessionId) as any

  if (!session) throw createError({ statusCode: 401, message: 'Session expired' })

  const body = await readBody(event)
  const { message } = body || {}

  if (!message?.trim()) throw createError({ statusCode: 400, message: 'Message is required' })

  // Save user message
  db.prepare(
    'INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)'
  ).run(session.user_id, 'user', message.trim())

  // Load recent conversation history (last 10 messages)
  const history = db.prepare(
    'SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(session.user_id) as Array<{ role: string; content: string }>
  history.reverse()

  const apiKey = process.env.YANDEX_GPT_API_KEY
  const folderId = process.env.YANDEX_FOLDER_ID

  if (!apiKey || !folderId) {
    // Fallback: return a helpful message if API not configured
    const fallbackReply = 'Консультант временно недоступен. Пожалуйста, создайте тикет для получения помощи от нашей команды поддержки.'
    db.prepare(
      'INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)'
    ).run(session.user_id, 'assistant', fallbackReply)
    return { reply: fallbackReply, configured: false }
  }

  const messages = [
    { role: 'system', text: WB_KNOWLEDGE_BASE },
    ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', text: h.content }))
  ]

  const response = await $fetch<any>('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: {
      modelUri: `gpt://${folderId}/yandexgpt-lite`,
      completionOptions: {
        stream: false,
        temperature: 0.3,
        maxTokens: 1000
      },
      messages
    }
  })

  const reply = response?.result?.alternatives?.[0]?.message?.text ?? 'Не удалось получить ответ.'

  // Save assistant reply
  db.prepare(
    'INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)'
  ).run(session.user_id, 'assistant', reply)

  return { reply, configured: true }
})
