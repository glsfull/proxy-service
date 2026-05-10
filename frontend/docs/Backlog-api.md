# Backlog API — WB, Ozon, Yandex Market

## Цель

Подготовить платформу к модульной поддержке маркетплейсов: Wildberries остается активным модулем, Ozon и Yandex Market планируются как следующие интеграции. Этот backlog фиксирует сравнительную карту API, пробелы по методам и задачи для генерации отдельных модулей.

## Сравнительная таблица API

| Функциональный блок | Wildberries | Ozon | Yandex Market | Похожесть и аналогия | Полнота для аналитики |
|---|---|---|---|---|---|
| Авторизация и кабинеты | Токен продавца по категориям доступа; текущая реализация хранит WB-профиль и валидирует категории | Client-Id + Api-Key для Seller API; нужен отдельный профиль подключения | OAuth / токены кабинета и campaign/business идентификаторы; нужен профиль магазина | У всех есть отдельная сущность подключения продавца, но модель прав и идентификаторы отличаются | WB: высокая в текущем модуле; Ozon/YM: требуется исследование прав и схемы хранения |
| Каталог товаров | Content API: карточки, характеристики, справочники, nmID/chrtID | Product API: товары, SKU, атрибуты, категории | Offer / Business API: офферы, карточки, категории | Аналогия: единый товарный кэш с нормализованными полями marketplace_product_id, sku, barcode, brand, category | WB: спланировано детально; Ozon/YM: нужно сопоставить обязательные атрибуты |
| Остатки | FBY task-based remains и FBS stocks по складам | Warehouse stocks и FBO/FBS остатки | Остатки по складам/кампаниям через offers/stocks | У всех есть разрез склад/товар, но разные схемы фулфилмента | Средняя: нужен адаптер fulfillment_type и warehouse_id |
| Цены и скидки | API цен и скидок требует уточнения актуального метода | Product prices, discounts, premium/marketing price поля | Price API / offer mappings и обновление цен | Аналогия: отдельный price snapshot по товару и периоду | Средняя: нужно проверить доступность историчности цен |
| Заказы | Statistics / Marketplace orders как оперативный источник | FBO/FBS postings и analytics по заказам | Orders API по кампаниям | Аналогия: order_id, status, created_at, items, warehouse, delivery scheme | Высокая после нормализации статусов |
| Продажи и выкупы | Statistics sales, отчёты реализации, srid/nmID для сопоставления | Finance/realization и postings analytics | Reports / orders/payments для закрытых данных | Аналогия частичная: выкуп/реализация у разных API выражены разными событиями | Средняя: нужно зафиксировать бизнес-правила для buyout |
| Возвраты и отмены | Statistics / Reports с признаком операции после проверки методов | Returns API, posting cancellation, finance operations | Returns / order status transitions | Аналогия: отдельные события с привязкой к заказу/товару | Средняя: потребуется маппинг причин и статусов |
| Финансы | Баланс, отчёты реализации, эквайринг, rrdId/reportId пагинация | Finance transactions, reports, compensation, services | Accounting/reporting по заказам и услугам | Аналогия: финансовая строка с типом операции, суммой, комиссией, периодом | WB: высокая по плану; Ozon/YM: нужно исследовать детализацию комиссий |
| Реклама | WB Ads расходы отдельным блоком | Ozon Performance / promotion reports | Yandex Direct / Market promotion отчёты | Аналогия слабее: рекламные системы сильно отличаются | Низкая: нужен отдельный discovery по каждому маркетплейсу |
| Асинхронные отчёты | taskId polling для FBY и отчётов | report code / async report endpoints | report generation endpoints | Аналогия: create -> poll -> download | Высокая для общего helper-модуля polling |
| Лимиты и трассировка | Нужны rate limit handling и выключенное трассирование | Нужны лимиты по endpoint group | Нужны лимиты по campaign/business API | Аналогия: общий retry/rate-limit middleware с настройками провайдера | Высокая для общей инфраструктуры |

