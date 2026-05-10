export interface PageResult<TItem, TCursor = unknown> {
  items: TItem[]
  nextCursor?: TCursor | null
}

export async function* createCursorPaginator<TItem, TCursor>(
  initialCursor: TCursor | null,
  loadPage: (cursor: TCursor | null) => Promise<PageResult<TItem, TCursor>>
): AsyncGenerator<TItem[], void, void> {
  let cursor = initialCursor

  while (true) {
    const page = await loadPage(cursor)
    if (page.items.length > 0) yield page.items
    if (page.nextCursor === null || page.nextCursor === undefined) break
    cursor = page.nextCursor
  }
}

export async function* createOffsetPaginator<TItem>(
  loadPage: (offset: number, limit: number) => Promise<TItem[]>,
  options: { initialOffset?: number; limit?: number } = {}
): AsyncGenerator<TItem[], void, void> {
  const limit = options.limit ?? 100
  let offset = options.initialOffset ?? 0

  while (true) {
    const items = await loadPage(offset, limit)
    if (items.length === 0) break
    yield items
    if (items.length < limit) break
    offset += limit
  }
}

export async function* createIdContinuationPaginator<TItem, TId extends string | number>(
  initialId: TId,
  loadPage: (lastId: TId) => Promise<{ items: TItem[]; lastId?: TId | null }>
): AsyncGenerator<TItem[], void, void> {
  let lastId = initialId

  while (true) {
    const page = await loadPage(lastId)
    if (page.items.length === 0) break
    yield page.items
    if (page.lastId === null || page.lastId === undefined || page.lastId === lastId) break
    lastId = page.lastId
  }
}
