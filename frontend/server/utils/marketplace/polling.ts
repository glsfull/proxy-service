export interface PollAsyncReportOptions<TStatus> {
  intervalMs?: number
  timeoutMs?: number
  isReady: (status: TStatus) => boolean
  isFailed?: (status: TStatus) => boolean
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function pollAsyncReport<TStatus, TResult>(
  getStatus: () => Promise<TStatus>,
  download: (status: TStatus) => Promise<TResult>,
  options: PollAsyncReportOptions<TStatus>
): Promise<TResult> {
  const intervalMs = options.intervalMs ?? 3000
  const timeoutMs = options.timeoutMs ?? 120000
  const startedAt = Date.now()

  while (Date.now() - startedAt <= timeoutMs) {
    const status = await getStatus()
    if (options.isFailed?.(status)) {
      throw new Error('Async report failed')
    }
    if (options.isReady(status)) {
      return download(status)
    }
    await sleep(intervalMs)
  }

  throw new Error(`Async report polling timed out after ${timeoutMs}ms`)
}
