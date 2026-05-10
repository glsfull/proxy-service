# Table-api — Справочник API: Wildberries, Ozon, Yandex Market

Дата составления: 2026-05-07.

Документ содержит сводную таблицу всех актуальных API-методов трёх маркетплейсов, используемых или планируемых к интеграции в WB Аналитику. Для каждого метода указаны: URL, HTTP-метод, краткое описание функционала, обязательные параметры запроса и формат JSON-ответа.

---

## Wildberries API

Все запросы требуют заголовок `Authorization: Bearer <token>`. Базовые хосты зависят от категории токена.

### Авторизация и инфраструктура

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| WB-AUTH-1 | GET | `https://common-api.wildberries.ru/api/v1/seller-info` | Информация о продавце: название компании, ИНН, торговая марка | — | `{ "name": "str", "tradeMark": "str", "inn": "str", "ogrn": "str" }` |
| WB-AUTH-2 | GET | `https://feedbacks-api.wildberries.ru/api/common/v1/rating` | Рейтинг продавца (оценка от покупателей) | — | `{ "valuation": "str" }` |
| WB-AUTH-3 | GET | `https://common-api.wildberries.ru/api/v1/token/info` | Срок действия токена и категории прав | — | `{ "tokenID": int, "expiredAt": "ISO8601", "permissions": [{ "name": "str", "isRead": bool, "isWrite": bool }] }` |
| WB-PING-1 | GET | `https://content-api.wildberries.ru/ping` | Проверка доступности Content API (категория «Контент») | — | `{ "ts": int }` |
| WB-PING-2 | GET | `https://seller-analytics-api.wildberries.ru/ping` | Проверка доступности Analytics API (категория «Аналитика») | — | `{ "ts": int }` |
| WB-PING-3 | GET | `https://marketplace-api.wildberries.ru/ping` | Проверка доступности Marketplace API (категория «Маркетплейс») | — | `{ "ts": int }` |
| WB-PING-4 | GET | `https://statistics-api.wildberries.ru/ping` | Проверка доступности Statistics API (категория «Статистика») | — | `{ "ts": int }` |
| WB-PING-5 | GET | `https://finance-api.wildberries.ru/ping` | Проверка доступности Finance API (категория «Финансы») | — | `{ "ts": int }` |

### Финансы

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| WB-FIN-1 | GET | `https://finance-api.wildberries.ru/api/v1/account/balance` | Текущий баланс лицевого счёта продавца | — | `{ "balance": { "net": float, "penalty": float, "returns": float, "hold": float } }` |
| WB-FIN-2 | GET | `https://finance-api.wildberries.ru/api/v1/reports/sales-report/list` | Список отчётов реализации за период | query: `dateFrom` (YYYY-MM-DD), `dateTo` (YYYY-MM-DD) | `[{ "realizationreport_id": int, "date_from": "str", "date_to": "str", "create_dt": "str" }]` |
| WB-FIN-3 | GET | `https://finance-api.wildberries.ru/api/v1/reports/sales-report/detail/by-period` | Детализация строк реализации за период с пагинацией по `rrdId` | query: `dateFrom`, `dateTo`, `rrdid` (курсор, 0 для начала), `limit` (max 100 000) | `[{ "realizationreport_id": int, "rrd_id": int, "gi_id": int, "subject_name": "str", "nm_id": int, "brand_name": "str", "sa_name": "str", "ts_name": "str", "barcode": "str", "doc_type_name": "str", "quantity": int, "retail_price": float, "retail_amount": float, "sale_percent": int, "commission_percent": float, "office_name": "str", "supplier_oper_name": "str", "order_dt": "ISO8601", "sale_dt": "ISO8601", "rr_dt": "ISO8601", "shk_id": int, "retail_price_withdisc_rub": float, "delivery_amount": int, "return_amount": int, "delivery_rub": float, "gi_box_type_name": "str", "product_discount_for_report": float, "supplier_promo": float, "rid": int, "ppvz_spp_prc": float, "ppvz_kvw_prc_base": float, "ppvz_kvw_prc": float, "sup_rating_prc_up": float, "is_kgvp_v2": float, "ppvz_sales_commission": float, "ppvz_for_pay": float, "ppvz_reward": float, "acquiring_fee": float, "acquiring_bank": "str", "ppvz_vw": float, "ppvz_vw_nds": float, "ppvz_office_id": int, "ppvz_office_name": "str", "ppvz_supplier_id": int, "ppvz_supplier_name": "str", "ppvz_inn": "str", "declaration_number": "str", "bonus_type_name": "str", "sticker_id": "str", "site_country": "str", "penalty": float, "additional_payment": float, "rebill_logistic_cost": float, "rebill_logistic_org": "str", "kiz": "str", "srid": "str" }]` |
| WB-FIN-4 | GET | `https://finance-api.wildberries.ru/api/v1/reports/sales-report/detail/by-rid` | Детализация отчёта реализации по конкретному `realizationreport_id` | query: `id` (realizationreport_id), `rrdid` (курсор), `limit` | Аналогично WB-FIN-3 |
| WB-FIN-5 | GET | `https://finance-api.wildberries.ru/api/v1/reports/acquiring` | Список отчётов эквайринга | query: `dateFrom`, `dateTo` | `[{ "id": int, "date_from": "str", "date_to": "str", "create_dt": "str" }]` |
| WB-FIN-6 | GET | `https://finance-api.wildberries.ru/api/v1/reports/acquiring/detail` | Детализация строк эквайринга с пагинацией | query: `id`, `rrdid`, `limit` | `[{ "rrd_id": int, "rid": int, "srid": "str", "nm_id": int, "sa_name": "str", "ts_name": "str", "site_country": "str", "acq_fee": float, "payment_amount": float, "order_dt": "ISO8601", "sale_dt": "ISO8601" }]` |