## Нормализованная модель модулей

| Слой | Общий контракт | WB | Ozon | Yandex Market |
|---|---|---|---|---|
| `marketplace_connections` | user_id, marketplace, credentials_ref, seller_name, external_account_id, status | wb_token, seller_id | client_id, api_key, seller_id | oauth/client token, business_id, campaign_id |
| Product cache | marketplace_product_id, sku, barcode, title, brand, category, image_url, updated_at | nmID/chrtID/vendorCode | product_id/offer_id/sku | offer_id/market_sku/business_id |
| Stock cache | product key, warehouse, fulfillment_type, quantity, updated_at | FBY/FBS | FBO/FBS | warehouse/campaign stock |
| Order cache | order_id, status, created_at, items, delivery_scheme | orders/srid | posting/order number | order id/campaign id |
| Finance cache | operation_id, period, operation_type, amount, commission, product link | rrdId/reportId | transaction_id/report_id | report/order payment id |

## Задачи

### Эпик API.1 — Исследование и спецификации

| # | Задача | Статус |
|---|---|---|
| API.1.1 | Зафиксировать актуальные официальные методы WB для цен, заказов, продаж, возвратов и оперативных показателей | ✅ Done |
| API.1.2 | Собрать Ozon Seller API по блокам: авторизация, товары, остатки, цены, заказы, финансы, возвраты, отчёты | ✅ Done |
| API.1.3 | Собрать Yandex Market Partner API по блокам: авторизация, business/campaign, офферы, остатки, цены, заказы, финансы, возвраты, отчёты | ✅ Done |
| API.1.4 | Для каждого метода указать лимиты, тип пагинации, задержку данных, обязательные права токена и ключи сопоставления товара | ✅ Done |
| API.1.5 | Сформировать JSON/YAML-спецификации модулей для последующей генерации клиентов | ✅ Done |

### Эпик API.2 — Общая архитектура модулей

| # | Задача | Статус |
|---|---|---|
| API.2.1 | Ввести `marketplace` в модель подключения и подготовить миграцию с WB-only профиля | ✅ Done |
| API.2.2 | Описать интерфейс marketplace adapter: auth, validate, syncProducts, syncStocks, syncOrders, syncFinance, syncAds | ✅ Done |
| API.2.3 | Реализовать общий слой пагинации: cursor, offset/page, id-based continuation | ✅ Done |
| API.2.4 | Реализовать общий polling helper для асинхронных отчётов | ✅ Done |
| API.2.5 | Реализовать общий request logger с выключенным по умолчанию verbose trace по marketplace и endpoint | ✅ Done |

### Эпик API.3 — UI переключения маркетплейсов

| # | Задача | Статус |
|---|---|---|
| API.3.1 | Добавить селектор WB / Ozon / Yandex Market в меню Личного кабинета без выхода из профиля | ✅ Done |
| API.3.2 | Показывать активный модуль WB и статус «Запланировано» для Ozon и Yandex Market | ✅ Done |
| API.3.3 | Привязать выбранный marketplace к будущей модели `marketplace_connections` | ✅ Done |
| API.3.4 | Добавить фильтрацию аналитических разделов по возможностям выбранного marketplace | ✅ Done |
| API.3.5 | Добавить экран подключения Ozon и Yandex Market после готовности спецификаций | ✅ Done |

### Эпик API.4 — Генерация и внедрение модулей

| # | Задача | Статус |
|---|---|---|
| API.4.1 | Сгенерировать WB client module из спецификации и заменить ручные endpoint-обращения | ✅ Done |
| API.4.2 | Сгенерировать Ozon client module и подключить валидацию токена | ✅ Done |
| API.4.3 | Сгенерировать Yandex Market client module и подключить валидацию токена | ✅ Done |
| API.4.4 | Добавить интеграционные smoke-тесты с замоканными ответами API | ✅ Done |
| API.4.5 | Обновить dashboard, товары, остатки и финансы так, чтобы они работали через adapter contract | ✅ Done |
