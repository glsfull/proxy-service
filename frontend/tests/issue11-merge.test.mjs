import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

assert.ok(existsSync(new URL('app/pages/dashboard.vue', root)), 'WB dashboard page must be merged into frontend/app')
assert.ok(existsSync(new URL('server/api/wb/validate-token.post.ts', root)), 'WB token validation API must be merged into frontend/server')
assert.ok(existsSync(new URL('app/pages/labels/index.vue', root)), 'existing label generator must remain available after merge')

const app = read('app/app.vue')
assert.match(app, /<UApp>/, 'Nuxt UI app wrapper is required')
assert.match(app, /<NuxtLayout>/, 'merged app must support layouts')

const labels = read('app/pages/labels/index.vue')
assert.match(labels, /labelSettings/, 'label generator settings must be preserved')
assert.match(labels, /productRows/, 'label generator product rows must be preserved')

console.log('issue 11 frontend merge regression passed')