### Статистика (Statistics API)

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| WB-STAT-1 | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/orders` | Заказы: оперативные данные с задержкой до 30 минут | query: `dateFrom` (RFC3339), `flag` (0=обновление, 1=новые) | `[{ "date": "ISO8601", "lastChangeDate": "ISO8601", "warehouseName": "str", "countryName": "str", "oblastOkrugName": "str", "regionName": "str", "supplierArticle": "str", "nmId": int, "barcode": "str", "category": "str", "subject": "str", "brand": "str", "techSize": "str", "incomeID": int, "isSupply": bool, "isRealization": bool, "totalPrice": float, "discountPercent": int, "spp": float, "finishedPrice": float, "priceWithDisc": float, "isCancel": bool, "cancelDate": "ISO8601", "orderType": "str", "sticker": "str", "gNumber": "str", "srid": "str" }]` |
| WB-STAT-2 | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/sales` | Продажи и выкупы с задержкой до 30 минут | query: `dateFrom` (RFC3339), `flag` | `[{ "date": "ISO8601", "lastChangeDate": "ISO8601", "supplierArticle": "str", "techSize": "str", "barcode": "str", "totalPrice": float, "discountPercent": int, "isSupply": bool, "isRealization": bool, "priceWithDisc": float, "nmId": int, "subject": "str", "category": "str", "brand": "str", "warehouseName": "str", "countryName": "str", "oblastOkrugName": "str", "regionName": "str", "incomeID": int, "saleID": "str", "sticker": "str", "sppPrice": float, "forPay": float, "finishedPrice": float, "priceCorrectionDiscount": float, "spp": float, "paymentSaleAmount": int, "orderType": "str", "gNumber": "str", "srid": "str" }]` |
| WB-STAT-3 | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/stocks` | Остатки на складах WB (FBW) | query: `dateFrom` (RFC3339) | `[{ "lastChangeDate": "ISO8601", "warehouseName": "str", "supplierArticle": "str", "nmId": int, "barcode": "str", "quantity": int, "inWayToClient": int, "inWayFromClient": int, "quantityFull": int, "category": "str", "subject": "str", "brand": "str", "techSize": "str", "Price": float, "Discount": int, "isSupply": bool, "isRealization": bool, "SCCode": "str" }]` |
| WB-STAT-4 | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/incomes` | Поставки (приходы) на склад WB | query: `dateFrom` (RFC3339) | `[{ "incomeId": int, "number": "str", "date": "ISO8601", "lastChangeDate": "ISO8601", "supplierArticle": "str", "techSize": "str", "barcode": "str", "quantity": int, "totalPrice": float, "dateClose": "ISO8601", "warehouseName": "str", "nmId": int, "status": "str" }]` |
| WB-STAT-5 | GET | `https://statistics-api.wildberries.ru/api/v1/supplier/reportDetailByPeriod` | Детализированный финансовый отчёт за период (альтернатива FIN-3) | query: `dateFrom`, `dateTo`, `rrdid`, `limit` | Аналогично WB-FIN-3 |

### Контент (Content API)

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| WB-CNT-1 | POST | `https://content-api.wildberries.ru/content/v2/get/cards/list` | Список карточек товаров с cursor-пагинацией | body: `{ "settings": { "cursor": { "updatedAt": "ISO8601", "nmID": int, "limit": int }, "filter": { "withPhoto": int } } }` | `{ "cards": [{ "nmID": int, "imtID": int, "nmUUID": "str", "subjectID": int, "subjectName": "str", "vendorCode": "str", "brand": "str", "title": "str", "photos": [{ "big": "str", "c246x328": "str" }], "video": "str", "dimensions": { "length": int, "width": int, "height": int, "isValid": bool }, "characteristics": [{ "id": int, "name": "str", "value": ["str"] }], "sizes": [{ "chrtID": int, "techSize": "str", "wbSize": "str", "skus": ["str"] }], "tags": [{ "id": int, "name": "str", "color": "str" }], "createdAt": "ISO8601", "updatedAt": "ISO8601" }], "cursor": { "updatedAt": "ISO8601", "nmID": int, "total": int } }` |
| WB-CNT-2 | GET | `https://content-api.wildberries.ru/content/v2/object/parent/all` | Справочник родительских категорий | query: `locale` (ru/en/zh) | `{ "data": [{ "name": "str", "id": int }] }` |
| WB-CNT-3 | GET | `https://content-api.wildberries.ru/content/v2/object/all` | Справочник предметов (подкатегорий) | query: `name` (фильтр, необязательно), `locale`, `limit`, `offset` | `{ "data": [{ "subjectID": int, "parentID": int, "subjectName": "str", "parentName": "str" }] }` |
| WB-CNT-4 | GET | `https://content-api.wildberries.ru/content/v2/object/charcs/{subjectId}` | Характеристики предмета для заполнения карточки | path: `subjectId` (int) | `{ "data": [{ "charcID": int, "subjectID": int, "name": "str", "required": bool, "unitName": "str", "maxCount": int, "popular": bool, "charcType": int }] }` |
| WB-CNT-5 | GET | `https://content-api.wildberries.ru/content/v2/directory/brands` | Справочник брендов | query: `name` (фильтр), `limit`, `offset` | `{ "data": [{ "name": "str", "id": int }] }` |
| WB-CNT-6 | GET | `https://content-api.wildberries.ru/content/v2/directory/colors` | Справочник цветов | query: `locale` | `{ "data": [{ "name": "str", "parentName": "str" }] }` |
| WB-CNT-7 | GET | `https://content-api.wildberries.ru/content/v2/tags/goods/list` | Список тегов пользователя | query: `offset`, `limit` | `{ "data": { "tagsWithCount": [{ "id": int, "name": "str", "color": "str", "count": int }] } }` |
| WB-CNT-8 | GET | `https://content-api.wildberries.ru/content/v2/cards/error/list` | Карточки с ошибками модерации | query: `limit`, `offset` | `{ "data": [{ "nmID": int, "vendorCode": "str", "errors": ["str"], "updatedAt": "ISO8601" }] }` |

