import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CURRENT_WORK, PLANNED_WORK, buildBaklog } from '../utils/baklog'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const target = resolve(repoRoot, 'baklog.md')

async function main() {
  const content = buildBaklog({
    generatedAt: new Date(),
    current: CURRENT_WORK,
    planned: PLANNED_WORK
  })
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, content, 'utf8')
  console.log(`baklog written to ${target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
