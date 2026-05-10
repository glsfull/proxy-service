import { getDb } from '../../utils/db'
import wbSpec from '../../marketplaces/specs/wildberries.json'
import ozonSpec from '../../marketplaces/specs/ozon.json'
import ymSpec from '../../marketplaces/specs/yandex-market.json'

type Period = 'today' | 'week' | 'month'
type MarketplaceId = 'wildberries' | 'ozon' | 'yandex-market'
type MarketplaceSpec = {
  capabilities: Record<string, boolean>
}

const marketplaceSpecs: Record<MarketplaceId, MarketplaceSpec> = {
  wildberries: wbSpec,
  ozon: ozonSpec,
  'yandex-market': ymSpec
}

const periodMultipliers: Record<Period, number> = {
  today: 0.16,
  week: 0.48,
  month: 1
}

const baseProducts = [
  { nmId: 172839405, chrtId: 95817362, srid: '6229152.0.0', vendorCode: 'WB-BAG-001', supplierArticle: 'BAG-001-GRF', brand: 'Nordway', category: 'Сумки', title: 'Сумка shopper с плотной ручкой', color: 'графит', size: 'ГОСТ 50', barcode: '2037618420011', price: 2490, retailPrice: 2190, purchasePrice: 1320, preparationCost: 95, stock: 184, fbyStock: 147, fbsStock: 37, inTransitToClient: 14, inTransitToWarehouse: 28, ordered: 76, bought: 61, returned: 4, rejected: 3, revenue: 151890, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=160&q=80' },
  { nmId: 238491770, chrtId: 11048312, srid: '6229152.1.0', vendorCode: 'WB-TEE-014', supplierArticle: 'TEE-014-WHT', brand: 'Urban Code', category: 'Футболки', title: 'Футболка базовая хлопковая', color: 'белый', size: 'ГОСТ 48', barcode: '2037618420144', price: 1190, retailPrice: 990, purchasePrice: 510, preparationCost: 55, stock: 342, fbyStock: 186, fbsStock: 156, inTransitToClient: 22, inTransitToWarehouse: 40, ordered: 132, bought: 104, returned: 9, rejected: 7, revenue: 123760, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80' },
  { nmId: 394857102, chrtId: 77361028, srid: '6229152.2.0', vendorCode: 'WB-COS-220', supplierArticle: 'COS-220-30', brand: 'Luma Lab', category: 'Косметика', title: 'Сыворотка увлажняющая 30 мл', color: 'прозрачный', size: '30 мл', barcode: '2037618420220', price: 890, retailPrice: 790, purchasePrice: 360, preparationCost: 40, stock: 96, fbyStock: 45, fbsStock: 51, inTransitToClient: 9, inTransitToWarehouse: 18, ordered: 58, bought: 45, returned: 2, rejected: 2, revenue: 40050, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=160&q=80' },
  { nmId: 583920144, chrtId: 29183746, srid: '6229152.3.0', vendorCode: 'WB-HOME-071', supplierArticle: 'HOME-071-GRY', brand: 'Home Line', category: 'Дом', title: 'Органайзер для кухни', color: 'серый', size: 'ГОСТ 44', barcode: '2037618420718', price: 1590, retailPrice: 1390, purchasePrice: 740, preparationCost: 70, stock: 67, fbyStock: 42, fbsStock: 25, inTransitToClient: 6, inTransitToWarehouse: 11, ordered: 41, bought: 31, returned: 5, rejected: 1, revenue: 49290, image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=160&q=80' }
]

const stockRows = [
  { scheme: 'FBY', warehouse: 'Коледино', barcode: '2037618420011', size: 'M', chrtId: 95817362, quantity: 84, reserved: 12 },
  { scheme: 'FBY', warehouse: 'Электросталь', barcode: '2037618420012', size: 'L', chrtId: 95817362, quantity: 63, reserved: 8 },
  { scheme: 'FBS', warehouse: 'Склад продавца Москва', barcode: '2037618420144', size: 'one size', chrtId: 11048312, quantity: 156, reserved: 19 },
  { scheme: 'FBS', warehouse: 'Склад продавца Казань', barcode: '2037618420220', size: '30 мл', chrtId: 77361028, quantity: 51, reserved: 6 }
]

const financeRows = [
  { date: '2026-05-04', operation: 'Продажа', brand: 'Nordway', nmId: 172839405, srid: '6229152.0.0', amount: 82140, commission: 13964, logistics: 5120, acquiring: 1260 },
  { date: '2026-05-04', operation: 'Продажа', brand: 'Urban Code', nmId: 238491770, srid: '6229152.1.0', amount: 67400, commission: 11458, logistics: 4380, acquiring: 980 },
  { date: '2026-05-03', operation: 'Возврат', brand: 'Home Line', nmId: 583920144, srid: '6229152.3.0', amount: -7950, commission: -1351, logistics: 780, acquiring: -110 },
  { date: '2026-05-02', operation: 'Эквайринг', brand: 'Luma Lab', nmId: 394857102, srid: '6229152.2.0', amount: -620, commission: 0, logistics: 0, acquiring: 620 }
]

export default defineEventHandler((event) => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const db = getDb()
  const session = db.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(sessionId) as any
  if (!session) throw createError({ statusCode: 401, message: 'Session expired' })

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(session.user_id) as any
  const query = getQuery(event)
  const requestedPeriod = String(query.period || 'month') as Period
  const period = requestedPeriod in periodMultipliers ? requestedPeriod : 'month'
  const multiplier = periodMultipliers[period]

  const requestedMarketplace = String(query.marketplace || 'wildberries') as MarketplaceId
  const marketplace = requestedMarketplace in marketplaceSpecs ? requestedMarketplace : 'wildberries'
  const spec = marketplaceSpecs[marketplace]
  const capabilities = spec.capabilities

  const products = baseProducts.map((product) => ({
    ...product,
    ordered: Math.round(product.ordered * multiplier),
    bought: Math.round(product.bought * multiplier),
    returned: Math.round(product.returned * multiplier),
    rejected: Math.round(product.rejected * multiplier),
    revenue: Math.round(product.revenue * multiplier)
  }))

  const totals = products.reduce((acc, product) => {
    acc.stock += product.stock
    acc.orders += product.ordered
    acc.buyouts += product.bought
    acc.returns += product.returned
    acc.rejections += product.rejected
    acc.sales += product.revenue
    return acc
  }, { balance: 384620, stock: 0, orders: 0, buyouts: 0, rejections: 0, returns: 0, sales: 0 })

  return {
    marketplace,
    capabilities,
    profile: {
      companyName: profile?.company_name || profile?.seller_name || 'Профиль WB',
      sellerId: profile?.seller_id || 'seller-demo',
      tokenConfigured: Boolean(profile?.wb_token)
    },
    period,
    updatedAt: new Date().toISOString(),
    totals,
    products: capabilities.products ? products : [],
    stocks: capabilities.stocks ? stockRows : [],
    finance: capabilities.finance ? financeRows : [],
    expenses: [
      { type: 'Закупка', amount: 94600, share: 47 },
      { type: 'Фулфилмент', amount: 28800, share: 14 },
      { type: 'Налоги', amount: 35100, share: 17 },
      { type: 'Реклама', amount: 27400, share: 13 },
      { type: 'Прочие', amount: 16800, share: 9 }
    ],
    sync: [
      { step: 'Баланс продавца', status: 'done', endpoint: 'finance-api.wildberries.ru/api/v1/account/balance', duration: '1.2 c' },
      { step: 'Карточки товаров', status: 'done', endpoint: 'content/v2/get/cards/list', duration: '9.4 c' },
      { step: 'Остатки FBY/FBS', status: 'running', endpoint: 'warehouse_remains + api/v3/stocks', duration: '18.7 c' },
      { step: 'Розничные цены', status: 'queued', endpoint: 'prices and discounts', duration: 'ожидает' },
      { step: 'Финансы', status: 'queued', endpoint: 'reports and acquiring', duration: 'ожидает' }
    ]
  }
})