### Цены и скидки

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| WB-PRC-1 | GET | `https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter` | Розничные цены и скидки по nmID с пагинацией | query: `limit` (max 1000), `offset`, `filterNmIds` (список nmID через запятую) | `{ "data": { "listGoods": [{ "nmID": int, "vendorCode": "str", "sizes": [{ "chrtID": int, "techSize": "str", "skus": ["str"], "price": int, "discountedPrice": float, "clubDiscountedPrice": float }], "currencyIsoCode4217": "str", "discount": int, "clubDiscount": int, "editableSizePrice": bool }] } }` |
| WB-PRC-2 | POST | `https://discounts-prices-api.wildberries.ru/api/v2/upload/task` | Установить новые цены и скидки | body: `{ "data": [{ "nmID": int, "price": int, "discount": int }] }` | `{ "data": { "taskId": "str" } }` |
| WB-PRC-3 | GET | `https://discounts-prices-api.wildberries.ru/api/v2/history/goods/task` | История изменений цен | query: `dateFrom` (RFC3339), `dateTo`, `limit`, `offset` | `{ "data": { "historyGoods": [{ "nmID": int, "vendorCode": "str", "price": int, "discount": int, "clubDiscount": int, "editUser": "str", "updateAt": "ISO8601" }] } }` |

### Склады и остатки (Marketplace API)

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| WB-STK-1 | GET | `https://marketplace-api.wildberries.ru/api/v3/warehouses` | Список складов продавца (для FBS) | — | `[{ "id": int, "name": "str", "officeId": int, "deliveryDurationDays": int, "cargoType": int, "workTime": { ... } }]` |
| WB-STK-2 | GET | `https://marketplace-api.wildberries.ru/api/v3/stocks/{warehouseId}` | Остатки FBS по складу (порциями по 1000 штрихкодов) | path: `warehouseId`; body: `{ "skus": ["barcode_str"] }` | `{ "stocks": [{ "sku": "str", "amount": int }] }` |
| WB-STK-3 | PUT | `https://marketplace-api.wildberries.ru/api/v3/stocks/{warehouseId}` | Обновить остатки FBS на складе | path: `warehouseId`; body: `{ "stocks": [{ "sku": "str", "amount": int }] }` | `{}` (204 No Content при успехе) |
| WB-STK-4 | DELETE | `https://marketplace-api.wildberries.ru/api/v3/stocks/{warehouseId}` | Удалить остатки FBS на складе | path: `warehouseId`; body: `{ "skus": ["str"] }` | `{}` |

### Остатки FBY (Analytics API — асинхронный отчёт)

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| WB-FBY-1 | POST | `https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains` | Создать задачу на формирование отчёта об остатках FBY | body: `{ "groupByBrand": bool, "groupBySubject": bool, "groupBySa": bool, "groupByNm": bool, "groupByBarcode": bool, "groupBySize": bool }` | `{ "data": { "taskId": "str" } }` |
| WB-FBY-2 | GET | `https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains/tasks/{taskId}/status` | Проверить статус задачи (polling) | path: `taskId` | `{ "data": { "status": "pending|processing|done|error|purged", "error": "str" } }` |
| WB-FBY-3 | GET | `https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains/tasks/{taskId}/download` | Скачать готовый отчёт (только при статусе `done`) | path: `taskId` | `{ "data": [{ "brand": "str", "subjectName": "str", "vendorCode": "str", "nmId": int, "barcode": "str", "techSize": "str", "volume": float, "inWayToClient": int, "inWayFromClient": int, "quantityWarehousesFull": int, "warehouses": [{ "warehouseName": "str", "quantity": int }] }] }` |

### Заказы (Marketplace API)

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| WB-ORD-1 | GET | `https://marketplace-api.wildberries.ru/api/v3/orders/new` | Новые заказы FBS, ожидающие сборки | — | `{ "orders": [{ "id": int, "createdAt": "ISO8601", "warehouseId": int, "warehouseName": "str", "supplyId": "str", "offices": ["str"], "address": { ... }, "user": { ... }, "skus": ["str"], "price": int, "convertedPrice": int, "currencyCode": int, "deliveryType": "str", "nmId": int, "chrtId": int, "article": "str", "colorCode": "str", "rid": "str", "subject": "str", "category": "str", "brand": "str", "techSize": "str", "isLargeCargo": bool }] }` |
| WB-ORD-2 | GET | `https://marketplace-api.wildberries.ru/api/v3/orders` | Все заказы с фильтрами и пагинацией | query: `limit`, `next` (cursor), `dateFrom` (unix ts), `dateTo`, `warehouseId`, `status` | `{ "orders": [...], "next": int }` |
| WB-ORD-3 | GET | `https://marketplace-api.wildberries.ru/api/v3/orders/{orderId}` | Информация о конкретном заказе | path: `orderId` | Объект заказа аналогично WB-ORD-1 |

---

## Ozon Seller API

Все запросы требуют заголовки: `Client-Id: <client_id>`, `Api-Key: <api_key>`, `Content-Type: application/json`. Базовый URL: `https://api-seller.ozon.ru`.

### Авторизация и информация о продавце

| # | Метод | URL | Описание | Параметры запроса (body JSON) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| OZ-AUTH-1 | POST | `/v3/product/info/stocks` | Проверка доступа — получение остатков (один SKU для проверки токена) | `{ "filter": { "offer_id": ["str"], "product_id": [int], "visibility": "ALL" }, "last_id": "", "limit": 1 }` | `{ "result": { "items": [...], "total": int, "last_id": "str" } }` |
| OZ-AUTH-2 | POST | `/v1/seller/info` | Информация о продавце: название, ИНН, статус | `{}` | `{ "description": "str", "email": "str", "inn": "str", "is_premium": bool, "loyalty_percent": float, "name": "str", "ogrn": "str", "seller_id": int }` |

### Каталог товаров (Product API)

| # | Метод | URL | Описание | Параметры запроса (body JSON) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| OZ-PRD-1 | POST | `/v3/product/list` | Список товаров продавца с пагинацией | `{ "filter": { "visibility": "ALL" }, "last_id": "str", "limit": int }` | `{ "result": { "items": [{ "product_id": int, "offer_id": "str" }], "total": int, "last_id": "str" } }` |
| OZ-PRD-2 | POST | `/v4/product/info/list` | Детальная информация о товарах по списку | `{ "product_id": [int], "sku": [int], "offer_id": ["str"] }` | `{ "result": { "items": [{ "id": int, "name": "str", "offer_id": "str", "barcode": "str", "barcodes": ["str"], "buybox_price": "str", "category_id": int, "description_category_id": int, "color_image": "str", "commissions": [{ "sale_schema": "str", "percent": float }], "created_at": "ISO8601", "images": ["str"], "marketing_price": "str", "min_ozon_price": "str", "min_price": "str", "old_price": "str", "premium_price": "str", "price": "str", "price_index": "str", "sources": [{ "is_enabled": bool, "sku": int, "source": "str" }], "status": { "is_archived": bool, "is_blacklisted": bool, "is_disabled": bool, "state": "str", "validation_state": "str" }, "vat": "str", "visibility_details": { ... }, "volume_weight": float, "stock": { "coming": int, "present": int, "reserved": int } }] } }` |
| OZ-PRD-3 | POST | `/v1/product/import` | Создать или обновить товар | `{ "items": [{ "attributes": [...], "barcode": "str", "category_id": int, "name": "str", "offer_id": "str", "old_price": "str", "price": "str", "vat": "str", "weight": int, "width": int, "height": int, "depth": int, "images": ["str"], "image_group_id": "str", "images360": ["str"], "pdf_list": [...] }] }` | `{ "result": { "item_id": int, "status": "str", "errors": [...] } }` |
| OZ-PRD-4 | POST | `/v1/product/attributes` | Получить список атрибутов для категории | `{ "attribute_type": "ALL", "category_id": [int], "language": "DEFAULT" }` | `{ "result": [{ "id": int, "attribute_complex_id": int, "name": "str", "description": "str", "type": "str", "is_collection": bool, "is_required": bool, "group_id": int, "group_name": "str", "is_aspect": bool, "max_value_count": int, "dictionary_id": int }] }` |
| OZ-PRD-5 | POST | `/v1/description-category/tree` | Дерево категорий для описания товара | `{ "language": "DEFAULT" }` | `{ "result": [{ "description_category_id": int, "category_name": "str", "disabled": bool, "children": [...] }] }` |

### Остатки (Stocks)

| # | Метод | URL | Описание | Параметры запроса (body JSON) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| OZ-STK-1 | POST | `/v3/product/info/stocks` | Остатки FBO и FBS по товарам | `{ "filter": { "offer_id": ["str"], "product_id": [int], "visibility": "ALL" }, "last_id": "str", "limit": int }` | `{ "result": { "items": [{ "offer_id": "str", "product_id": int, "stocks": [{ "present": int, "reserved": int, "type": "fbs|fbo" }] }], "total": int, "last_id": "str" } }` |
| OZ-STK-2 | POST | `/v1/product/stocks` | Обновить остатки FBS на складе | `{ "stocks": [{ "offer_id": "str", "product_id": int, "stock": int, "warehouse_id": int }] }` | `{ "result": [{ "offer_id": "str", "product_id": int, "updated": bool, "errors": [...] }] }` |
| OZ-STK-3 | POST | `/v1/warehouse/list` | Список складов Ozon (FBO и FBS) | `{}` | `{ "result": [{ "warehouse_id": int, "name": "str", "is_rfbs": bool }] }` |

### Цены

| # | Метод | URL | Описание | Параметры запроса (body JSON) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| OZ-PRC-1 | POST | `/v4/product/info/prices` | Цены товаров (розничная, маркетинговая, старая) | `{ "filter": { "offer_id": ["str"], "product_id": [int], "visibility": "ALL" }, "last_id": "str", "limit": int }` | `{ "result": { "items": [{ "product_id": int, "offer_id": "str", "price": { "price": "str", "old_price": "str", "premium_price": "str", "recommended_price": "str", "retail_price": "str", "vat": "str", "payment_type_price": "str" }, "price_indexes": { "external_index_data": { ... }, "ozon_index_data": { ... }, "price_index": "str" }, "commissions": [...], "marketing_seller_price": "str", "min_ozon_price": "str", "marketing_price": "str" }], "last_id": "str", "total": int } }` |
| OZ-PRC-2 | POST | `/v1/product/import/prices` | Установить цены на товары | `{ "prices": [{ "auto_action_enabled": "UNKNOWN", "currency_code": "RUB", "min_price": "str", "offer_id": "str", "old_price": "str", "price": "str", "price_strategy_enabled": "UNKNOWN", "product_id": int }] }` | `{ "result": [{ "product_id": int, "offer_id": "str", "updated": bool, "errors": [...] }] }` |

### Заказы (FBO и FBS)

| # | Метод | URL | Описание | Параметры запроса (body JSON) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| OZ-ORD-1 | POST | `/v3/posting/fbo/list` | Отправления FBO с фильтрами | `{ "dir": "ASC", "filter": { "since": "ISO8601", "to": "ISO8601", "status": "str" }, "limit": int, "offset": int, "with": { "analytics_data": bool, "financial_data": bool } }` | `{ "result": [{ "posting_number": "str", "order_id": int, "order_number": "str", "status": "str", "cancel_reason_id": int, "created_at": "ISO8601", "in_process_at": "ISO8601", "products": [{ "sku": int, "name": "str", "quantity": int, "offer_id": "str", "price": "str" }], "analytics_data": { ... }, "financial_data": { ... } }] }` |
| OZ-ORD-2 | POST | `/v3/posting/fbs/list` | Отправления FBS с фильтрами | `{ "dir": "ASC", "filter": { "since": "ISO8601", "to": "ISO8601", "status": "str", "warehouse_id": int }, "limit": int, "offset": int, "with": { "analytics_data": bool, "financial_data": bool, "barcodes": bool } }` | `{ "result": { "postings": [{ "posting_number": "str", "order_id": int, "order_number": "str", "status": "str", "cancel_reason_id": int, "created_at": "ISO8601", "in_process_at": "ISO8601", "products": [...], "analytics_data": { ... }, "financial_data": { ... }, "barcodes": { ... } }], "has_next": bool } }` |
| OZ-ORD-3 | POST | `/v3/posting/fbo/get` | Детали одного FBO-отправления | `{ "posting_number": "str", "with": { "analytics_data": bool, "financial_data": bool } }` | `{ "result": { "posting_number": "str", "order_id": int, ... } }` |
| OZ-ORD-4 | POST | `/v3/posting/fbs/get` | Детали одного FBS-отправления | `{ "posting_number": "str", "with": { "analytics_data": bool, "financial_data": bool, "barcodes": bool } }` | `{ "result": { "posting_number": "str", "order_id": int, ... } }` |

### Финансы

| # | Метод | URL | Описание | Параметры запроса (body JSON) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| OZ-FIN-1 | POST | `/v3/finance/transaction/list` | Список финансовых транзакций с пагинацией | `{ "filter": { "date": { "from": "ISO8601", "to": "ISO8601" }, "operation_type": [], "posting_number": "str", "transaction_type": "all" }, "page": int, "page_size": int }` | `{ "result": { "operations": [{ "operation_id": int, "operation_type": "str", "operation_type_name": "str", "operation_date": "ISO8601", "posting_number": "str", "amount": float, "type": "str", "items": [{ "name": "str", "sku": int }], "services": [{ "name": "str", "price": float }], "accruals_for_sale": float, "sale_commission": float, "delivery_charge": float, "return_delivery_charge": float, "items_count": int }], "page_count": int, "row_count": int } }` |
| OZ-FIN-2 | POST | `/v1/finance/cash-flow-statement/list` | Движение средств (Cash Flow Statement) по периоду | `{ "date": { "from": "ISO8601", "to": "ISO8601" } }` | `{ "result": { "cash_flow_statements": [{ "period_from": "ISO8601", "period_to": "ISO8601", "balance_at_start_period": float, "balance_at_end_period": float, "accruals_for_sale": float, "compensation_for_cancelled_orders": float, "services_amount": float, "amount_of_refunds": float, "payment_for_promotion": float, "other_accruals": float, "advance_payment_amount": float, "subscription_fee": float, "currency_code": "str" }] } }` |

### Возвраты

| # | Метод | URL | Описание | Параметры запроса (body JSON) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| OZ-RET-1 | POST | `/v3/returns/company/fbo` | Возвраты FBO | `{ "filter": { "posting_number": "str", "status": "str" }, "last_id": int, "limit": int }` | `{ "result": [{ "id": int, "posting_number": "str", "order_number": "str", "sku": int, "product_name": "str", "offer_id": "str", "status": "str", "price": float, "quantity": int, "created_at": "ISO8601", "is_moving": bool, "is_opened": bool }], "last_id": int, "count": int }` |
| OZ-RET-2 | POST | `/v3/returns/company/fbs` | Возвраты FBS | `{ "filter": { "posting_number": "str", "status": "str" }, "last_id": int, "limit": int }` | Аналогично OZ-RET-1 |

### Аналитика (Performance / Analytics API)

| # | Метод | URL | Описание | Параметры запроса (body JSON) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| OZ-ANL-1 | POST | `/v1/analytics/data` | Аналитика продаж по товарам за период | `{ "date_from": "YYYY-MM-DD", "date_to": "YYYY-MM-DD", "dimension": ["sku", "spu", "day"], "filters": [], "limit": int, "metrics": ["revenue", "ordered_units", "returns"], "offset": int, "sort": [{ "key": "str", "order": "ASC" }] }` | `{ "result": { "data": [{ "dimensions": [{ "id": "str", "name": "str" }], "metrics": [float] }], "totals": [float], "row_count": int }, "timestamp_from": int, "timestamp_to": int }` |
| OZ-ANL-2 | POST | `/v1/analytics/stock_on_warehouses` | Остатки на складах Ozon (FBO) с разбивкой | `{ "limit": int, "offset": int, "warehouse_type": "ALL|EXPRESS_DARK_STORE|NOT_EXPRESS_DARK_STORE" }` | `{ "result": { "rows": [{ "sku": int, "item_code": "str", "item_name": "str", "barcode": "str", "reserved_amount": int, "free_to_sell_amount": int, "projected_amount": int, "warehouse_name": "str", "promised_amount": int }], "total": int } }` |

---

## Yandex Market Partner API

Все запросы требуют заголовок `Authorization: Bearer <access_token>` или `Authorization: OAuth <token>` и заголовок `Accept: application/json`. Базовый URL: `https://api.partner.market.yandex.ru`.

Для большинства методов обязательны идентификаторы: `campaignId` (FBY/FBS кампания) или `businessId` (бизнес-аккаунт).

### Авторизация и кабинет

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| YM-AUTH-1 | GET | `/v2/campaigns` | Список кампаний (магазинов) в кабинете | query: `page` (int), `pageSize` (int) | `{ "campaigns": [{ "id": int, "domain": "str", "clientId": int, "business": { "id": int, "name": "str" } }], "pager": { "total": int, "from": int, "to": int } }` |
| YM-AUTH-2 | GET | `/v2/campaigns/{campaignId}` | Информация об одной кампании | path: `campaignId` | `{ "campaign": { "id": int, "domain": "str", "state": "str", "stateReasons": [], "placement": { "id": int, "name": "str" } } }` |
| YM-AUTH-3 | GET | `/v2/businesses` | Список бизнес-аккаунтов пользователя | — | `{ "result": { "businesses": [{ "id": int, "name": "str" }], "paging": { ... } } }` |

### Офферы (товары)

| # | Метод | URL | Описание | Параметры запроса (query/body) | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------------------|----------------------|
| YM-OFF-1 | POST | `/businesses/{businessId}/offer-mappings` | Список офферов бизнеса с данными маппинга (Яндекс Маркет ↔ продавец) | body: `{ "offerIds": ["str"], "vendorNames": ["str"], "categoryIds": [int] }`, query: `limit`, `page_token` | `{ "result": { "offerMappings": [{ "offer": { "offerId": "str", "name": "str", "category": "str", "vendor": "str", "vendorCode": "str", "barcodes": ["str"], "urls": ["str"], "pictures": ["str"], "price": { "value": float, "discountBase": float, "currencyId": "str" }, "availability": { "status": "str" } }, "mapping": { "marketSku": int, "categoryId": int, "marketSkuName": "str", "modelId": int, "marketModelName": "str" } }], "paging": { "nextPageToken": "str" } } }` |
| YM-OFF-2 | POST | `/businesses/{businessId}/offer-mappings/update` | Создать или обновить оффер | body: `{ "offerMappings": [{ "offer": { "offerId": "str", "name": "str", "category": "str", "vendor": "str", "price": { ... }, "description": "str", "pictures": ["str"] }, "mapping": { "marketSku": int } }] }` | `{ "status": "OK", "result": { "status": "str" } }` |
| YM-OFF-3 | POST | `/businesses/{businessId}/goods-feedback/updates` | Обратная связь по офферам | body: `{ "goodIds": [{ "marketSku": int }], "pageToken": "str", "limit": int }` | `{ "result": { "feedbacks": [...], "paging": { ... } } }` |

### Остатки

| # | Метод | URL | Описание | Параметры запроса (body) | Формат ответа (JSON) |
|---|-------|-----|----------|--------------------------|----------------------|
| YM-STK-1 | GET | `/campaigns/{campaignId}/warehouses` | Склады кампании (FBY и FBS) | query: `withTurnover` (bool) | `{ "result": { "warehouses": [{ "id": int, "name": "str", "stocks": { "count": int, "types": [{ "type": "FIT|DEFECT|QUARANTINE", "count": int }] } }] } }` |
| YM-STK-2 | PUT | `/campaigns/{campaignId}/offers/stocks` | Обновить остатки FBS по офферу на складе | body: `{ "skus": [{ "sku": "str", "warehouseId": int, "items": [{ "count": int, "type": "FIT" }] }] }` | `{ "status": "OK", "result": { "skus": [{ "sku": "str", "status": "OK|ERROR", "errors": [...] }] } }` |
| YM-STK-3 | POST | `/businesses/{businessId}/stocks` | Остатки FBY и FBS по офферам бизнеса | body: `{ "offerIds": ["str"], "pageToken": "str", "limit": int }`, header: `warehouse_id` | `{ "result": { "warehouses": [{ "warehouseId": int, "warehouseName": "str", "offers": [{ "offerId": "str", "updated": "ISO8601", "stocks": [{ "count": int, "type": "FIT" }] }] }], "paging": { "nextPageToken": "str" } } }` |

### Цены

| # | Метод | URL | Описание | Параметры запроса (body) | Формат ответа (JSON) |
|---|-------|-----|----------|--------------------------|----------------------|
| YM-PRC-1 | POST | `/campaigns/{campaignId}/offer-prices` | Цены по офферам в кампании (устаревший) | query: `page_token`, `limit`; body: `{ "offerIds": ["str"] }` | `{ "result": { "offers": [{ "id": "str", "price": { "value": float, "discountBase": float, "currencyId": "str" }, "updatedAt": "ISO8601" }], "paging": { "nextPageToken": "str" } } }` |
| YM-PRC-2 | POST | `/businesses/{businessId}/offer-prices/updates` | Обновить цены по офферам бизнеса | body: `{ "offers": [{ "id": "str", "price": { "value": float, "discountBase": float, "currencyId": "RUR" } }] }` | `{ "status": "OK" }` |
| YM-PRC-3 | GET | `/campaigns/{campaignId}/offer-prices` | Список цен кампании | query: `page_token`, `limit` | `{ "result": { "offers": [...], "paging": { ... } } }` |

### Заказы

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| YM-ORD-1 | GET | `/campaigns/{campaignId}/orders` | Список заказов кампании с фильтрами | query: `status` (PROCESSING|IN_DELIVERY|DELIVERED|CANCELLED), `supplierShipmentDateFrom` (DD-MM-YYYY), `supplierShipmentDateTo`, `limit`, `page_token` | `{ "orders": [{ "id": int, "status": "str", "substatus": "str", "creationDate": "DD-MM-YYYY", "updatedAt": "ISO8601", "currency": "str", "itemsTotal": float, "total": float, "deliveryTotal": float, "buyerItemsTotal": float, "buyerTotal": float, "paymentType": "str", "items": [{ "id": int, "offerName": "str", "marketSku": int, "shopSku": "str", "count": int, "prices": [{ "type": "str", "costPerItem": float }], "buyerPrice": float, "buyerPriceBeforeDiscount": float, "priceBeforeDiscount": float, "vat": "str" }], "delivery": { "type": "str", "serviceName": "str", "price": float, "region": { ... } } }], "pager": { "total": int, "from": int, "to": int } }` |
| YM-ORD-2 | GET | `/campaigns/{campaignId}/orders/{orderId}` | Детали конкретного заказа | path: `orderId` | Объект заказа как в YM-ORD-1 |
| YM-ORD-3 | PUT | `/campaigns/{campaignId}/orders/{orderId}/status` | Обновить статус заказа FBS | path: `orderId`; body: `{ "order": { "status": "PROCESSING", "substatus": "STARTED" } }` | `{ "order": { "id": int, "status": "str", ... } }` |

### Финансы и отчёты

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| YM-FIN-1 | GET | `/campaigns/{campaignId}/billing/balance` | Текущий баланс кабинета | — | `{ "result": { "balance": float, "currency": "str" } }` |
| YM-FIN-2 | POST | `/businesses/{businessId}/documents/orders/shipments` | Детализация выплат по отправкам за период | body: `{ "dateFrom": "DD-MM-YYYY", "dateTo": "DD-MM-YYYY", "limit": int, "pageToken": "str" }` | `{ "result": { "shipments": [{ "id": "str", "creationDate": "DD-MM-YYYY", "paymentDate": "DD-MM-YYYY", "payment": float, "orders": [{ "orderId": int, "costs": float, "payment": float }] }], "paging": { "nextPageToken": "str" } } }` |
| YM-FIN-3 | POST | `/campaigns/{campaignId}/stats/orders` | Финансовая статистика по заказам за период | body: `{ "dateFrom": "YYYY-MM-DD", "dateTo": "YYYY-MM-DD", "orderIds": [int], "statusList": ["DELIVERED"] }` | `{ "result": { "orders": [{ "id": int, "creationDate": "str", "statusUpdateDate": "str", "status": "str", "paymentType": "str", "partnerOrderId": "str", "initialItems": [...], "itemsTotal": float, "deliveryTotal": float, "subsidies": [...], "payments": [...], "commissions": [...] }] }, "errors": [...] }` |

### Возвраты

| # | Метод | URL | Описание | Параметры запроса | Формат ответа (JSON) |
|---|-------|-----|----------|-------------------|----------------------|
| YM-RET-1 | GET | `/campaigns/{campaignId}/orders/returns` | Список возвратов кампании | query: `type` (RETURN|UNREDEEMED), `status`, `limit`, `page_token` | `{ "result": { "returns": [{ "id": int, "orderId": int, "orderCreationDate": "YYYY-MM-DD", "creationDate": "YYYY-MM-DD", "updateDate": "YYYY-MM-DD", "refundStatus": "str", "logisticPickupPoint": { ... }, "shipmentRecipientType": "str", "shipmentStatus": "str", "returnType": "str", "fastReturn": bool, "items": [{ "marketSku": int, "shopSku": "str", "count": int, "title": "str", "pictures": ["str"], "supplierCompensation": float, "attributes": [{ "type": "str", "text": "str" }] }] }], "pager": { "total": int, "from": int, "to": int } } }` |
| YM-RET-2 | GET | `/campaigns/{campaignId}/orders/{orderId}/returns/{returnId}` | Детали конкретного возврата | path: `orderId`, `returnId` | Объект возврата как в YM-RET-1 |

### Аналитика (Yandex Direct / Market Statistics)

| # | Метод | URL | Описание | Параметры запроса (body) | Формат ответа (JSON) |
|---|-------|-----|----------|--------------------------|----------------------|
| YM-ANL-1 | POST | `/businesses/{businessId}/analytics/generate/goods-feedback-report` | Создать отчёт по отзывам на товары | body: `{ "dateFrom": "YYYY-MM-DD", "dateTo": "YYYY-MM-DD", "goodsRevenueAndExpensesDetails": "DAILY" }` | `{ "result": { "reportId": "str", "status": "PROCESSING|DONE|FAILED" } }` |
| YM-ANL-2 | GET | `/businesses/{businessId}/reports/info/{reportId}` | Проверить статус отчёта (polling) | path: `reportId` | `{ "result": { "status": "PROCESSING|DONE|FAILED", "subStatus": "str", "generationRequestedAt": "ISO8601", "generationFinishedAt": "ISO8601", "file": "url_str" } }` |
| YM-ANL-3 | POST | `/businesses/{businessId}/analytics/generate/goods-revenue-report` | Создать отчёт по выручке на товары | body: `{ "dateFrom": "YYYY-MM-DD", "dateTo": "YYYY-MM-DD", "businessId": int }` | `{ "result": { "reportId": "str" } }` |
| YM-ANL-4 | POST | `/campaigns/{campaignId}/stats/skus` | Статистика оборачиваемости и продаж по SKU | body: `{ "shopSkus": ["str"] }` | `{ "result": { "shopSkus": [{ "shopSku": "str", "marketSku": int, "name": "str", "price": float, "categoryId": int, "categoryName": "str", "brand": "str", "stocks": [{ "type": "FIT", "count": int }], "warehouses": [...], "tariffs": [...], "pictures": ["str"] }] }, "errors": [...] }` |

---

## Сводная карта аналогий

| Функциональный блок | WB метод | Ozon метод | Yandex Market метод |
|---------------------|----------|------------|---------------------|
| Информация о продавце | WB-AUTH-1 | OZ-AUTH-2 | YM-AUTH-1/2 |
| Список товаров | WB-CNT-1 | OZ-PRD-1/2 | YM-OFF-1 |
| Атрибуты товара | WB-CNT-4/5/6 | OZ-PRD-4/5 | встроено в оффер |
| Остатки FBY/FBO | WB-FBY-1/2/3 | OZ-STK-1 | YM-STK-3 |
| Остатки FBS | WB-STK-2 | OZ-STK-1/2 | YM-STK-2/3 |
| Розничные цены | WB-PRC-1 | OZ-PRC-1 | YM-PRC-1/3 |
| Заказы | WB-ORD-1/2, WB-STAT-1 | OZ-ORD-1/2 | YM-ORD-1/2 |
| Продажи / выкупы | WB-STAT-2 | OZ-ANL-1 | YM-ORD-1 (DELIVERED) |
| Возвраты | WB-STAT-2 (тип операции) | OZ-RET-1/2 | YM-RET-1/2 |
| Финансовые отчёты | WB-FIN-2/3/4 | OZ-FIN-1/2 | YM-FIN-2/3 |
| Баланс | WB-FIN-1 | OZ-FIN-2 | YM-FIN-1 |
| Асинхронные отчёты | WB-FBY-1/2/3 | polling через report code | YM-ANL-1/2/3 |

## Лимиты и пагинация

| Маркетплейс | Тип пагинации | Лимит запросов |
|-------------|---------------|----------------|
| WB Statistics | `dateFrom` (обновление) | ~10–20 запросов/мин |
| WB Content | cursor (`updatedAt` + `nmID`) | ~100 запросов/мин |
| WB Marketplace | offset / cursor `next` | ~60 запросов/мин |
| WB Finance | `rrdid` cursor, `limit` max 100 000 | ~10 запросов/мин |
| Ozon | `last_id` (строка) или `page`/`offset` | 1–6 запросов/сек (зависит от метода) |
| Yandex Market | `page_token` (строка) | 10–60 запросов/мин (зависит от endpoint group) |

## Права токена (минимальные)

| Маркетплейс | Необходимые права |
|-------------|-------------------|
| WB | Контент (чтение), Аналитика (чтение), Маркетплейс (чтение), Статистика (чтение), Финансы (чтение) |
| Ozon | Seller API key с правами: Склад, Продукты, Аналитика, Финансы |
| Yandex Market | OAuth токен кабинета или API-ключ с доступом к Partner API |
